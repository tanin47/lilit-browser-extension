package state

import models.Page
import models.bindings.PageUpdated

import scala.scalajs.js
import scala.scalajs.js.JSConverters._

class State {
  private[this] var pageOpt: Option[Page] = None

  def setPage(newPageOpt: Option[Page]): Unit = {
    pageOpt = newPageOpt
    triggerPageUpdate()
  }

  def getPage: Option[Page] = pageOpt

  def hasPage(page: Page): Boolean = pageOpt.map(_.id).contains(page.id)

  def setMissingRevisions(page: Page, newMissingRevisions: Seq[String]): Unit = {
    if (!hasPage(page)) { return }
    pageOpt.foreach(_.setMissingRevisions(newMissingRevisions))
    triggerPageUpdate()
  }

  def loading(page: Page): Unit = {
    if (!hasPage(page)) { return }
    if (pageOpt.exists(_.status == Page.Status.Failed)) { return }

    pageOpt.foreach(_.loading())
    triggerPageUpdate()
  }

  def complete(page: Page): Unit = {
    if (!hasPage(page)) { return }
    if (pageOpt.exists(_.status == Page.Status.Failed)) { return }

    pageOpt.foreach(_.complete())
    triggerPageUpdate()
  }

  def fail(page: Page, reasonOpt: Option[String]): Unit = {
    if (!hasPage(page)) { return }
    pageOpt.foreach(_.fail(reasonOpt))
    triggerPageUpdate()
  }

  private[this] def triggerPageUpdate(): Unit = {
    chrome.runtime.Runtime.sendMessage(
      message = new PageUpdated(pageOpt = pageOpt.map(_.toRaw).orUndefined)
    )
  }
}

