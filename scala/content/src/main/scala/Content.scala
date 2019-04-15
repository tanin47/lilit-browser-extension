import chrome.webNavigation.bindings.OnCommittedDetails

import scala.scalajs.js

object Content {
  def main(args: Array[String]): Unit = {
    chrome.runtime.Runtime.onMessage.listen { message =>
      println(s"[Codelab] Content receives ${message.value.map(_.asInstanceOf[OnCommittedDetails].url)}")

      println(s"[Codelab] Send message")
      chrome.runtime.Runtime.sendMessage(
        message = js.Dynamic.literal(content = "hello"),
        responseCallback = js.Any.fromFunction1[Object, Unit] { resp =>
          println(s"Content receives resp ${resp}")
        }
      )
    }
  }
}
