import chrome.declarativeContent.DeclarativeContent.PageStateMatcher.PageUrl
import chrome.declarativeContent.DeclarativeContent.{PageStateMatcher, ShowPageAction}
import chrome.events.Rule
import models.FileRequestRequest
import org.scalajs.dom.ext.Ajax

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.scalajs.js
import scala.scalajs.js.JSON

object Background {
  def main(args: Array[String]): Unit = {
    chrome.runtime.Runtime.onInstalled.listen { _ =>
      chrome.declarativeContent.DeclarativeContent.onPageChanged.removeRules(None)
        .flatMap { _ =>
          chrome.declarativeContent.DeclarativeContent.onPageChanged.addRules(
            rules = Seq(Rule(
              conditions = Seq(PageStateMatcher(
                pageUrlOpt = Some(PageUrl(
                  hostEqualsOpt = Some("github.com")
                ))
              )),
              actions = Seq(ShowPageAction())
            ))
          )
        }
        .map { _ =>
          println("[Codelab] Page action is installed.")
        }
    }

    chrome.webNavigation.WebNavigation.onHistoryStateUpdated.listen { details =>
      chrome.tabs.Tabs.sendMessage(details.tabId, details)
    }

    chrome.runtime.Runtime.onMessage.listen { message =>
      message.value
        .map(_.asInstanceOf[FileRequestRequest])
        .foreach { request =>
          Ajax
            .post(
              url = s"http://localhost:9000/github/${request.repoName}/fileRequests",
              data = JSON.stringify(js.Dynamic.literal(files = request.files)),
              headers = Map(
                "Content-Type" -> "application/json",
                "Accept" -> "application/json"
              )
            )
            .map { xhr =>
              if (xhr.status == 200) {
                val data = JSON.parse(xhr.responseText)

                if (data.success.asInstanceOf[Boolean]) {
                  message.response(data.files)
                } else {

                }
              } else {

              }
            }
          message.response(js.Dynamic.literal(background = "hi"))
        }
    }
  }
}
