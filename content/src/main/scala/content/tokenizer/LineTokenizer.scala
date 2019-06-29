package content.tokenizer

import content.bindings.Tippy
import content.tokenizer.LineTokenizer.{HighlightType, LinkType, NoLink, UrlLink}
import models.{Annotation, ArrayType, ClassType, Definition, Jar, ParameterizedType, PrimitiveType, Token, Type, Usage}
import org.scalajs.dom
import org.scalajs.dom.Element
import org.scalajs.dom.raw.Node

import scala.collection.mutable.ListBuffer
import scala.scalajs.js

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

  val insertions = lineTokens.insertions
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

  def makeUrl(usage: Usage): LinkType = {
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
      .getOrElse(NoLink)
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

  def render(tpe: Type): Option[String] = tpe match {
    case t: ClassType =>
      val typeArgs = if (t.typeArguments.nonEmpty) {
        s"&lt;${t.typeArguments.map { t => render(t).getOrElse("?") }.mkString(", ")}&gt;"
      } else {
        ""
      }
      Some(t.name + typeArgs)
    case t: PrimitiveType => Some(t.name)
    case t: ArrayType => render(t.elemType).map { _ + "[]" }
    case t: ParameterizedType => Some(t.name)
  }

  def makeTooltipContent(usage: Usage): String = {
    val main = usage.definitionLocationOpt
      .map { location =>
        if (location.path == path && usage.definitionId.startsWith("u_")) {
          s"Defined in this file on the line ${location.start.line}"
        } else {
          s"Defined in ${location.path} inside ${getModuleName(usage.definitionId, usage.definitionJarOpt)}"
        }
      }
      .getOrElse(s"Java native symbol")
    val typeInfo = usage.typeOpt
      .flatMap(render)
      .map { "<br/>" + _ }
      .getOrElse("")

    s"$main$typeInfo"
  }

  def addAnnotation(
    anno: Annotation,
    text: String,
    start: Int,
    newNodes: ListBuffer[Node]
  ): Int = {
    val point = anno.location.start.col - col

    val beforeNodeOpt = if (point > 0) {
      Some(dom.document.createTextNode(text.substring(start, point)))
    } else {
      None
    }

    val annotationNode = {
      val span = dom.document.createElement("span")
      span.classList.add("lilit-annotation")

      val text = dom.document.createTextNode({
        val variableLengthMarker = if (anno.isVariableLength) {
          "..."
        } else {
          ""
        }
        s"${anno.paramName}$variableLengthMarker"
      })

      val equal = dom.document.createElement("span")
      equal.classList.add("lilit-equal")
      equal.textContent = "="

      span.appendChild(text)
      span.appendChild(equal)
      span
    }

    newNodes.appendAll(beforeNodeOpt.toList ++ List(annotationNode))

    point
  }

  def addUsage(
    usages: List[Usage],
    text: String,
    start: Int,
    newNodes: ListBuffer[Node]
  ): Int = {
    val tokenStart = usages.head.location.start.col - col
    val tokenEnd = usages.head.location.end.col - col

    val beforeNodeOpt = if (tokenStart > start) {
      Some(dom.document.createTextNode(text.substring(start, tokenStart)))
    } else {
      None
    }

    val mainText = text.substring(tokenStart, tokenEnd + 1)
    val mainNode = makeUrl(usages.head) match {
      case url: UrlLink =>
        val anchor = dom.document.createElement("a")
        anchor.setAttribute("href", url.url)
        anchor.classList.add("lilit-link")
        anchor.textContent = mainText
        anchor.setAttribute("data-tippy-content", makeTooltipContent(usages.head))
        Tippy.apply(anchor)
        anchor
      case NoLink =>
        val span = dom.document.createElement("span")
        span.classList.add("lilit-link")
        span.classList.add("lilit-not-allowed")
        span.textContent = mainText
        span.setAttribute("data-tippy-content", makeTooltipContent(usages.head))
        Tippy.apply(span)
        span
    }

    newNodes.appendAll(beforeNodeOpt.toList ++ Seq(mainNode))

    setHighlightType(
      selectedNodeIdOpt.flatMap { selectedNodeId =>
        usages
          .toStream
          .flatMap { u =>
            if (u.definitionId == selectedNodeId) {
              Some(HighlightType.Usage)
            } else {
              None
            }
          }
          .headOption
      }
    )

    tokenEnd + 1
  }

  def addDefinition(
    definition: Definition,
    text: String,
    start: Int,
    newNodes: ListBuffer[Node]
  ): Int = {
    val tokenStart = definition.location.start.col - col
    val tokenEnd = definition.location.end.col - col

    val beforeNodeOpt = if (tokenStart > start) {
      Some(dom.document.createTextNode(text.substring(start, tokenStart)))
    } else {
      None
    }

    val mainText = text.substring(tokenStart, tokenEnd + 1)
    val mainNode = {
      val anchor = dom.document.createElement("a")
      anchor.setAttribute("href", s"$host/github/$repoName/$revision/usage/${definition.id}")
      anchor.classList.add("lilit-link")
      anchor.textContent = mainText
      anchor.setAttribute("data-tippy-content", "Click to find all usages")
      Tippy.apply(anchor)
      anchor
    }

    newNodes.appendAll(beforeNodeOpt.toList ++ Seq(mainNode))

    setHighlightType(
      selectedNodeIdOpt.flatMap { selectedNodeId =>
        if (definition.id == selectedNodeId) {
          Some(HighlightType.Definition)
        } else {
          None
        }
      }
    )

    tokenEnd + 1
  }

  def modify(node: Node): Option[List[Node]] = {
    // It's already built. This is because Github caches the element.
    if (node.parentNode.asInstanceOf[Element].classList.contains("lilit-link")) {
      Tippy.apply(node.parentNode.asInstanceOf[Element])
      return None
    }

    val text = node.nodeValue
    val nodeStart = col
    val nodeEnd = col + node.nodeValue.length - 1

    var start = 0

    val newNodes = scala.collection.mutable.ListBuffer.empty[Node]

    insertions
      .collect {
        case a: AnnotationInsertion if nodeStart <= a.items.head.location.start.col && a.items.head.location.start.col <= nodeEnd =>
          a.items.foreach { anno =>
            start = addAnnotation(anno, text, start, newNodes)
          }

        case us: UsageInsertion if nodeStart <= us.items.head.location.start.col && us.items.head.location.end.col <= nodeEnd =>
          start = addUsage(us.items, text, start, newNodes)

        case d: DefinitionInsertion if nodeStart <= d.value.location.start.col && d.value.location.start.col <= nodeEnd =>
          start = addDefinition(d.value, text, start, newNodes)
      }

    if (newNodes.isEmpty) {
      None
    } else {
      val lastNodeOpt = if (start < text.length) {
        Some(dom.document.createTextNode(text.substring(start)))
      } else {
        None
      }

      Some(newNodes.toList ++ lastNodeOpt.toList)
    }
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
