package models.bindings

import scala.scalajs.js

trait Jar extends js.Object {
  def id: Int
  def group: String
  def artifact: String
  def version: String
}
