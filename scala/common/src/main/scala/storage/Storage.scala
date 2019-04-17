package storage

import storage.Storage.Page.{FilePage, PullRequestPage}
import storage.bindings.RawPage

import scala.concurrent.{Future, Promise}
import scala.scalajs.js
import scala.util.Success

import scala.scalajs.js.JSConverters._
import scala.concurrent.ExecutionContext.Implicits.global

object Storage {
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

  object Page {
    sealed trait Value {
      def repoName: String
      def missingRevisions: Seq[String]
      def status: Status.Value

      def setStatus(newStatus: Status.Value): Value
      def setMissingRevisions(newMissingRevisions: Seq[String]): Value
    }
    case class FilePage(
      repoName: String,
      revision: String,
      path: String,
      missingRevisions: Seq[String],
      status: Status.Value
    ) extends Value {
      def setStatus(newStatus: Status.Value): Value = this.copy(status = newStatus)
      def setMissingRevisions(newMissingRevisions: Seq[String]): Value = this.copy(missingRevisions = newMissingRevisions)
    }
    case class PullRequestPage(
      repoName: String,
      startRevision: String,
      endRevision: String,
      missingRevisions: Seq[String],
      status: Status.Value
    ) extends Value {
      def setStatus(newStatus: Status.Value): Value = this.copy(status = newStatus)
      def setMissingRevisions(newMissingRevisions: Seq[String]): Value = this.copy(missingRevisions = newMissingRevisions)
    }

    def convert(raw: RawPage): Value = {
      raw.tpe match {
        case "file" => FilePage(
          repoName = raw.repoName,
          revision = raw.revisionOpt.get,
          path = raw.pathOpt.get,
          missingRevisions = raw.missingRevisions.toSeq,
          status = Status.convert(raw.status))
        case "pull" => PullRequestPage(
          repoName = raw.repoName,
          startRevision = raw.startRevisionOpt.get,
          endRevision = raw.endRevisionOpt.get,
          missingRevisions = raw.missingRevisions.toSeq,
          status = Status.convert(raw.status))
      }
    }
  }

  def getPage(): Future[Option[Page.Value]] = {
    val promise = Promise[Option[Page.Value]]()
    chrome.storage.Storage.local
      .get(js.defined("page"))
      .foreach { result =>
        promise.complete(Success(
          result.get("page")
            .map { page =>
              val dict = page.asInstanceOf[js.Dictionary[js.Any]]
              Page.convert(new RawPage {
                val repoName = dict("repoName").asInstanceOf[String]
                val tpe = dict("tpe").asInstanceOf[String]
                val revisionOpt = dict.get("revisionOpt").map(_.asInstanceOf[String]).orUndefined
                val pathOpt = dict.get("pathOpt").map(_.asInstanceOf[String]).orUndefined
                val startRevisionOpt = dict.get("startRevisionOpt").map(_.asInstanceOf[String]).orUndefined
                val endRevisionOpt = dict.get("endRevisionOpt").map(_.asInstanceOf[String]).orUndefined
                val missingRevisions = dict("missingRevisions").asInstanceOf[js.Array[String]]
                val status = dict("status").asInstanceOf[String]
              })
            }
        ))
      }

    promise.future
  }

  def setPage(data: Page.Value): Future[Unit] = {
    val promise = Promise[Unit]()

    val raw = data match {
      case file: FilePage =>
        new RawPage {
          val repoName = file.repoName
          val tpe = "file"
          val revisionOpt = js.defined(file.revision)
          val pathOpt = js.defined(file.path)
          val startRevisionOpt = js.undefined
          val endRevisionOpt = js.undefined
          val missingRevisions = file.missingRevisions.toJSArray
          val status = file.status.toString
        }
      case pull: PullRequestPage =>
        new RawPage {
          val repoName = pull.repoName
          val tpe = "pull"
          val revisionOpt = js.undefined
          val pathOpt = js.undefined
          val startRevisionOpt = js.defined(pull.startRevision)
          val endRevisionOpt = js.defined(pull.endRevision)
          val missingRevisions = pull.missingRevisions.toJSArray
          val status = pull.status.toString
        }
    }

    chrome.storage.Storage.local
      .set(js.Dictionary(
        "page" -> raw.asInstanceOf[js.Dictionary[js.Any]]
      ))
      .foreach { _ => promise.complete(Success(())) }

    promise.future
  }

  def setMissingRevisions(missingRevisions: Seq[String]): Future[Unit] = {
    for {
      pageOpt <- getPage()
      _ <- pageOpt
        .map { page =>
          setPage(page.setMissingRevisions(missingRevisions))
        }
        .getOrElse(Future(()))
    } yield {
      ()
    }
  }

  def setStatus(status: Status.Value): Future[Unit] = {
    for {
      pageOpt <- getPage()
      _ <- pageOpt
        .map { page =>
          setPage(page.setStatus(status))
        }
        .getOrElse(Future(()))
    } yield {
      ()
    }
  }
}
