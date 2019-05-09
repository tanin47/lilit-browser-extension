package content.file

import content.Content
import content.bindings.URLSearchParams
import content.tokenizer.LineTokens
import helpers.Config
import models.Page.Status
import models.bindings.{FileRequest, FileRequestRequest, FileRequestResponse}
import models.{FilePage, bindings}
import org.scalajs.dom
import org.scalajs.dom.raw.HTMLElement

import scala.concurrent.ExecutionContext.Implicits.global
import scala.scalajs.js
import scala.scalajs.js.JSConverters._
import scala.scalajs.js.JavaScriptException

object File {
  def apply(): Unit = {
    println(s"[Lilit] Process the page as a file: ${dom.window.location.href}")

    val permalinkElems = dom.document.querySelectorAll(".js-permalink-shortcut")
    if (permalinkElems.length == 0) {
      println("[Lilit] Unable to detect .js-permalink-shortcut. Do nothing")
      return
    }

    val permalinkElem = permalinkElems.item(0).asInstanceOf[HTMLElement]

    val permalinkTokens = permalinkElem.getAttribute("href").split("/")

    val repoName = s"${permalinkTokens(1)}/${permalinkTokens(2)}"
    val revision = permalinkTokens(4)
    val path = permalinkTokens.drop(5).mkString("/")

    val pathFromLocationHref = dom.window.location.pathname.split("/").drop(5).mkString("/")

    if (path != pathFromLocationHref) {
      println("[Lilit] The paths from .js-permalink-shortcut and window.location.href do not match. The new page hasn't finished loading yet. Do nothing.")
      return
    }

    if (!path.endsWith(".java")) {
      println("[Lilit] The file is not java. Do nothing")
      return
    }

    println(s"[Lilit] repo: $repoName, revision: $revision, file: $path")

    val branch = dom.window.location.href.split("/")(6)
    val selectedNodeIdOpt = new URLSearchParams(dom.window.location.search).get("p").toOption

    println("[Lilit] Fetch data")

    val currentPage = FilePage(
      repoName = repoName,
      revision = revision,
      path = path,
      missingRevisions = Seq.empty,
      status = Status.Loading,
      failureReasonOpt = None
    )

    Content.state.setPage(Some(currentPage))

    for {
      host <- Config.getHost()
    } yield {
      chrome.runtime.Runtime.sendMessage(
        message = new FileRequestRequest(repoName, Seq(new FileRequest(path = path, revision = revision)).toJSArray),
        responseCallback = js.defined { data =>
          if (Content.state.hasPage(currentPage)) {
            build(
              currentPage = currentPage,
              host = host,
              branch = branch,
              selectedNodeIdOpt = selectedNodeIdOpt,
              resp = data.asInstanceOf[bindings.FileRequestResponse]
            )
          } else {
            println(s"[Lilit] The page is changed from ${currentPage.id} to ${Content.state.getPage.map(_.id)}. Halt.")
          }
        }
      )
    }
  }

  def build(
    currentPage: FilePage,
    host: String,
    branch: String,
    selectedNodeIdOpt: Option[String],
    resp: FileRequestResponse
  ): Unit = {
    if (resp.success) {
      println("[Lilit] Fetched data successfully")

      Content.state.setMissingRevisions(currentPage, resp.files.filterNot(_.isSupported).map(_.revision).distinct)

      try {
        resp.files.foreach { file =>
          new View(
            repoName = currentPage.repoName,
            revision = currentPage.revision,
            path = file.path,
            host = host,
            branchOpt = Some(branch),
            selectedNodeIdOpt = selectedNodeIdOpt,
            lineTokensList = LineTokens.build(file)
          )
        }

        Content.state.complete(currentPage)
        println("[Lilit] Rendered the page successfully.")
      } catch {
        case e: JavaScriptException =>
          Content.state.fail(currentPage, None)
          js.Dynamic.global.console.error("[Lilit] Failed to render the page. See the below error:")
          js.Dynamic.global.console.error(e.exception.asInstanceOf[js.Any])
      }
    } else {
      println("[Lilit] Failed to fetch data")
      Content.state.fail(
        currentPage,
        if (resp.unsupportedRepo.contains(true)) {
          Some(
            s"""${currentPage.repoName} isn't supported. See what to do <a href="$host/unsupported-repo"  target="_blank">here</a>."""
          )
        } else {
          None
        }
      )
    }

  }
}
