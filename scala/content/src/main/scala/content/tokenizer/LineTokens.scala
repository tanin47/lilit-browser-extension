package content.tokenizer

import models.bindings.FileRequestResponse
import models.{Definition, Token, Usage}

object LineTokens {
  def build(file: FileRequestResponse.File): Seq[LineTokens] = {
    (file.usages.map(Usage.from) ++ file.definitions.map(Definition.from))
      .filter(_.locationOpt.isDefined)
      .groupBy(_.location.start.line)
      .mapValues(_.sortBy { t => (t.location.start.line, t.location.start.col) })
      .toList
      .map { case (line, tokens) =>
        new LineTokens(line = line, tokens = tokens)
      }
  }
}

class LineTokens(
  val line: Int,
  val tokens: Seq[Token]
)
