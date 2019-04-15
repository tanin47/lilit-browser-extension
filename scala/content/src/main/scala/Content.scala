import chrome.webNavigation.bindings.OnCommittedDetails
import file.File
import models.FileRequestRequest
import org.scalajs.dom

import scala.scalajs.js
import scala.scalajs.js.JSConverters._

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
    val tokens = dom.window.location.href.split("/")

    if (tokens.length >= 4 && (tokens(5) == "blob" || tokens(5) == "tree")) {
      File.apply()
    } else if (tokens.length >= 4 && tokens(5) == "pull") {

    } else {
      println("[Codelab] The page is neither a file nor a pull request.")
    }
  }
}
