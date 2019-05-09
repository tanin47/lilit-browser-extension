package models.bindings

import scala.scalajs.js

class PageUpdated(
  val pageOpt: js.UndefOr[RawPage],
  val tpe: String = "PageUpdated"
) extends MessageRequest
