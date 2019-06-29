package models.bindings

import scala.scalajs.js

trait Annotation extends js.Object {
  def location: Location
  def paramName: String
  def isVariableLength: Boolean
  def priority: Int
}
