package content.pull_request

import content.Content
import helpers.{Config, UrlHelper}
import io.lemonlabs.uri.Url
import models.Page.Status
import models.PullRequestPage
import org.scalajs.dom
import org.scalajs.dom.raw.{HTMLElement, HTMLInputElement}

import scala.concurrent.ExecutionContext.Implicits.global

object PullRequest {
  def apply(): Unit = {
    println(s"[Lilit] Process the page as a pull request: ${dom.window.location.href}")

    val pathTokens = dom.window.location.pathname.split("/")

    if (!pathTokens.drop(5).headOption.contains("files")) {
      println("[Lilit] The tab 'Files changed' is not visible. Do nothing.")
      Content.state.setPage(None)
      return
    }

    val repoName = s"${pathTokens(1)}/${pathTokens(2)}"

    if (dom.document.querySelectorAll(".js-pull-refresh-on-pjax").length == 0) {
      println("[Lilit] Unable to detect '#files_bucket .js-pull-refresh-on-ajax'. Maybe the page hasn't finished loading yet. Do nothing.")
      return
    }

    val commitUrl = Url.parse(dom.document.querySelector(".js-pull-refresh-on-pjax").getAttribute("data-url"))
    val startRevision = commitUrl.query.param("base_commit_oid").getOrElse {
      println(s"[Lilit] Unable to read base_commit_oid from $commitUrl")
      throw new Exception(s"[Lilit] Unable to read base_commit_oid from $commitUrl")
    }
    val endRevision = commitUrl.query.param("end_commit_oid").getOrElse {
      println(s"[Lilit] Unable to read end_commit_oid from $commitUrl")
      throw new Exception(s"[Lilit] Unable to read end_commit_oid from $commitUrl")
    }

    println(s"[Lilit] Base revision: $startRevision, target revision: $endRevision")

    val view = dom.document.querySelector("#files").asInstanceOf[HTMLElement]

    val page = PullRequestPage(
      url = dom.window.location.href,
      repoName = repoName,
      startRevision = startRevision,
      endRevision = endRevision,
      missingRevisions = Seq.empty,
      status = Status.Loading,
      failureReasonOpt = None
    )

    Content.state.setPage(Some(page))

    for {
      host <- Config.getHost()
    } yield {
      println(s"[Lilit] Build ${page.id}.")
      if (Content.state.hasPage(page)) {
        new View(
          page = page,
          repoName = repoName,
          host = host,
          startRevision = startRevision,
          endRevision = endRevision,
          elem = view
        )
      } else {
        println(s"[Lilit] The page is changed from ${page.id} to ${Content.state.getPage.map(_.id)}. Halt.")
      }
    }
  }
}
