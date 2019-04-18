package storage.bindings

import scala.scalajs.js

trait RawPage extends js.Object {
  def repoName: String
  def tpe: String
  def revisionOpt: js.UndefOr[String]
  def pathOpt: js.UndefOr[String]
  def startRevisionOpt: js.UndefOr[String]
  def endRevisionOpt: js.UndefOr[String]
  def missingRevisions: js.Array[String]
  def status: String
}