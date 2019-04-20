import chrome.cookies.GetCookieDetails
import chrome.declarativeContent.DeclarativeContent.PageStateMatcher.PageUrl
import chrome.declarativeContent.DeclarativeContent.{PageStateMatcher, ShowPageAction}
import chrome.events.Rule
import chrome.pageAction.bindings.SetIconDetails
import chrome.runtime.Runtime.Message
import chrome.tabs.bindings.TabQuery
import helpers.Config
import models.bindings.{BackgroundScriptRequest, FileRequestRequest, FileRequestResponse, SetIconRequest}
import org.scalajs.dom
import org.scalajs.dom.ext.{Ajax, AjaxException}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}
import scala.scalajs.js
import scala.scalajs.js.JSON
import scala.util.Success

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
        .foreach { req =>
          req.asInstanceOf[BackgroundScriptRequest].tpe match {
            case "FileRequestRequest" => processFileRequestRequest(req.asInstanceOf[FileRequestRequest], message)
            case "SetIconRequest" => processSetIconRequest(req.asInstanceOf[SetIconRequest], message)
          }
        }
    }
  }

  def processSetIconRequest(req: SetIconRequest, message: Message[Option[Any], Any]): Unit = {
    val iconPath = req.pageOpt
      .map { page =>
        if (page.missingRevisions.nonEmpty) {
          "images/warning-128.png"
        } else {
          page.status match {
            case "Loading" => "images/loading-128.png"
            case "Completed" => "images/success-128.png"
            case "Failed" => "images/warning-128.png"
          }
        }
      }
      .getOrElse("images/default-128.png")
    message.response(
      asyncResponse = message.sender.tab
        .map { tab =>
          chrome.pageAction.PageAction.setIcon(SetIconDetails(tab.id.get, path = iconPath))
        }
        .getOrElse(Future(())),
      failure = ()
    )
  }

  def processFileRequestRequest(req: FileRequestRequest, message: Message[Option[Any], Any]): Unit = {

    val future = for {
      host <- Config.getHost()
      userIdCookieOpt <- chrome.cookies.Cookies.get(GetCookieDetails(url = host, name = "user_id"))
      userSecretOpt <- chrome.cookies.Cookies.get(GetCookieDetails(url = host, name = "secret"))
      xhr <- Ajax
        .post(
          url = s"$host/github/${req.repoName}/fileRequests",
          data = JSON.stringify(js.Dynamic.literal(files = req.files)),
          headers = Map(
            "Content-Type" -> "application/json",
            "Accept" -> "application/json",
            "X-Lilit-Cookies" -> Seq(userIdCookieOpt, userSecretOpt).flatten.map { c => s"${c.name}=${c.value}" }.mkString(" ;")
          )
        )
    } yield {
      assert(xhr.status == 200)
      JSON.parse(xhr.responseText)
    }

    val futureWithRecover = future.recover {
      case e: AjaxException =>
        if (e.xhr.status == 404) {
          new FileRequestResponse {
            val success = false
            val files = js.Array()
            val unsupportedRepo = true
          }
        } else {
          new FileRequestResponse {
            val success = false
            val files = js.Array()
            val unsupportedRepo = false
          }
        }
    }

    message
      .response(
        asyncResponse = futureWithRecover,
        failure = {
          new FileRequestResponse {
            val success = false
            val files = js.Array()
            val unsupportedRepo = false
          }
        }
      )
  }
}
