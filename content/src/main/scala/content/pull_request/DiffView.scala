package content.pull_request

import content.bindings.{MutationObserver, Tippy}
import content.bindings.MutationObserver.Options
import content.tokenizer.{LineTokenizer, LineTokens}
import org.scalajs.dom.Element
import org.scalajs.dom.ext._
import org.scalajs.dom.raw.HTMLElement

import scala.scalajs.js

object DiffView {
  case class Data(
    revision: String,
    lineTokens: Seq[LineTokens]
  ) {
    val lineTokensByLine = lineTokens.groupBy(_.line).mapValues(_.head)
  }

  val PROCESSED_ATTR_NAME = "data-lilit-processed"
  val LINE_NUMBER_ATTR_NAME = "data-line-number"
}

class DiffView(
  repoName: String,
  path: String,
  host: String,
  elem: HTMLElement,
  startRevisionData: DiffView.Data,
  endRevisionData: DiffView.Data,
) {

  import DiffView._

  val observer = new MutationObserver(
    fn = { (_, _) =>
      println(s"[Lilit] ${elem.id} is mutated")
      run()
    }
  )

  def monitor(): Unit = {
    Option(elem.querySelector("table tbody")) match {
      case Some(tbody) =>
        println(s"[Lilit] ${elem.id}'s diff is visible.")
        observer.observe(
          tbody,
          new Options {
            val childList = true
            val attributes = false
            val characterData = false
            val subtree = false
          }
        )
      // The diff is hidden because it is too long
      case None =>
        println(s"[Lilit] ${elem.id}'s diff is hidden.")
        observer.observe(
          elem.querySelector(".js-diff-load-container"),
          new Options {
            val childList = true
            val attributes = false
            val characterData = false
            val subtree = false
          }
        )
    }
  }

  private[this] def buildLine(lineIndexElem: Element, lineElem: Element, data: DiffView.Data): Unit = {
    Option(lineIndexElem.getAttribute(LINE_NUMBER_ATTR_NAME)).foreach { line =>
      val codeElem = Option(lineElem)
        .map { e =>
          if (e.classList.contains("blob-code-inner")) {
            e
          } else {
            e.querySelector(".blob-code-inner")
          }
        }
        .get

      data.lineTokensByLine.get(line.toInt).foreach { lineTokens =>
        val tokenizer = new LineTokenizer(
          repoName = repoName,
          revision = data.revision,
          path = path,
          host = host,
          branchOpt = None,
          selectedNodeIdOpt = None,
          lineTokens = lineTokens
        )

        tokenizer.process(codeElem)
      }
    }
  }

  def run(): Unit = {
    println(s"[Lilit] Build ${elem.id}.")
    monitor()

    Option(elem.querySelector("table body"))
      .foreach { tbody =>
        observer.observe(
          tbody,
          new Options {
            val childList = true
            val attributes = false
            val characterData = false
            val subtree = false
          }
        )
      }

    if (elem.querySelector("table").classList.contains("file-diff-split")) {
      // Split view
      elem.querySelectorAll("table tr")
        .map(_.asInstanceOf[HTMLElement])
        .filter { row =>
          row.children.length == 4
        }
        .foreach { row =>
          buildLine(row.children.item(0), row.children.item(1), startRevisionData)
          buildLine(row.children.item(2), row.children.item(3), endRevisionData)
        }
    } else {
      // Unified view
      elem.querySelectorAll("table tr")
        .map(_.asInstanceOf[HTMLElement])
        .filter { row =>
          row.children.length == 4
        }
        .foreach { row =>
          if (row.children.item(0).classList.contains("empty-cell")) {
            // The cell 0 is empty. This means it's a new line.
            buildLine(row.children.item(1), row.children.item(3), endRevisionData)
          } else {
            buildLine(row.children.item(0), row.children.item(3), startRevisionData)
          }
        }
    }
  }

  def activateTooltips(): Unit = {
    elem.querySelectorAll(".lilit-link").foreach { case node: Element =>
      Tippy.apply(node)
    }
  }
}
