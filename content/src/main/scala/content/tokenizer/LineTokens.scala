package content.tokenizer

import models.bindings.FileRequestResponse
import models.{Annotation, Definition, Location, Token, Usage}

import scala.scalajs.js

object LineTokens {
  def build(file: FileRequestResponse.File): List[LineTokens] = {
    (file.usages.map(Usage.from) ++ file.definitions.map(Definition.from) ++ file.annotations.getOrElse(js.Array()).map(Annotation.from))
      .filter(_.locationOpt.isDefined)
      .groupBy(_.location.start.line)
      .mapValues(_.sortBy { t => (t.location.start.line, t.location.start.col, t.priority) })
      .toList
      .map { case (line, tokens) =>
        new LineTokens(
          line = line,
          insertions = tokens
            .groupBy(_.location.start.col)
            .values
            .toList
            .sortBy(_.head.location.start.col)
            .flatMap { vs =>
              val usageOpt = {
                val us = vs.collect { case u: Usage => u }.toList

                if (us.nonEmpty) {
                  Some(new UsageInsertion(us))
                } else {
                  None
                }
              }
              val annotationOpt = {
                val as = vs.collect { case a: Annotation => a }.toList

                if (as.nonEmpty) {
                  Some(new AnnotationInsertion(as))
                } else {
                  None
                }
              }
              val definitionOpt = {
                val ds = vs.collect { case d: Definition => d }

                if (ds.nonEmpty) {
                  assert(ds.size == 1, "There should be only one definition")
                  Some(new DefinitionInsertion(ds.head))
                } else {
                  None
                }
              }

              Seq(
                annotationOpt,
                usageOpt,
                definitionOpt
              ).flatten
            }
        )
      }
  }
}


sealed class Insertion

class UsageInsertion(
  val items: List[Usage]
) extends Insertion

class DefinitionInsertion(
  val value: Definition
) extends Insertion

class AnnotationInsertion(
  val items: List[Annotation]
) extends Insertion

class LineTokens(
  val line: Int,
  val insertions: List[Insertion]
)
