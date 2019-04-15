package models.bindings

import scala.scalajs.js

trait Definition extends js.Object {
  def nodeId: String
  def module: String
  def jarIdOpt: js.UndefOr[Int]
  def locationOpt: js.UndefOr[Location]
//  def counts: js.Array[UsageCount]
}
