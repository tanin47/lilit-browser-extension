package content.file

import content.bindings.Tippy
import content.tokenizer.{LineTokenizer, LineTokens}
import org.scalajs.dom

import scala.collection.mutable
import scala.scalajs.js

class View(
  val repoName: String,
  val revision: String,
  val path: String,
  val host: String,
  val branchOpt: Option[String],
  val selectedNodeIdOpt: Option[String],
  val lineTokensList: Seq[LineTokens]
) {

  val highlightedLines = mutable.ListBuffer.empty[Int]

  run()

  def run(): Unit = {
    Tippy.setDefaults(new Tippy.SetDefaultsOptions {
      val animation = "fade"
      val interactive = true
      val maxWidth = 600
      val arrow = true
      val distance = 11
      val onShow = js.defined { instance =>
        Tippy.hideAll(new Tippy.HideAllOptions {
          val exclude = instance
        })
      }
    })

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

      val shouldLineBeHighlighted = tokenizer.process(lineElem)

      if (shouldLineBeHighlighted) {
        highlightedLines.append(lineTokens.line)
      }
    }

    highlightedLines.foreach { line =>
      val lineElem = dom.document.querySelector(s"#LC$line")
      lineElem.classList.add("highlighted")
    }
  }
}
