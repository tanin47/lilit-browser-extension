import chrome.tabs.bindings.{ReloadProperties, TabQuery}
import org.scalajs.dom
import org.scalajs.dom.raw.Event

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

object Popup {
  def main(args: Array[String]): Unit = {
    println("Hello popup")
//    val reloadButton = dom.document.getElementById("reloadButton")
//
//    reloadButton.addEventListener("click", { _: Event =>
//      chrome.tabs.Tabs
//        .query(TabQuery(active = true, currentWindow = true))
//        .foreach { tabs =>
//          for {
//            _ <- tabs.headOption
//              .map { tab => chrome.tabs.Tabs.reload(tab.id, ReloadProperties()) }
//              .getOrElse(Future(()))
//          } yield {
//            chrome.runtime.Runtime.reload()
//          }
//        }
//    })
  }
}
