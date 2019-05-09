import chrome.tabs.bindings.{ReloadProperties, TabQuery}
import helpers.Config
import models.Page.Status
import models.{FilePage, Page, PullRequestPage}
import models.bindings.{ContentRequest, ContentResponse, MessageRequest}
import org.scalajs.dom
import org.scalajs.dom.ext.Ajax
import org.scalajs.dom.ext.Ajax.InputData
import org.scalajs.dom.raw.{Event, HTMLButtonElement, HTMLElement}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.scalajs.js
import scala.scalajs.js.JSON
import scala.scalajs.js.JSConverters._

object Popup {
  def main(args: Array[String]): Unit = {
    println("[Lilit] Popup is opened")
    chrome.management.Management.getSelf
      .map { self =>
        if (self.installType == "development") {
          val reloadButton = dom.document.createElement("button").asInstanceOf[HTMLButtonElement]
          reloadButton.innerHTML = "Reload code"

          dom.document.body.appendChild(reloadButton)

          reloadButton.addEventListener("click", { _: Event =>
            chrome.tabs.Tabs
              .query(TabQuery(active = true, currentWindow = true))
              .foreach { tabs =>
                for {
                  _ <- tabs.headOption
                    .map { tab => chrome.tabs.Tabs.reload(tab.id, ReloadProperties()) }
                    .getOrElse(Future(()))
                } yield {
                  chrome.runtime.Runtime.reload()
                }
              }
          })
        }
      }

    chrome.runtime.Runtime.onMessage.listen { message =>
      message.value
        .foreach { req =>
          req.asInstanceOf[MessageRequest].tpe match {
            case "PageUpdated" => update()
            case _ =>
          }
        }
    }

    update()
  }

  def update(): Unit = {
    for {
      host <- Config.getHost()
      pageOpt <- chrome.tabs.Tabs.query(TabQuery(active = true, currentWindow = true)).flatMap { tabs =>
        tabs.headOption.flatMap(_.id.toOption)
          .map { tabId =>
            chrome.tabs.Tabs.sendMessage(tabId, new ContentRequest).map { resp =>
              resp.asInstanceOf[ContentResponse].page.toOption.map { raw => Page.convert(raw) }
            }
          }
          .getOrElse(Future(None))
      }
    } yield {
      render(host, pageOpt)
      dom.document.body.style.display = "block"
    }
  }

  def registerRequestButton(host: String, page: Page): Unit = {
    val requestButton = dom.document.querySelector("#requestButton").asInstanceOf[HTMLElement]

    requestButton.addEventListener("click", { _: Event =>
      for {
        _ <- Ajax
          .post(
            url = s"$host/add",
            data = InputData.str2ajax(JSON.stringify(js.Dynamic.literal(
              repo = page.repoName,
              revisions = page.missingRevisions.toJSArray,
              rebuildJdk = false,
              rebuildRevision = false
            ))),
            headers = Map(
              "Content-Type" -> "application/json",
              "Accept" -> "application/json"
            )
          )
      } yield {
        dom.document.querySelector("#requestPanelSuccessMessage").asInstanceOf[HTMLElement].style.display = "block"
        requestButton.style.display = "none"
      }
    })
  }

  def render(host: String, pageOpt: Option[Page]): Unit = {
    js.Dynamic.global.console.log(pageOpt.asInstanceOf[js.Any])
    dom.document.querySelector("#host").innerHTML = host

    pageOpt.foreach { page =>
      registerRequestButton(host, page)
    }

    pageOpt match {
      case Some(file: FilePage) => renderFile(file)
      case Some(pull: PullRequestPage) => renderPullRequest(pull)
      case None => renderEmpty()
    }
  }

  def renderEmpty(): Unit = {
    dom.document.querySelector("#file").asInstanceOf[HTMLElement].style.display = "none"
    dom.document.querySelector("#pullRequest").asInstanceOf[HTMLElement].style.display = "none"
    dom.document.querySelector("#requestPanel").asInstanceOf[HTMLElement].style.display = "none"
    dom.document.querySelector("#statusText").innerHTML = "The page is inapplicable"
  }

  def renderFile(file: FilePage): Unit = {
    dom.document.querySelector("#file").asInstanceOf[HTMLElement].style.display = "block"
    dom.document.querySelector("#pullRequest").asInstanceOf[HTMLElement].style.display = "none"

    dom.document.querySelector("#fileRepo").innerHTML = file.repoName
    dom.document.querySelector("#filePath").innerHTML = file.path
    dom.document.querySelector("#fileRevision").innerHTML = file.revision.take(6)


    renderCommon(file)
  }

  def renderPullRequest(pull: PullRequestPage): Unit = {
    dom.document.querySelector("#file").asInstanceOf[HTMLElement].style.display = "none"
    dom.document.querySelector("#pullRequest").asInstanceOf[HTMLElement].style.display = "block"

    dom.document.querySelector("#pullRequestRepo").innerHTML = pull.repoName
    dom.document.querySelector("#pullRequestStartRevision").innerHTML = pull.startRevision.take(6)
    dom.document.querySelector("#pullRequestEndRevision").innerHTML = pull.endRevision.take(6)

    renderCommon(pull)
  }

  def renderCommon(page: Page): Unit = {
    dom.document.querySelector("#statusText").innerHTML = page.status.toString

    if (page.status == Status.Failed) {
      dom.document.querySelector("#failureReasonPanel").asInstanceOf[HTMLElement].style.display = "inline-block"

      dom.document.querySelector("#failureReasonText").innerHTML =
        page.failureReasonOpt.getOrElse("Please use 'inspect' on the background script (which can be found in Extensions) to see the reason.")
    }

    val requestPanel = dom.document.querySelector("#requestPanel").asInstanceOf[HTMLElement]

    if (page.missingRevisions.isEmpty) {
      requestPanel.style.display = "none"
      return
    }

    val commitText = page.missingRevisions.map(_.take(6)).mkString(" and ")
    requestPanel.querySelector("#commitText").innerHTML = commitText
    requestPanel.style.display = "block"
  }
}
