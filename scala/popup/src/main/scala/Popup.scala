import chrome.tabs.bindings.{ReloadProperties, TabQuery}
import helpers.Config
import org.scalajs.dom
import org.scalajs.dom.ext.Ajax
import org.scalajs.dom.raw.{Event, HTMLButtonElement}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object Popup {
  def main(args: Array[String]): Unit = {
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
      }
  }
}
