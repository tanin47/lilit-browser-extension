package content.tokenizer

import content.bindings.Tippy
import content.tokenizer.LineTokenizer.HighlightType
import models.{Definition, Token, Usage, UsageDefinition}
import org.scalajs.dom
import org.scalajs.dom.Element
import org.scalajs.dom.raw.Node

object LineTokenizer {
  object HighlightType extends Enumeration {
    val Definition, Usage = Value
  }
}

class LineTokenizer(
  val repoName: String,
  val revision: String,
  val path: String,
  val host: String,
  val branchOpt: Option[String],
  val selectedNodeIdOpt: Option[String],
  val lineTokens: LineTokens
) {

  val tokens = lineTokens.tokens
  val line = lineTokens.line

  var col: Int = 1
  var highlightTypeOpt: Option[HighlightType.Value] = None

  def setHighlightType(htOpt: Option[HighlightType.Value]): Unit = {
    highlightTypeOpt = highlightTypeOpt
      .map {
        case HighlightType.Definition => highlightTypeOpt
        case HighlightType.Usage => htOpt
      }
      .getOrElse(htOpt)
  }

  def getUsageUrl(path: String, nodeId: String): String = {
    s"/$repoName/blob/${branchOpt.getOrElse(revision)}/$path?p=$nodeId"
  }

  def makeUrlOpt(token: Token): Option[String] = token match {
    case usage: Usage =>
      usage.definition.locationOpt
        .map { location =>
          usage.definition.module match {
            case "Jdk" => s"$host/github/$repoName/$revision/jdk/${location.path}?p=${usage.definition.nodeId}"
            case "Jar" => s"$host/github/$repoName/$revision/jar/${usage.definition.jarOpt.get.id}/${location.path}?p=${usage.definition.nodeId}"
            case "User" => s"/$repoName/blob/${branchOpt.getOrElse(revision)}/${location.path}?p=${usage.definition.nodeId}"
          }
        }
    case definition: Definition =>
      Some(
        if (definition.count.mainCount == 0 && definition.count.otherCount == 0) {
          "javascript: return false;"
        } else if (definition.count.mainCount > 0 && definition.count.otherCount == 0) {
          getUsageUrl(definition.count.mainPath, definition.nodeId)
        } else if (definition.count.mainCount == 0 && definition.count.otherFileCount == 1) {
          getUsageUrl(definition.count.otherFirstFilePathOpt.get, definition.nodeId)
        } else {
          s"$host/github/$repoName/$revision/usage/${definition.nodeId}"
        }
      )
  }

  def getModuleName(definition: UsageDefinition): String = definition.module match {
    case "Jdk" => "JDK"
    case "Jar" => definition.jarOpt.map { j => s"${j.group}:${j.artifact}:${j.version}" }.get
    case "User" => repoName
  }

  def renderOccurrenceWord(count: Int): String = {
    if (count == 1) {
      "occurrence"
    } else {
      "occurrences"
    }
  }

  def renderFileWord(count: Int): String = {
    if (count == 1) {
      "file"
    } else {
      "files"
    }
  }

  def makeTooltipContent(token: Token): String = token match {
    case u: Usage =>
      u.definition.locationOpt
        .map { location =>
          if (location.path == path && u.definition.module == "User") {
            s"Defined in this file on the line ${location.start.line}"
          } else {
            s"Defined in ${location.path} inside ${getModuleName(u.definition)}"
          }
        }
        .getOrElse(s"Defined inside ${getModuleName(u.definition)}")
    case d: Definition =>
      if (d.count.mainCount == 0 && d.count.otherCount == 0) {
        "No occurrences found"
      } else if (d.count.mainCount > 0 && d.count.otherCount == 0) {
        s"Found ${d.count.mainCount} ${renderOccurrenceWord(d.count.mainCount)} only in this file"
      } else if (d.count.mainCount == 0 && d.count.otherFileCount == 1) {
        s"Found ${d.count.otherCount} ${renderOccurrenceWord(d.count.otherCount)} only in ${d.count.otherFirstFilePathOpt.get}"
      } else {
        val thisFileLabelOpt = if (d.count.mainCount > 0) {
          Some(s"""Found <a href='${getUsageUrl(d.count.mainPath, d.nodeId)}'>${d.count.mainCount} ${renderOccurrenceWord(d.count.mainCount)} in this file</a>""")
        } else {
          None
        }

        val otherFileLabelOpt = if (d.count.otherFileCount == 1) {
          Some(s"Found <a href='${getUsageUrl(d.count.otherFirstFilePathOpt.get, d.nodeId)}'>${d.count.otherCount} ${renderOccurrenceWord(d.count.otherCount)} in ${d.count.otherFirstFilePathOpt.get}</a>")
        } else if (d.count.otherFileCount > 1) {
          Some(s"Found ${d.count.otherCount} ${renderOccurrenceWord(d.count.otherCount)} (${d.count.otherFileCount} ${renderFileWord(d.count.otherFileCount)})")
        } else {
          None
        }

        (thisFileLabelOpt ++ otherFileLabelOpt).mkString("<br/>")
      }
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
            anchor.classList.add("lilit-link")
            anchor.textContent = mainText
            anchor.setAttribute("data-tippy-content", makeTooltipContent(token))
            Tippy.apply(anchor)
            anchor
          }
          .getOrElse(
            dom.document.createTextNode(mainText)
          )

        setHighlightType(
          selectedNodeIdOpt.flatMap { selectedNodeId =>
            token match {
              case u: Usage =>
                if (u.definition.nodeId == selectedNodeId) {
                  Some(HighlightType.Usage)
                } else {
                  None
                }
              case d: Definition =>
                if (d.nodeId == selectedNodeId) {
                  Some(HighlightType.Definition)
                } else {
                  None
                }
            }
          }
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

  def process(lineElem: Element): Option[HighlightType.Value] = {
    col = 1
    walk(lineElem)
    highlightTypeOpt
  }
}
