package chrome.events.bindings

import scala.scalajs.js

@js.native
trait Rule extends js.Object {
  def id: js.UndefOr[String] = js.native
  def tags: js.UndefOr[js.Array[String]] = js.native
  def conditions: js.Array[js.Any] = js.native
  def actions: js.Array[js.Any] = js.native
  def priority: js.UndefOr[Int] = js.native
}
