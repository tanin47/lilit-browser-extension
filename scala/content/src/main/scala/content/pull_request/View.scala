package content.pull_request

import content.MutationObserver
import content.MutationObserver.Options
import content.tokenizer.LineTokens
import models.bindings.{FileRequest, FileRequestRequest, FileRequestResponse}
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom.{Attr, Element}

import scala.scalajs.js
import scala.scalajs.js.JSConverters._
import org.scalajs.dom.ext._

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
  startRevision: String,
  endRevision: String,
  elem: Element
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

    println(s"[Codelab] Fetch data for ${fileRequests.map(_.path).distinct.mkString(", ")}")

    chrome.runtime.Runtime.sendMessage(
      message = new FileRequestRequest(repoName, fileRequests.toJSArray),
      responseCallback = js.defined { data =>
        println("[Codelab] Fetched data successfully.")

        val files = data.asInstanceOf[FileRequestResponse].files

        val fileByRevisionAndPath = files
          .groupBy { f => (f.revision, f.path) }
          .mapValues(_.head)

        diffElems.foreach { diffElem =>
          new DiffView(
            repoName = repoName,
            elem = diffElem.node,
            startRevisionData = DiffView.Data(
              revision = startRevision,
              lineTokens = LineTokens.build(fileByRevisionAndPath((startRevision, diffElem.path)))
            ),
            endRevisionData = DiffView.Data(
              revision = startRevision,
              lineTokens = LineTokens.build(fileByRevisionAndPath((endRevision, diffElem.path)))
            )
          )
        }
      }
    )
  }
}
