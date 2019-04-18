package chrome.storage2.bindings2

import scala.scalajs.js

trait StorageArea extends js.Any {
  def get(keys: js.UndefOr[js.Any], callback: js.Function1[js.Object, Unit]): Unit
  def set(keys: js.UndefOr[js.Object], callback: js.Function0[Unit]): Unit
  def clear(callback: js.Function0[Unit]): Unit
}
