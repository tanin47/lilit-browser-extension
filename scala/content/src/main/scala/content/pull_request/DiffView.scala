package content.pull_request

import content.MutationObserver
import content.MutationObserver.Options
import content.tokenizer.{LineTokenizer, LineTokens}
import org.scalajs.dom
import org.scalajs.dom.{Element, NodeListOf}
import org.scalajs.dom.raw.HTMLElement
import org.scalajs.dom.ext._

object DiffView {
  case class Data(
    revision: String,
    lineTokens: Seq[LineTokens]
  ) {
    val lineTokensByLine = lineTokens.groupBy(_.line).mapValues(_.head)
  }

  val PROCESSED_ATTR_NAME = "data-codelab-processed"
  val LINE_NUMBER_ATTR_NAME = "data-line-number"
}

class DiffView(
  repoName: String,
  elem: HTMLElement,
  startRevisionData: DiffView.Data,
  endRevisionData: DiffView.Data,
) {

  import DiffView._

  val observer = new MutationObserver(
    fn = { (_, _) =>
      println(s"[Codelab] ${elem.id} is mutated")
      run()
    }
  )

  observer.observe(
    elem.querySelector("table tbody"),
    new Options {
      val childList = true
      val attributes = false
      val characterData = false
      val subtree = false
    }
  )

  run()

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
          branchOpt = None,
          selectedNodeIdOpt = None,
          lineTokens = lineTokens
        )

        tokenizer.process(codeElem)
      }
    }
  }

  private[this] def run(): Unit = {
    elem.querySelectorAll(".file-diff-split tr")
      .map(_.asInstanceOf[HTMLElement])
      .filter { row =>
        row.children.length == 4 && row.getAttribute(PROCESSED_ATTR_NAME) == null
      }
      .foreach { row =>
        buildLine(row.children.item(0), row.children.item(1), startRevisionData)
        buildLine(row.children.item(2), row.children.item(3), endRevisionData)
      }
  }
}
