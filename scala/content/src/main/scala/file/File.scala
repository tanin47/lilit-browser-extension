package file

import models.{FileRequest, FileRequestRequest}
import org.scalajs.dom
import org.scalajs.dom.raw.HTMLElement

import scala.scalajs.js
import scala.scalajs.js.JSConverters._

object File {
  def apply(): Unit = {
    println(s"[Codelab] Process the page as a file: ${dom.window.location.href}")

    val permalinkElems = dom.document.querySelectorAll(".js-permalink-shortcut")
    if (permalinkElems.length == 0) {
      println("[Codelab] Unable to detect .js-permalink-shortcut. Do nothing")
      return
    }

    val permalinkElem = permalinkElems.item(0).asInstanceOf[HTMLElement]

    val permalinkTokens = permalinkElem.getAttribute("href").split("/")

    val repoName = s"${permalinkTokens(1)}/${permalinkTokens(2)}"
    val revision = permalinkTokens(4)
    val path = permalinkTokens.drop(5).mkString("/")

    val pathFromLocationHref = dom.window.location.href.split("/").drop(7).mkString("/")

    println(path)
    println(pathFromLocationHref)
    if (path != pathFromLocationHref) {
      println("[Codelab] The paths from .js-permalink-shortcut and window.location.href do not match. The new page hasn't finished loading yet. Do nothing.")
      return
    }

    if (!path.endsWith(".java")) {
      println("[Codelab] The file is not java. Do nothing")
      return
    }

    println(s"[Codelab] repo: $repoName, revision: $revision, file: $path")

    val branch = dom.window.location.href.split("/")(6)

    println("[Codelab] Fetch data")

    chrome.runtime.Runtime.sendMessage(
      message = new FileRequestRequest(repoName, Seq(new FileRequest(path = path, revision = revision)).toJSArray),
      responseCallback = js.Any.fromFunction1[Object, Unit] { resp =>
        println(s"Content receives resp $resp")
      }
    )

  }
}
