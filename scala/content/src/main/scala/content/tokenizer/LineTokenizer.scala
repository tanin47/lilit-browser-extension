package content.tokenizer

import models.{Definition, Token, Usage}
import org.scalajs.dom
import org.scalajs.dom.Element
import org.scalajs.dom.raw.Node

class LineTokenizer(
  val repoName: String,
  val revision: String,
  val branchOpt: Option[String],
  val selectedNodeIdOpt: Option[String],
  val lineTokens: LineTokens
) {

  val tokens = lineTokens.tokens
  val line = lineTokens.line

  var col: Int = 1
  var shouldLineBeHighlighted: Boolean = false

  def makeUrlOpt(token: Token): Option[String] = token match {
    case usage: Usage =>
      usage.definition.locationOpt
        .map { location =>
          usage.definition.module match {
            case "Jdk" => s"http://localhost:9000/github/$repoName/$revision/jdk/${location.path}?p=${usage.definition.nodeId}"
            case "Jar" => s"http://localhost:9000/github/$repoName/$revision/jar/${usage.definition.jarIdOpt.get}/${location.path}?p=${usage.definition.nodeId}"
            case "User" => s"/$repoName/blob/${branchOpt.getOrElse(revision)}/${location.path}?p=${usage.definition.nodeId}#L${location.start.line}"
          }
        }
    case definition: Definition =>
      Some(s"http://localhost:9000/github/$repoName/$revision/usage/${definition.nodeId}")
  }

  def modify(node: Node): Option[Seq[Node]] = {
    val elemStart = col
    val elemEnd = col + node.nodeValue.length - 1

    var start = 0

    val newNodes = tokens
      .filter { t => elemStart <= t.location.start.col && t.location.end.col <= elemEnd }
      .flatMap { token =>
        val tokenStart = token.location.start.col - elemStart
        val tokenEnd = token.location.end.col - elemStart

        val beforeNodeOpt = if (tokenStart > start) {
          Some(dom.document.createTextNode(node.nodeValue.substring(start, tokenStart)))
        } else {
          None
        }

        val mainText = node.nodeValue.substring(tokenStart, tokenEnd + 1)
        val mainNode = makeUrlOpt(token)
          .map { url =>
            val anchor = dom.document.createElement("a")
            anchor.setAttribute("href", url)
            anchor.classList.add("codelab-link")
            anchor.textContent = mainText
            anchor
          }
          .getOrElse(
            dom.document.createTextNode(mainText)
          )

        start = tokenEnd + 1

        beforeNodeOpt.toList ++ Seq(mainNode)
      }

    val lastNodeOpt = if (start < node.nodeValue.length) {
      Some(dom.document.createTextNode(node.nodeValue.substring(start)))
    } else {
      None
    }

    Some(newNodes ++ lastNodeOpt.toList).filter(_.nonEmpty)
  }

  def walk(node: Node): Option[Seq[Node]] = {
    if (node.nodeType == Node.TEXT_NODE) {
      val newChildrenOpt = modify(node)
      col += node.nodeValue.length

      newChildrenOpt
    } else {
      val children = 0.until(node.childNodes.length).map { i => node.childNodes.item(i) }

      children.foreach { child =>
        walk(child).foreach { newChildren =>
          newChildren.foreach { newChild =>
            node.insertBefore(newChild, child)
          }
          node.removeChild(child)
        }
      }

      None
    }
  }

  def process(lineElem: Element): Boolean = {
    col = 1
    walk(lineElem)
    shouldLineBeHighlighted
  }
}
