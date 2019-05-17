package models.bindings

import scala.scalajs.js

trait UsageDefinition extends js.Object {
  def id: String
  def jarOpt: js.UndefOr[Jar]
  def locationOpt: js.UndefOr[Location]
}

trait Definition extends js.Object {
  def id: String
  def locationOpt: js.UndefOr[Location]
}
