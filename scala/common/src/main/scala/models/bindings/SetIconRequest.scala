package models.bindings

import storage.bindings.RawPage

import scala.scalajs.js

class SetIconRequest(
  val pageOpt: js.UndefOr[RawPage],
  val tpe: String = "SetIconRequest"
) extends BackgroundScriptRequest
