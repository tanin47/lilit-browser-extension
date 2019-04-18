package content.pull_request

import helpers.Config
import org.scalajs.dom
import org.scalajs.dom.raw.{HTMLElement, HTMLInputElement}
import storage.Storage
import storage.Storage.Page.PullRequestPage
import storage.Storage.Status

import scala.concurrent.ExecutionContext.Implicits.global

object PullRequest {
  def apply(): Unit = {
    println(s"[Codelab] Process the page as a pull request: ${dom.window.location.href}")

    val pathTokens = dom.window.location.pathname.split("/")

    if (!pathTokens.drop(5).headOption.contains("files")) {
      println("[Codelab] The tab 'Files changed' is not visible. Do nothing.")
      return
    }

    if (dom.document.querySelectorAll("input[name=comparison_start_oid]").length == 0) {
      println("[Codelab] Unable to detect input[name=compaison_start_oid]. Maybe the page hasn't finished loading yet. Do nothing.")
      return
    }

    val repoName = s"${pathTokens(1)}/${pathTokens(2)}"
    val startRevision = dom.document.querySelector("input[name=comparison_start_oid]").asInstanceOf[HTMLInputElement].value
    val endRevision = dom.document.querySelector("input[name=comparison_end_oid]").asInstanceOf[HTMLInputElement].value

    println(s"[Codelab] Base revision: $startRevision, target revision: $endRevision")

    val view = dom.document.querySelector("#files").asInstanceOf[HTMLElement]

    for {
      _ <- Storage.setPage(PullRequestPage(
        repoName = repoName,
        startRevision = startRevision,
        endRevision = endRevision,
        missingRevisions = Seq.empty,
        status = Status.Loading
      ))
      host <- Config.getHost()
    } yield {
      // The page might be navigated away.
      if (dom.document.body.contains(view)) {
        new View(
          repoName = repoName,
          host = host,
          startRevision = startRevision,
          endRevision = endRevision,
          elem = view
        )
      }
    }
  }
}
