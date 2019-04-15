package models.bindings

import scala.scalajs.js

object FileRequestResponse {
  trait File extends js.Object {
    def revision: String
    def path: String
    def usages: js.Array[Usage]
    def definitions: js.Array[Definition]
  }
}

trait FileRequestResponse extends js.Object {
  def files: js.Array[FileRequestResponse.File]
}
