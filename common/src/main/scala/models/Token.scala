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
      count = UserUsageCount.from(raw.count)
    )
  }
}

case class Definition(
  nodeId: String,
  module: String,
  jarIdOpt: Option[Int],
  locationOpt: Option[Location],
  count: UserUsageCount
) extends Token {
  lazy val location = locationOpt.get
}

object UserUsageCount {
  def from(raw: bindings.UserUsageCount): UserUsageCount = {
    UserUsageCount(
      mainPath = raw.mainPath,
      mainCount = raw.mainCount,
      mainFirstLineOpt = raw.mainFirstLineOpt.toOption,
      otherCount = raw.otherCount,
      otherFileCount = raw.otherFileCount,
      otherFirstFilePathOpt = raw.otherFirstFilePathOpt.toOption,
      otherFirstFileFirstLineOpt = raw.otherFirstFileFirstLineOpt.toOption,
    )
  }
}

case class UserUsageCount(
  mainPath: String,
  mainCount: Int,
  mainFirstLineOpt: Option[Int],
  otherCount: Int,
  otherFileCount: Int,
  otherFirstFilePathOpt: Option[String],
  otherFirstFileFirstLineOpt: Option[Int]
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
