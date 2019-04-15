package chrome.declarativeContent

import chrome.declarativeContent.bindings.DeclarativeContent
import chrome.events.Rule

import scala.concurrent.{Future, Promise}
import scala.scalajs.js
import scala.scalajs.js.JSConverters._
import scala.util.Success

object DeclarativeContent {
  object onPageChanged {
    def removeRules(ruleIdentifiersOpt: Option[Seq[String]]): Future[Unit] = {
      val promise = Promise[Unit]()
      bindings.DeclarativeContent.onPageChanged.removeRules(
        rules = ruleIdentifiersOpt.map(_.toJSArray).orUndefined,
        callback = js.Any.fromFunction0 { () =>
          promise.complete(Success(()))
        }
      )
      promise.future
    }

    def addRules(rules: Seq[Rule]): Future[Unit] = {
      val promise = Promise[Unit]()
      println("add rule")
      bindings.DeclarativeContent.onPageChanged.addRules(
        rules = rules.map(_.toJs).toJSArray,
        callback = js.Any.fromFunction0 { () =>
          println("Add rule fulfilled")
          promise.complete(Success(()))
        }
      )
      promise.future
    }
  }

  object PageStateMatcher {
    case class PageUrl(
      hostEqualsOpt: Option[String]
    ) {
      def toJs = {
        js.Dynamic.literal(
          hostEquals = hostEqualsOpt.orUndefined
        ).asInstanceOf[js.Object]
      }
    }
  }

  case class PageStateMatcher(
    pageUrlOpt: Option[PageStateMatcher.PageUrl] = None,
    cssOpt: Option[Seq[String]] = None,
    isBookmarkedOpt: Option[Boolean] = None
  ) extends Rule.Condition {
    def toJs = {
      new bindings.DeclarativeContent.PageStateMatcher(
        options = js.Dynamic.literal(
          pageUrl = pageUrlOpt.map(_.toJs).orUndefined
        )
      )
    }
  }

  case class ShowPageAction() extends Rule.Action {
    def toJs = {
      new bindings.DeclarativeContent.ShowPageAction()
    }
  }
}
