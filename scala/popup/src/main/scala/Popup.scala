import chrome.tabs.bindings.{ReloadProperties, TabQuery}
import org.scalajs.dom
import org.scalajs.dom.raw.Event

import scala.concurrent.ExecutionContext.Implicits.global

object Popup {
  def main(args: Array[String]): Unit = {
    val reloadButton = dom.document.getElementById("reloadButton")

    reloadButton.addEventListener("click", { _: Event =>
      chrome.tabs.Tabs
        .query(TabQuery(active = true, currentWindow = true))
        .foreach { tabs =>
          tabs.headOption.foreach { tab => chrome.tabs.Tabs.reload(tab.id, ReloadProperties()) }
          chrome.runtime.Runtime.reload()
        }
    })
  }
}
