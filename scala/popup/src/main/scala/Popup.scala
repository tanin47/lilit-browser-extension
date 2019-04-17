import chrome.storage2
import chrome.storage2.Storage
import chrome.tabs.bindings.{ReloadProperties, TabQuery}
import helpers.Config
import org.scalajs.dom
import org.scalajs.dom.ext.Ajax
import org.scalajs.dom.ext.Ajax.InputData
import org.scalajs.dom.raw.{Event, HTMLButtonElement, HTMLElement}

import scala.scalajs.js.JSConverters._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.scalajs.js
import scala.scalajs.js.JSON

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

    render()
  }

  def registerRequestButton(host: String): Unit = {
    val requestButton = dom.document.querySelector("#requestButton")

    requestButton.addEventListener("click", { _: Event =>
      for {
        data <- storage2.Storage.local
          .get(Map(
            "repoName" -> "",
            "revision" -> "",
            "startRevision" -> "",
            "endRevision" -> "",
          ))
        _ <- Ajax
          .post(
            url = s"$host/secret-admin/add",
            data = InputData.str2ajax(JSON.stringify(js.Dynamic.literal(
              repo = data("repoName").asInstanceOf[String],
              revision = Seq(
                data("revision").asInstanceOf[String],
                data("startRevision").asInstanceOf[String],
                data("endRevision").asInstanceOf[String]
              ).filter(_.nonEmpty).toJSArray,
              rebuildJdk = false
            ))),
            headers = Map(
              "Content-Type" -> "application/json",
              "Accept" -> "application/json"
            )
          )
      } yield {
        ()
      }
    })

  }

  def render(): Unit = {
    Storage.local.get(Map("type" -> "")).foreach { result =>
      result.get("type") match {
        case Some(tpe) if tpe.asInstanceOf[String] == "file" => renderFile()
        case Some(tpe) if tpe.asInstanceOf[String] == "pull" => renderPullRequest()
        case None => renderEmpty()
      }
    }
  }

  def renderEmpty(): Unit = {
    dom.document.querySelector("#file").asInstanceOf[HTMLElement].style.display = "none"
    dom.document.querySelector("#pullRequest").asInstanceOf[HTMLElement].style.display = "none"
  }

  def renderFile(): Unit = {
    dom.document.querySelector("#file").asInstanceOf[HTMLElement].style.display = "block"
    dom.document.querySelector("#pullRequest").asInstanceOf[HTMLElement].style.display = "none"

    storage2.Storage.local.get(Map("repoName" -> "-", "path" -> "-", "revision" -> "-")).foreach { result =>
      dom.document.querySelector("#fileRepo").innerHTML = result.getOrElse("repoName", "-").asInstanceOf[String]
      dom.document.querySelector("#filePath").innerHTML = result.getOrElse("path", "-").asInstanceOf[String]
      dom.document.querySelector("#fileRevision").innerHTML = result.getOrElse("revision", "-").asInstanceOf[String]
    }
  }

  def renderPullRequest(): Unit = {
    dom.document.querySelector("#file").asInstanceOf[HTMLElement].style.display = "none"
    dom.document.querySelector("#pullRequest").asInstanceOf[HTMLElement].style.display = "block"

    storage2.Storage.local.get(Map("repoName" -> "-", "startRevision" -> "-", "endRevision" -> "-")).foreach { result =>
      dom.document.querySelector("#pullRequestRepo").innerHTML = result.getOrElse("repoName", "-").asInstanceOf[String]
      dom.document.querySelector("#pullRequestStartRevision").innerHTML = result.getOrElse("startRevision", "-").asInstanceOf[String]
      dom.document.querySelector("#pullRequestEndRevision").innerHTML = result.getOrElse("endRevision", "-").asInstanceOf[String]
    }

  }
}
