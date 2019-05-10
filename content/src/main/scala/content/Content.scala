package content

import content.bindings.Tippy
import content.file.File
import content.pull_request.PullRequest
import helpers.UrlHelper
import models.bindings.{ContentRequest, ContentResponse, ReprocessRequest, ReprocessResponse}
import org.scalajs.dom
import state.State

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.scalajs.js
import scala.scalajs.js.JSConverters._

object Content {
  val state = new State

  def main(args: Array[String]): Unit = {
    chrome.runtime.Runtime.onMessage.listen { message =>
      message.value
        .map(_.asInstanceOf[ContentRequest])
        .foreach {
          case msg if msg.tpe == ReprocessRequest.tpe =>
            println(s"[Lilit] Content receives ${msg.asInstanceOf[ReprocessRequest].details.url}")
            process()
            message.response(
              asyncResponse = Future(new ReprocessResponse {}),
              failure = ()
            )
          case msg if msg.tpe == ContentRequest.tpe =>
            println(s"[Lilit] Content receives ContentRequest from Popup")
            message.response(
              asyncResponse = Future(new ContentResponse {
                val page = state.getPage.map(_.toRaw).orUndefined
              }),
              failure = ()
            )
        }
    }

    process()
  }

  def process(): Unit = {
    println("[Lilit] Detect github")

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

    if (Content.state.getPage.exists { page => UrlHelper.isEquivalent(page.url, dom.window.location.href) }) {
      println(s"[Lilit] ${dom.window.location.href} is equivalent to the previous URL. Do nothing.")
      return
    }

    if (tokens.length >= 6 && (tokens(5) == "blob" || tokens(5) == "tree")) {
      File.apply()
    } else if (tokens.length >= 6 && tokens(5) == "pull") {
      PullRequest.apply()
    } else {
      state.setPage(None)
      println("[Lilit] The page is neither a file nor a pull request.")
    }
  }
}
