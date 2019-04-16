package models


object Position {
  def from(raw: bindings.Position): Position = {
    Position(
      line = raw.line,
      col = raw.col
    )
  }
}

case class Position(
  line: Int,
  col: Int
)

object Location {
  def from(raw: bindings.Location): Location = {
    Location(
      path = raw.path,
      start = Position.from(raw.start),
      end = Position.from(raw.end),
    )
  }
}

case class Location(
  path: String,
  start: Position,
  end: Position
)

sealed abstract class Token {
  def location: Location
  def locationOpt: Option[Location]
}

object Usage {
  def from(raw: bindings.Usage): Usage = {
    Usage(
      location = Location.from(raw.location),
      definition = Definition.from(raw.definition),
    )
  }
}

case class Usage(
  location: Location,
  definition: Definition
) extends Token {
  lazy val locationOpt = Some(location)
}

object Definition {
  def from(raw: bindings.Definition): Definition = {
    Definition(
      nodeId = raw.nodeId,
      module = raw.module,
      jarIdOpt = raw.jarIdOpt.filter(_ != null).toOption,
      locationOpt = raw.locationOpt.filter(_ != null).map(Location.from).toOption,
//      counts = raw.counts.map(UsageCount.from).toSeq,
    )
  }
}

case class Definition(
  nodeId: String,
  module: String,
  jarIdOpt: Option[Int],
  locationOpt: Option[Location],
//  counts: Seq[UsageCount],
) extends Token {
  lazy val location = locationOpt.get
}

object UsageCount {
  def from(raw: bindings.UsageCount): UsageCount = {
    UsageCount(
      module = raw.module,
      jarOpt = raw.jarOpt.filter(_ != null).map(Jar.from).toOption,
      path = raw.path,
      count = raw.count
    )
  }
}

case class UsageCount(
  module: String,
  jarOpt: Option[Jar],
  path: String,
  count: Int
)

object Jar {
  def from(raw: bindings.Jar): Jar = {
    Jar(
      id = raw.id
    )
  }
}

case class Jar(id: Int)
