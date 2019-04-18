package models.bindings

import scala.scalajs.js


trait Position extends js.Object {
  def line: Int
  def col: Int
}

trait Location extends js.Object {
  def path: String
  def start: Position
  def end: Position
}
