package content.pull_request

import content.bindings.MutationObserver
import content.bindings.MutationObserver.Options
import content.tokenizer.LineTokens
import models.bindings.{FileRequest, FileRequestRequest, FileRequestResponse}
import org.scalajs.dom
import org.scalajs.dom.Element
import org.scalajs.dom.ext._
import org.scalajs.dom.raw.HTMLElement
import storage.Storage
import storage.Storage.Status

import scala.concurrent.ExecutionContext.Implicits.global
import scala.scalajs.js
import scala.scalajs.js.JSConverters._
import scala.scalajs.js.JavaScriptException

object View {
  val PROCESSED_ATTR_NAME = "data-codelab-processed"
  val MONITORED_ATTR_NAME = "data-codelab-monitored"

  case class FileView(node: HTMLElement) {
    def path = {
      node.querySelector(".js-file-header").getAttribute("data-path")
    }
  }
}


class View(
  repoName: String,
  host: String,
  startRevision: String,
  endRevision: String,
  elem: HTMLElement
) {

  import View._

  val observer = new MutationObserver(
    fn = { (_, _) =>
      println("[Codelab] #files is mutated. Reprocessing.")
      run()
    }
  )

  observer.observe(
    elem,
    new Options {
      val childList = true
      val attributes = false
      val characterData = false
      val subtree = false
    }
  )

  run()

  private[this] def run(): Unit = {
    // Github might put .js-diff-progressive-container in another .js-diff-progressive-container.
    // We retry registering observer just to be sure.
    elem.querySelectorAll(".js-diff-progressive-container")
      .map(_.asInstanceOf[HTMLElement])
      .filter(_.getAttribute(MONITORED_ATTR_NAME) == null)
      .foreach { container =>
        container.setAttribute(MONITORED_ATTR_NAME, "true")
        observer.observe(
          container,
          new Options {
            val childList = true
            val attributes = false
            val characterData = false
            val subtree = false
          }
        )
      }

    val diffElems = {
      val fs = elem.querySelectorAll(".js-file")

      0.until(fs.length)
        .map { index => fs.item(index).asInstanceOf[HTMLElement] }
        .filter(_.getAttribute(PROCESSED_ATTR_NAME) == null)
        .flatMap { node =>
          node.setAttribute(PROCESSED_ATTR_NAME, "true")

          val diffView = FileView(node)

          if (diffView.path.endsWith(".java")) {
            Some(diffView)
          } else {
            None
          }
        }
    }

    if (diffElems.isEmpty) { return }

    val fileRequests = diffElems.flatMap { diffElem =>
      Seq(
        new FileRequest(path = diffElem.path, revision = startRevision),
        new FileRequest(path = diffElem.path, revision = endRevision)
      )
    }

    val pathLogLine = fileRequests.map(_.path).distinct.mkString(", ")
    println(s"[Codelab] Fetch data for $pathLogLine")

    chrome.runtime.Runtime.sendMessage(
      message = new FileRequestRequest(repoName, fileRequests.toJSArray),
      responseCallback = js.defined { data =>
        val resp = data.asInstanceOf[FileRequestResponse]

        if (resp.success) {
          println(s"[Codelab] Fetched data successfully: $pathLogLine.")

          val files = data.asInstanceOf[FileRequestResponse].files

          Storage.setMissingRevisions(files.filterNot(_.isSupported).map(_.revision).distinct)
            .foreach { _ =>
              try {
                val fileByRevisionAndPath = files
                  .groupBy { f => (f.revision, f.path) }
                  .mapValues(_.head)


                diffElems.foreach { diffElem =>
                  // The page might be navigated away.
                  if (elem.contains(diffElem.node)) {
                    new DiffView(
                      repoName = repoName,
                      path = diffElem.path,
                      host = host,
                      elem = diffElem.node,
                      startRevisionData = DiffView.Data(
                        revision = startRevision,
                        lineTokens = LineTokens.build(fileByRevisionAndPath((startRevision, diffElem.path)))
                      ),
                      endRevisionData = DiffView.Data(
                        revision = endRevision,
                        lineTokens = LineTokens.build(fileByRevisionAndPath((endRevision, diffElem.path)))
                      )
                    )
                  }
                }
                Storage.setCompleted()
                println(s"[Codelab] Rendered successfully: $pathLogLine.")
              } catch {
                case e: JavaScriptException =>
                  Storage.setFailed(None)
                  js.Dynamic.global.console.error(s"[Codelab] Failed to render: $pathLogLine.")
                  js.Dynamic.global.console.error(e.exception.asInstanceOf[js.Any])
              }
            }
        } else {
          println(s"[Codelab] Failed to fetch data: $pathLogLine")
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
    )
  }
}
