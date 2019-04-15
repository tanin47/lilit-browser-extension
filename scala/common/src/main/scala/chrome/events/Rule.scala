package chrome.events

import scala.scalajs.js
import js.JSConverters._

object Rule {
  trait Condition {
    def toJs: js.Object
  }
  trait Action {
    def toJs: js.Object
  }
}

case class Rule(
  conditions: Seq[Rule.Condition],
  actions: Seq[Rule.Action],
  idOpt: Option[String] = None,
  tagsOpt: Option[Seq[String]] = None,
  priorityOpt: Option[Int] = None
) {
  def toJs = {
    js.Dynamic.literal(
      id = idOpt.orUndefined,
      tags = tagsOpt.map(_.toJSArray).orUndefined,
      conditions = conditions.map(_.toJs).toJSArray,
      actions = actions.map(_.toJs).toJSArray,
      priority = priorityOpt.orUndefined
    ).asInstanceOf[bindings.Rule]
  }
}
