package modify_path

import org.scalajs.dom
import org.scalajs.dom.Node
import org.scalajs.dom.html.Anchor

import scala.scalajs.js.JSConverters._

object ModifyPath {
  def main(args: Array[String]): Unit = {
    val anchors = dom.document.querySelectorAll("a")

    0.to(anchors.length).foreach { index =>
      maybeModify(anchors.item(index))
    }
  }

  def maybeModify(node: Node): Unit = {

    node match {
      case a: Anchor if isValid(a.getAttribute("href")) => modify(a)
      case _ => // do nothing
    }
  }

  def isValid(url: String): Boolean = {
    // Example: /github/stripe/stripe-java/0793eac5420c2bde9d83febdd236a600a1b6e37f/u/src/main/java/com/stripe/model/Account.java
    val tokens = url.split("/", -1)

     tokens.length >= 6 && tokens(0).isEmpty && tokens(5) == "u"
  }

  def modify(anchor: Anchor): Unit = {
    val tokens = anchor.getAttribute("href").split("/", -1)

    anchor.setAttribute("href", s"https://github.com/${tokens(2)}/${tokens(3)}/blob/${tokens(4)}/${tokens.drop(6).mkString("/")}")
  }
}

