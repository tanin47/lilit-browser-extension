package content.bindings

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal


@JSGlobal("window.URLSearchParams")
@js.native
class URLSearchParams(query: String) extends js.Any {
  def get(name: String): js.UndefOr[String] = js.native
}
