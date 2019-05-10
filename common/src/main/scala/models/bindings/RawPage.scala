package models.bindings

import scala.scalajs.js

trait RawPage extends js.Object {
  def url: String
  def repoName: String
  def tpe: String
  def revisionOpt: js.UndefOr[String]
  def pathOpt: js.UndefOr[String]
  def startRevisionOpt: js.UndefOr[String]
  def endRevisionOpt: js.UndefOr[String]
  def missingRevisions: js.Array[String]
  def status: String
  def failureReasonOpt: js.UndefOr[String]
}
