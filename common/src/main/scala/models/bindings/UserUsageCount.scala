package models.bindings

import scala.scalajs.js

trait UserUsageCount extends js.Object {
  def mainPath: String
  def mainCount: Int
  def mainFirstLineOpt: js.UndefOr[Int]
  def otherCount: Int
  def otherFileCount: Int
  def otherFirstFilePathOpt: js.UndefOr[String]
  def otherFirstFileFirstLineOpt: js.UndefOr[Int]
}
