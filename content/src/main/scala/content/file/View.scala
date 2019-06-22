package content.file

import content.tokenizer.LineTokenizer.HighlightType
import content.tokenizer.{LineTokenizer, LineTokens}
import org.scalajs.dom

import scala.collection.mutable

class View(
  val repoName: String,
  val revision: String,
  val path: String,
  val host: String,
  val branchOpt: Option[String],
  val selectedNodeIdOpt: Option[String],
  val lineTokensList: List[LineTokens]
) {

  val highlightedLines = mutable.SortedMap.empty[Int, HighlightType.Value]

  run()

  def run(): Unit = {
    lineTokensList.foreach { lineTokens =>
      val tokenizer = new LineTokenizer(
        repoName = repoName,
        revision = revision,
        path = path,
        host = host,
        branchOpt = branchOpt,
        selectedNodeIdOpt = selectedNodeIdOpt,
        lineTokens = lineTokens
      )
      val lineElem = dom.document.querySelector(s"#LC${lineTokens.line}")

      val highlightTypeOpt = tokenizer.process(lineElem)

      highlightTypeOpt.foreach { highlightType =>
        highlightedLines.put(lineTokens.line, highlightType)
      }
    }

    highlightedLines.foreach { case (line, _) =>
      val lineElem = dom.document.querySelector(s"#LC$line")
      lineElem.classList.add("lilit-highlighted")
    }
  }
}
