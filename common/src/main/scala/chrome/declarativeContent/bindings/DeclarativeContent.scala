package chrome.declarativeContent.bindings

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

@JSGlobal("chrome.declarativeContent")
@js.native
object DeclarativeContent extends js.Object {

  @js.native
  object onPageChanged extends js.Object {
    def removeRules(rules: js.UndefOr[js.Array[String]], callback: js.UndefOr[js.Function0[_]]): Unit = js.native
    def addRules(rules: js.Array[chrome.events.bindings.Rule], callback: js.UndefOr[js.Function0[_]]): Unit = js.native
  }

  @js.native
  class PageStateMatcher(
    val options: js.UndefOr[js.Object] = js.undefined
  ) extends js.Object {
  }

  @js.native
  class ShowPageAction extends js.Object {

  }
}
