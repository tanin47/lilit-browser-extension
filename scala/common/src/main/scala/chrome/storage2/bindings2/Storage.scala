package chrome.storage2.bindings2

import scala.scalajs.js
import scala.scalajs.js.annotation.JSGlobal

object Storage {
  @JSGlobal("chrome.storage.local")
  @js.native
  object local extends StorageArea {
    def get(keys: js.UndefOr[js.Any], callback: js.Function1[js.Object, Unit]): Unit = js.native
    def set(keys: js.UndefOr[js.Object], callback: js.Function0[Unit]): Unit = js.native
    def clear(callback: js.Function0[Unit]): Unit = js.native
  }
}
