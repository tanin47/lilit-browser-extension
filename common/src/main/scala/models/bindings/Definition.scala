package models.bindings

import scala.scalajs.js

trait Definition extends js.Object {
  def id: String
  def locationOpt: js.UndefOr[Location]
}
