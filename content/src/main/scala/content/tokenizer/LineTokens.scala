package content.tokenizer

import models.bindings.FileRequestResponse
import models.{Definition, Token, Usage}

object LineTokens {
  def build(file: FileRequestResponse.File): List[LineTokens] = {
    (file.usages.map(Usage.from) ++ file.definitions.map(Definition.from))
      .filter(_.locationOpt.isDefined)
      .groupBy(_.location.start.line)
      .mapValues(_.sortBy { t => (t.location.start.line, t.location.start.col, t.priority) })
      .toList
      .map { case (line, tokens) =>
        new LineTokens(
          line = line,
          tokens = tokens
            .groupBy(_.location.start.col)
            .mapValues { vs =>
              val sorted = vs.sortBy(_.priority)
              new GroupToken(sorted.head, sorted.tail.toList)
            }
            .values
            .toList
            .sortBy(_.main.location.start.col)
        )
      }
  }
}

class GroupToken(
  val main: Token,
  val others: List[Token]
) {
  lazy val all = Seq(main) ++ others
}

class LineTokens(
  val line: Int,
  val tokens: List[GroupToken]
)
