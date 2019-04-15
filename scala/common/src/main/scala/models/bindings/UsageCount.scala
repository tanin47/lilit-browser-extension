package models.bindings

import scala.scalajs.js

trait UsageCount extends js.Object {
  def module: String
  def jarOpt: js.UndefOr[Jar]
  def path: String
  def count: Int
}
