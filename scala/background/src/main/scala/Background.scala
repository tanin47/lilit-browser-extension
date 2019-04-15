import chrome.declarativeContent.DeclarativeContent.PageStateMatcher.PageUrl
import chrome.declarativeContent.DeclarativeContent.{PageStateMatcher, ShowPageAction}
import chrome.events.Rule

import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.scalajs.js

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
      println(s"[Codelab] Background receives: ${message.value.asInstanceOf[js.Object]}")

      message.response(js.Dynamic.literal(background = "hi"))
    }

    try {
      throw new Exception()
    } catch {
      case e: Exception => e.printStackTrace()
    }
  }
}
