package content.tokenizer

import content.bindings.Tippy
import models.{Definition, Token, Usage, UsageCount, UsageDefinition}
import org.scalajs.dom
import org.scalajs.dom.Element
import org.scalajs.dom.raw.Node

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
  var shouldLineBeHighlighted: Boolean = false

  def getUsageUrl(count: UsageCount): String = count.module match {
    case "Jdk" => s"$host/github/$repoName/$revision/jdk/${count.path}?p=${count.nodeId}"
    case "Jar" => s"$host/github/$repoName/$revision/${count.jarOpt.map(_.id).get}/${count.path}?p=${count.nodeId}"
    case "User" => s"/$repoName/blob/${branchOpt.getOrElse(revision)}/${count.path}?p=${count.nodeId}#L${count.firstLine}"
  }

  def makeUrlOpt(token: Token): Option[String] = token match {
    case usage: Usage =>
      usage.definition.locationOpt
        .map { location =>
          usage.definition.module match {
            case "Jdk" => s"$host/github/$repoName/$revision/jdk/${location.path}?p=${usage.definition.nodeId}"
            case "Jar" => s"$host/github/$repoName/$revision/jar/${usage.definition.jarOpt.get.id}/${location.path}?p=${usage.definition.nodeId}"
            case "User" => s"/$repoName/blob/${branchOpt.getOrElse(revision)}/${location.path}?p=${usage.definition.nodeId}#L${location.start.line}"
          }
        }
    case definition: Definition =>
      Some(
        if (definition.counts.isEmpty) {
          "javascript: return false;"
        } else if (definition.counts.size == 1) {
          getUsageUrl(definition.counts.head)
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

  def getModuleName(count: UsageCount): String = count.module match {
    case "Jdk" => "JDK"
    case "Jar" => "jars"
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
      if (d.counts.isEmpty) {
        "No occurrences found"
      } else if (d.counts.size == 1) {
        val first = d.counts.head

        if (first.module == "User" && first.path == path) {
          s"Found ${first.count} ${renderOccurrenceWord(first.count)} only in this file"
        } else {
          s"Found ${first.count} ${renderOccurrenceWord(first.count)} only in ${first.path} inside ${getModuleName(first)}"
        }
      } else {
        val (thisFileCountOpt, otherFileCounts) = d.counts.partition { d => (d.module, d.path) == ("User", path) }

        val thisFileLabel = thisFileCountOpt
          .map { count =>
            s"""Found <a href='${getUsageUrl(count)}'>${count.count} ${renderOccurrenceWord(count.count)} in this file</a>"""
          }

        val otherFileLabels = otherFileCounts
          .groupBy { c => c.module }
          .mapValues { u => (u, u.size, u.map(_.count).sum) }
          .toList
          .sortBy(_._1)
          .map { case (_, (count, fileCount, occurrenceCount)) =>
            s"Found $occurrenceCount ${renderOccurrenceWord(occurrenceCount)} inside ${getModuleName(count.head)} ($fileCount ${renderFileWord(d.counts.size)})"
          }

        (thisFileLabel ++ otherFileLabels).mkString("<br/>")
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
            anchor.classList.add("codelab-link")
            anchor.textContent = mainText
            anchor.setAttribute("data-tippy-content", makeTooltipContent(token))
            Tippy.apply(anchor)
            anchor
          }
          .getOrElse(
            dom.document.createTextNode(mainText)
          )

        shouldLineBeHighlighted ||= selectedNodeIdOpt.exists { selectedNodeId =>
          token match {
            case u: Usage => u.definition.nodeId == selectedNodeId
            case d: Definition => d.nodeId == selectedNodeId
          }
        }

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
