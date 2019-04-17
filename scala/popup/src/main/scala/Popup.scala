import chrome.tabs.bindings.{ReloadProperties, TabQuery}
import helpers.Config
import org.scalajs.dom
import org.scalajs.dom.ext.Ajax
import org.scalajs.dom.ext.Ajax.InputData
import org.scalajs.dom.raw.{Event, HTMLButtonElement, HTMLElement}
import storage.Storage
import storage.Storage.Page
import storage.Storage.Page.{FilePage, PullRequestPage}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.scalajs.js
import scala.scalajs.js.JSON

import scala.scalajs.js.JSConverters._

object Popup {
  def main(args: Array[String]): Unit = {
    println("[Codelab] Popup is opened")
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

    Config.getHost()
      .foreach { host =>
        dom.document.querySelector("#host").innerHTML = host
        registerRequestButton(host)
      }

    chrome.storage.Storage.onChanged.listen { _ =>
      render()
    }

    render()
  }

  def registerRequestButton(host: String): Unit = {
    val requestButton = dom.document.querySelector("#requestButton").asInstanceOf[HTMLElement]

    requestButton.addEventListener("click", { _: Event =>
      for {
        page <- Storage.getPage().map(_.get)
        _ <- Ajax
          .post(
            url = s"$host/secret-admin/add",
            data = InputData.str2ajax(JSON.stringify(js.Dynamic.literal(
              repo = page.repoName,
              revisions = page.missingRevisions.toJSArray,
              rebuildJdk = false
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

  def render(): Unit = {
    Storage.getPage().foreach {
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

    dom.document.querySelector("#statusText").innerHTML = file.status.toString

    renderRequestPanel(file)
  }

  def renderPullRequest(pull: PullRequestPage): Unit = {
    dom.document.querySelector("#file").asInstanceOf[HTMLElement].style.display = "none"
    dom.document.querySelector("#pullRequest").asInstanceOf[HTMLElement].style.display = "block"

    dom.document.querySelector("#pullRequestRepo").innerHTML = pull.repoName
    dom.document.querySelector("#pullRequestStartRevision").innerHTML = pull.startRevision.take(6)
    dom.document.querySelector("#pullRequestEndRevision").innerHTML = pull.endRevision.take(6)

    dom.document.querySelector("#statusText").innerHTML = pull.status.toString

    renderRequestPanel(pull)
  }

  def renderRequestPanel(page: Page.Value): Unit = {
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
