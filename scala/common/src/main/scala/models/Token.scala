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
      definition = UsageDefinition.from(raw.definition),
    )
  }
}

case class Usage(
  location: Location,
  definition: UsageDefinition
) extends Token {
  lazy val locationOpt = Some(location)
}

object UsageDefinition {
  def from(raw: bindings.UsageDefinition): UsageDefinition = {
    UsageDefinition(
      nodeId = raw.nodeId,
      module = raw.module,
      jarOpt = raw.jarOpt.filter(_ != null).map(Jar.from).toOption,
      locationOpt = raw.locationOpt.filter(_ != null).map(Location.from).toOption,
    )
  }
}

case class UsageDefinition(
  nodeId: String,
  module: String,
  jarOpt: Option[Jar],
  locationOpt: Option[Location]
) {
  lazy val location = locationOpt.get
}

object Definition {
  def from(raw: bindings.Definition): Definition = {
    Definition(
      nodeId = raw.nodeId,
      module = raw.module,
      jarIdOpt = raw.jarIdOpt.toOption,
      locationOpt = raw.locationOpt.filter(_ != null).map(Location.from).toOption,
      counts = raw.counts.map(UsageCount.from).toSeq,
    )
  }
}

case class Definition(
  nodeId: String,
  module: String,
  jarIdOpt: Option[Int],
  locationOpt: Option[Location],
  counts: Seq[UsageCount],
) extends Token {
  lazy val location = locationOpt.get
}

object UsageCount {
  def from(raw: bindings.UsageCount): UsageCount = {
    UsageCount(
      nodeId = raw.nodeId,
      module = raw.module,
      count = raw.count,
      fileCount = raw.fileCount,
      firstJarOpt = raw.firstJarOpt.filter(_ != null).map(Jar.from).toOption,
      firstPath = raw.firstPath,
    )
  }
}

case class UsageCount(
  nodeId: String,
  module: String,
  count: Int,
  fileCount: Int,
  firstJarOpt: Option[Jar],
  firstPath: String,
)

object Jar {
  def from(raw: bindings.Jar): Jar = {
    Jar(
      id = raw.id,
      group = raw.group,
      artifact = raw.artifact,
      version = raw.version
    )
  }
}

case class Jar(
  id: Int,
  group: String,
  artifact: String,
  version: String
)
