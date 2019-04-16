package content

import content.MutationObserver.Options
import org.scalajs.dom.Element

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

object MutationObserver {
  trait Options extends js.Object {
    def childList: Boolean
    def attributes: Boolean
    def characterData: Boolean
    def subtree: Boolean
  }
}

@JSGlobal("window.MutationObserver")
@js.native
class MutationObserver(fn: js.Function2[js.Any, js.Any, js.Any]) extends js.Any {
  def observe(elem: Element, options: Options): Unit = js.native
}
