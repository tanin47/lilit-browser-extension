package content.pull_request

import content.Content
import content.bindings.MutationObserver
import content.bindings.MutationObserver.Options
import content.tokenizer.LineTokens
import models.{Page, PullRequestPage}
import models.bindings.{FileRequest, FileRequestRequest, FileRequestResponse}
import org.scalajs.dom.ext._
import org.scalajs.dom.raw.HTMLElement

import scala.collection.mutable
import scala.scalajs.js
import scala.scalajs.js.JSConverters._
import scala.scalajs.js.JavaScriptException

object View {
  case class FileView(node: HTMLElement) {
    def path = {
      node.querySelector(".js-file-header").getAttribute("data-path")
    }
  }
}


class View(
  page: PullRequestPage,
  repoName: String,
  host: String,
  startRevision: String,
  endRevision: String,
  elem: HTMLElement
) {

  import View._

  val queriedFilePaths = mutable.Set.empty[String]

  val observer = new MutationObserver(
    fn = { (_, _) =>
      println("[Lilit] #files is mutated. Reprocessing.")
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
      .foreach { container =>
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

    val diffElemGroups = {
      val fs = elem.querySelectorAll(".js-file")

      0.until(fs.length)
        .map { index => fs.item(index).asInstanceOf[HTMLElement] }
        .flatMap { node =>
          val diffView = FileView(node)

          if (diffView.path.endsWith(".java") && !queriedFilePaths.contains(diffView.path)) {
            queriedFilePaths.add(diffView.path)
            Some(diffView)
          } else {
            None
          }
        }
        .grouped(20)
    }

    if (diffElemGroups.isEmpty) {
      println("[Lilit] No diff elements. Complete. This is because Github caches the page.")
      Content.state.complete(page)
      return
    }

    diffElemGroups.foreach { diffElems =>
      val fileRequests = diffElems
        .flatMap { diffElem =>
          Seq(
            new FileRequest(path = diffElem.path, revision = startRevision),
            new FileRequest(path = diffElem.path, revision = endRevision)
          )
        }

      val pathLogLine = fileRequests.map(_.path).distinct.mkString(", ")
      println(s"[Lilit] Fetch data for $pathLogLine")

      chrome.runtime.Runtime.sendMessage(
        message = new FileRequestRequest(repoName, fileRequests.toJSArray),
        responseCallback = js.defined { data =>
          if (Content.state.hasPage(page)) {
            build(
              page = page,
              resp = data.asInstanceOf[FileRequestResponse],
              diffElems = diffElems,
              pathLogLine = pathLogLine
            )
          } else {
            println(s"[Lilit] The page is changed from ${page.id} to ${Content.state.getPage.map(_.id)}. Halt.")
          }
        }
      )
    }
  }

  def build(
    page: PullRequestPage,
    resp: FileRequestResponse,
    diffElems: Seq[FileView],
    pathLogLine: String
  ): Unit = {
    if (resp.success) {
      println(s"[Lilit] Fetched data successfully: $pathLogLine.")

      val files = resp.files

      Content.state.setMissingRevisions(page, files.filterNot(_.isSupported).map(_.revision).distinct)

      try {
        val fileByRevisionAndPath = files
          .groupBy { f => (f.revision, f.path) }
          .mapValues(_.head)

        diffElems.foreach { diffElem =>
          // The page might be navigated away.
          if (elem.contains(diffElem.node)) {
            val v = new DiffView(
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

            v.run()
          }
        }

        Content.state.complete(page)
        println(s"[Lilit] Rendered successfully: $pathLogLine.")
      } catch {
        case e: JavaScriptException =>
          Content.state.fail(page, None)
          js.Dynamic.global.console.error(s"[Lilit] Failed to render: $pathLogLine.")
          js.Dynamic.global.console.error(e.exception.asInstanceOf[js.Any])
      }
    } else {
      println(s"[Lilit] Failed to fetch data: $pathLogLine")
      Content.state.fail(
        page,
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
