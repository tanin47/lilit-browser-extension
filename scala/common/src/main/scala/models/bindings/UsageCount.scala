package models.bindings

import scala.scalajs.js

trait UsageCount extends js.Object {
  def nodeId: String
  def module: String
  def count: Int
  def fileCount: Int
  def firstJarOpt: js.UndefOr[Jar]
  def firstPath: String
}
