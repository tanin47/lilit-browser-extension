package models.bindings

import scala.scalajs.js

trait Type extends js.Object {
  def kind: String
  def name: js.UndefOr[String]
  def isWildcard: js.UndefOr[Boolean]
  def defIdOpt: js.UndefOr[String]
  def elemType: js.UndefOr[Type]
  def superBoundTypeOpt: js.UndefOr[Type]
  def eventualBoundTypes: js.UndefOr[js.Array[Type]]
  def typeArguments: js.UndefOr[js.Array[Type]]
}
