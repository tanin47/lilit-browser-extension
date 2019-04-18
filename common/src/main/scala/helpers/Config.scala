package helpers

import org.scalajs.dom.ext.Ajax

import scala.concurrent.{Future, Promise}
import scala.scalajs.js.JSON
import scala.util.Success

import scala.concurrent.ExecutionContext.Implicits.global

object Config {
  def getHost(): Future[String] = {
    val promise = Promise[String]()

    Ajax
      .get(chrome.runtime.Runtime.getURL("config.json"))
      .foreach { xhr =>
        promise.complete(Success(JSON.parse(xhr.responseText).host.asInstanceOf[String]))
      }

    promise.future
  }

}
