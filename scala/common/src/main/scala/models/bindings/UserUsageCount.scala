package models.bindings

import scala.scalajs.js

trait UserUsageCount extends js.Object {
  def mainPath: String
  def mainCount: Int
  def otherCount: Int
  def otherFileCount: Int
  def otherFirstFilePathOpt: js.UndefOr[String]
}
