package models.bindings

import scala.scalajs.js

trait UsageDefinition extends js.Object {
  def nodeId: String
  def module: String
  def jarOpt: js.UndefOr[Jar]
  def locationOpt: js.UndefOr[Location]
}

trait Definition extends js.Object {
  def nodeId: String
  def module: String
  def jarIdOpt: js.UndefOr[Int]
  def locationOpt: js.UndefOr[Location]
  def count: UserUsageCount
}
