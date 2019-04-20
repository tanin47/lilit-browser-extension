package content.file

import chrome.cookies.GetCookieDetails
import content.bindings.URLSearchParams
import content.tokenizer.LineTokens
import helpers.Config
import models.bindings
import models.bindings.{FileRequest, FileRequestRequest}
import org.scalajs.dom
import org.scalajs.dom.raw.HTMLElement
import storage.Storage
import storage.Storage.Page.FilePage
import storage.Storage.Status

import scala.concurrent.ExecutionContext.Implicits.global
import scala.scalajs.js
import scala.scalajs.js.JSConverters._
import scala.scalajs.js.JavaScriptException

object File {
  def apply(): Unit = {
    println(s"[Codelab] Process the page as a file: ${dom.window.location.href}")

    val permalinkElems = dom.document.querySelectorAll(".js-permalink-shortcut")
    if (permalinkElems.length == 0) {
      println("[Codelab] Unable to detect .js-permalink-shortcut. Do nothing")
      return
    }

    val permalinkElem = permalinkElems.item(0).asInstanceOf[HTMLElement]

    val permalinkTokens = permalinkElem.getAttribute("href").split("/")

    val repoName = s"${permalinkTokens(1)}/${permalinkTokens(2)}"
    val revision = permalinkTokens(4)
    val path = permalinkTokens.drop(5).mkString("/")

    val pathFromLocationHref = dom.window.location.pathname.split("/").drop(5).mkString("/")

    if (path != pathFromLocationHref) {
      println("[Codelab] The paths from .js-permalink-shortcut and window.location.href do not match. The new page hasn't finished loading yet. Do nothing.")
      return
    }

    if (!path.endsWith(".java")) {
      println("[Codelab] The file is not java. Do nothing")
      return
    }

    println(s"[Codelab] repo: $repoName, revision: $revision, file: $path")

    val branch = dom.window.location.href.split("/")(6)
    val selectedNodeIdOpt = new URLSearchParams(dom.window.location.search).get("p").toOption

    println("[Codelab] Fetch data")

    val currentPage = FilePage(
      repoName = repoName,
      revision = revision,
      path = path,
      missingRevisions = Seq.empty,
      status = Status.Loading,
      failureReasonOpt = None
    )

    for {
      host <- Config.getHost()
      _ <- Storage.setPage(currentPage)
    } yield {
      chrome.runtime.Runtime.sendMessage(
        message = new FileRequestRequest(repoName, Seq(new FileRequest(path = path, revision = revision)).toJSArray),
        responseCallback = js.defined { data =>
          Storage.getPage()
            // The page might be navigated away.
            .filter(_.contains(currentPage))
            .foreach { _ =>
              val resp = data.asInstanceOf[bindings.FileRequestResponse]

              if (resp.success) {
                println("[Codelab] Fetched data successfully")

                Storage
                  .setMissingRevisions(resp.files.filterNot(_.isSupported).map(_.revision).distinct)
                  .foreach { _ =>
                    try {
                      resp.files.foreach { file =>
                        new View(
                          repoName = repoName,
                          revision = revision,
                          path = file.path,
                          host = host,
                          branchOpt = Some(branch),
                          selectedNodeIdOpt = selectedNodeIdOpt,
                          lineTokensList = LineTokens.build(file)
                        )
                      }
                      Storage.setCompleted()
                      println("[Codelab] Rendered the page successfully.")
                    } catch {
                      case e: JavaScriptException =>
                        Storage.setFailed(None)
                        js.Dynamic.global.console.error("[Codelab] Failed to render the page. See the below error:")
                        js.Dynamic.global.console.error(e.exception.asInstanceOf[js.Any])
                    }
                  }
              } else {
                println("[Codelab] Failed to fetch data")
                Storage.setFailed(
                  if (resp.unsupportedRepo.contains(true)) {
                    Some(
                      s"""$repoName isn't supported. See what to do <a href="$host/unsupported-repo"  target="_blank">here</a>."""
                    )
                  } else {
                    None
                  }
                )
              }
            }
        }
      )
    }
  }
}
