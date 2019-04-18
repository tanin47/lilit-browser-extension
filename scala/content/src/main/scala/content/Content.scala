package content

import chrome.webNavigation.bindings.OnCommittedDetails
import content.bindings.Tippy
import content.file.File
import content.pull_request.PullRequest
import org.scalajs.dom

import scala.scalajs.js

import scala.concurrent.ExecutionContext.Implicits.global

object Content {
  def main(args: Array[String]): Unit = {
    chrome.runtime.Runtime.onMessage.listen { message =>
      println(s"[Codelab] Content receives ${message.value.map(_.asInstanceOf[OnCommittedDetails].url)}")
      process()
    }

    process()
  }

  def process(): Unit = {
    println("[Codelab] Detect github")

    Tippy.setDefaults(new Tippy.SetDefaultsOptions {
      val animation = "fade"
      val boundary = "viewport"
      val interactive = true
      val maxWidth = 800
      val arrow = true
      val distance = 11
      val onShow = js.defined { instance =>
        Tippy.hideAll(new Tippy.HideAllOptions {
          val exclude = instance
        })
      }
    })

    val tokens = dom.window.location.href.split("/")

    chrome.storage2.Storage.local.clear()
      .foreach { _ =>
        if (tokens.length >= 6 && (tokens(5) == "blob" || tokens(5) == "tree")) {
          File.apply()
        } else if (tokens.length >= 6 && tokens(5) == "pull") {
          PullRequest.apply()
        } else {
          println("[Codelab] The page is neither a file nor a pull request.")
        }
      }
  }
}
