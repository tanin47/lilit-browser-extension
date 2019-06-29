package models.bindings

import scala.scalajs.js

trait Usage extends js.Object {
  def location: Location
  def definitionId: String
  def definitionJarOpt: js.UndefOr[Jar]
  def definitionLocationOpt: js.UndefOr[Location]
  def typeOpt: js.UndefOr[Type]
  def priority: Int
}
