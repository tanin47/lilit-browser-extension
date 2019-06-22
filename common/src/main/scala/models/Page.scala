package models

import models.bindings.RawPage

import scala.scalajs.js
import scala.scalajs.js.JSConverters._

object Page {
  var id = 0
  def getId = {
    id += 1
    id
  }

  object Status {
    sealed trait Value
    object Loading extends Value {
      override def toString = "Loading"
    }
    object Completed extends Value {
      override def toString = "Completed"
    }
    object Failed extends Value {
      override def toString = "Failed"
    }

    def convert(s: String): Value = s match {
      case "Loading" => Loading
      case "Completed" => Completed
      case "Failed" => Failed
    }
  }

  def convert(raw: RawPage): Page = {
    raw.tpe match {
      case "file" => FilePage(
        url = raw.url,
        repoName = raw.repoName,
        revision = raw.revisionOpt.get,
        path = raw.pathOpt.get,
        missingRevisions = raw.missingRevisions.toSeq,
        status = Status.convert(raw.status),
        failureReasonOpt = raw.failureReasonOpt.toOption)
      case "pull" => PullRequestPage(
        url = raw.url,
        repoName = raw.repoName,
        startRevision = raw.startRevisionOpt.get,
        endRevision = raw.endRevisionOpt.get,
        missingRevisions = raw.missingRevisions.toSeq,
        status = Status.convert(raw.status),
        failureReasonOpt = raw.failureReasonOpt.toOption)
    }
  }
}

sealed trait Page {
  def repoName: String
  def url: String
  def id: Int

  var missingRevisions: Seq[String]
  var status: Page.Status.Value
  var failureReasonOpt: Option[String]

  def loading(): Unit = {
    println(s"Set loading $id")
    status = Page.Status.Loading
  }

  def complete(): Unit = {
    println(s"Set completed $id")
    status = Page.Status.Completed
  }

  def fail(reasonOpt: Option[String]): Unit = {
    status = Page.Status.Failed
    failureReasonOpt = reasonOpt
  }

  def setMissingRevisions(newMissingRevisions: Seq[String]): Unit = {
    missingRevisions = newMissingRevisions
  }

  def toRaw: RawPage
}

case class FilePage(
  url: String,
  repoName: String,
  revision: String,
  path: String,
  var missingRevisions: Seq[String],
  var status: Page.Status.Value,
  var failureReasonOpt: Option[String],
  id: Int = Page.getId
) extends Page { self =>
  def toRaw = new RawPage {
    val url = self.url
    val repoName = self.repoName
    val tpe = "file"
    val revisionOpt = js.defined(revision)
    val pathOpt = js.defined(path)
    val startRevisionOpt = js.undefined
    val endRevisionOpt = js.undefined
    val missingRevisions = self.missingRevisions.toJSArray
    val status = self.status.toString
    val failureReasonOpt = self.failureReasonOpt.orUndefined
  }
}
case class PullRequestPage(
  url: String,
  repoName: String,
  startRevision: String,
  endRevision: String,
  var missingRevisions: Seq[String],
  var status: Page.Status.Value,
  var failureReasonOpt: Option[String],
  id: Int = Page.getId
) extends Page { self =>
  def toRaw = new RawPage {
    val url = self.url
    val repoName = self.repoName
    val tpe = "pull"
    val revisionOpt = js.undefined
    val pathOpt = js.undefined
    val startRevisionOpt = js.defined(startRevision)
    val endRevisionOpt = js.defined(endRevision)
    val missingRevisions = self.missingRevisions.toJSArray
    val status = self.status.toString
    val failureReasonOpt = self.failureReasonOpt.orUndefined
  }
}
