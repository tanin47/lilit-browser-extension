package chrome.cookies.bindings

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

@JSGlobal("chrome.cookies")
@js.native
object Cookies extends js.Any {
  def get(details: GetCookieDetails, callback: js.Function1[js.UndefOr[Cookie], Unit]): Unit = js.native
}

trait GetCookieDetails extends js.Object {
  def url: String
  def name: String
  def storeId: js.UndefOr[String]
}

trait Cookie extends js.Object {
  def name: String
  def value: String
}
