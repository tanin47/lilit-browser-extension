package content.bindings

import org.scalajs.dom.Element

import scala.scalajs.js
import scala.scalajs.js.annotation.{JSGlobal, JSImport}

@js.native
@JSImport("tippy.js/esm/index.all.js", JSImport.Default)
object Tippy extends js.Any {

  def apply(elem: Element): Unit = js.native

  trait Instance extends js.Object {

  }

  trait SetDefaultsOptions extends js.Object {
    def animation: js.UndefOr[String]
    def interactive: js.UndefOr[Boolean]
    def maxWidth: js.UndefOr[Int]
    def arrow: js.UndefOr[Boolean]
    def distance: js.UndefOr[Int]
    def onShow: js.UndefOr[js.Function1[Instance, Unit]]
  }

  def setDefaults(options: SetDefaultsOptions): Unit = js.native

  trait HideAllOptions extends js.Object {
    def exclude: js.UndefOr[Instance]
  }

  def hideAll(options: HideAllOptions):Unit = js.native
}
