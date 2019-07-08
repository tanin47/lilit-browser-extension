package models.bindings

import scala.scalajs.js

trait Type extends js.Object {
  def kind: String
  def name: js.UndefOr[String]
  def isWildcard: js.UndefOr[Boolean]
  def defIdOpt: js.UndefOr[String]
  def elemType: js.UndefOr[Type]
  def typeArguments: js.UndefOr[js.Array[Type]]
}
