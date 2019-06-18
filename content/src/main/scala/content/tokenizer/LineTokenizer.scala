package content.tokenizer

import content.bindings.Tippy
import content.tokenizer.LineTokenizer.{HighlightType, LinkType, NoLink, UrlLink}
import models.{Definition, Jar, Token, Usage}
import org.scalajs.dom
import org.scalajs.dom.Element
import org.scalajs.dom.raw.Node

object LineTokenizer {
  object HighlightType extends Enumeration {
    val Definition, Usage = Value
  }

  sealed abstract class LinkType
  case class UrlLink(url: String) extends LinkType
  object NoLink extends LinkType
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
        case HighlightType.Usage => htOpt.orElse(highlightTypeOpt)
      }
      .getOrElse(htOpt)
  }

  def getUsageUrl(path: String, nodeId: String, firstLine: Int): String = {
    s"/$repoName/blob/${branchOpt.getOrElse(revision)}/$path?p=$nodeId#L$firstLine"
  }

  def makeUrlOpt(token: Token): Option[LinkType] = token match {
    case usage: Usage =>
      usage.definitionLocationOpt
        .map { location =>
          if (usage.definitionId.startsWith("jdk_")) {
            UrlLink(s"$host/github/$repoName/$revision/jdk/${location.path}?p=${usage.definitionId}")
          } else if (usage.definitionId.startsWith("jar_")) {
            UrlLink(s"$host/github/$repoName/$revision/jar/${usage.definitionJarOpt.get.id}/${location.path}?p=${usage.definitionId}")
          } else {
            UrlLink(s"/$repoName/blob/${branchOpt.getOrElse(revision)}/${location.path}?p=${usage.definitionId}#L${location.start.line}")
          }
        }
    case definition: Definition =>
      Some(UrlLink(s"$host/github/$repoName/$revision/usage/${definition.id}"))
  }

  def getModuleName(definitionId: String, definitionJarOpt: Option[Jar]): String = {
    if (definitionId.startsWith("jdk_")) {
      "JDK"
    } else if (definitionId.startsWith("jar_")) {
      definitionJarOpt.map { j => s"${j.group}:${j.artifact}:${j.version}" }.get
    } else {
      repoName
    }
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
      u.definitionLocationOpt
        .map { location =>
          if (location.path == path && u.definitionId.startsWith("u_")) {
            s"Defined in this file on the line ${location.start.line}"
          } else {
            s"Defined in ${location.path} inside ${getModuleName(u.definitionId, u.definitionJarOpt)}"
          }
        }
        .getOrElse(s"Defined inside ${getModuleName(u.definitionId, u.definitionJarOpt)}")
    case d: Definition =>
      "Click to find all usages"
  }

  def modify(node: Node): Option[Seq[Node]] = {
    // It's already built. This is because Github caches the element.
    if (node.parentNode.asInstanceOf[Element].classList.contains("lilit-link")) {
      Tippy.apply(node.parentNode.asInstanceOf[Element])
      return None
    }

    val elemStart = col
    val elemEnd = col + node.nodeValue.length - 1

    var start = 0

    val newNodes = tokens
      .filter { t => elemStart <= t.main.location.start.col && t.main.location.end.col <= elemEnd }
      .flatMap { token =>
        val tokenStart = token.main.location.start.col - elemStart
        val tokenEnd = token.main.location.end.col - elemStart

        val beforeNodeOpt = if (tokenStart > start) {
          Some(dom.document.createTextNode(node.nodeValue.substring(start, tokenStart)))
        } else {
          None
        }

        val mainText = node.nodeValue.substring(tokenStart, tokenEnd + 1)
        val mainNode = makeUrlOpt(token.main)
          .map {
            case url: UrlLink =>
              val anchor = dom.document.createElement("a")
              anchor.setAttribute("href", url.url)
              anchor.classList.add("lilit-link")
              anchor.textContent = mainText
              anchor.setAttribute("data-tippy-content", makeTooltipContent(token.main))
              Tippy.apply(anchor)
              anchor
            case NoLink =>
              val span = dom.document.createElement("span")
              span.classList.add("lilit-link")
              span.textContent = mainText
              span.setAttribute("data-tippy-content", makeTooltipContent(token.main))
              Tippy.apply(span)
              span
          }
          .getOrElse(
            dom.document.createTextNode(mainText)
          )

        setHighlightType(
          selectedNodeIdOpt.flatMap { selectedNodeId =>
            token
              .all
              .toStream
              .flatMap {
                case u: Usage =>
                  if (u.definitionId == selectedNodeId) {
                    Some(HighlightType.Usage)
                  } else {
                    None
                  }
                case d: Definition =>
                  if (d.id == selectedNodeId) {
                    Some(HighlightType.Definition)
                  } else {
                    None
                  }
              }
              .headOption
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
    if (lineElem == null) { return None }

    col = 1
    walk(lineElem)
    highlightTypeOpt
  }
}
