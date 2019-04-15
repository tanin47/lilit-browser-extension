package models.bindings

import scala.scalajs.js

class FileRequest(
  val path: String,
  val revision: String
) extends js.Object

class FileRequestRequest(
  val repoName: String,
  val files: js.Array[FileRequest]
) extends js.Object
