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
  def priority: Int
}


sealed abstract class Type

object Type {
  def from(raw: bindings.Type): Type = {
    raw.kind match {
      case "Class" =>
        ClassType(
          name = raw.name.get,
          defIdOpt = raw.defIdOpt.filter(_ != null).toOption,
          typeArguments = raw.typeArguments.get.toList.map(Type.from)
        )
      case "Primitive" =>
        PrimitiveType(name = raw.name.get)
      case "Array" =>
        ArrayType(elemType = Type.from(raw.elemType.get))
      case "Parameterized" =>
        ParameterizedType(
          name = raw.name.get,
          isWildcard = raw.isWildcard.get,
          superBoundTypeOpt = raw.superBoundTypeOpt.filter(_ != null).toOption.map(Type.from),
          eventualBoundTypes = raw.eventualBoundTypes.filter(_ != null).toOption.map(_.map(Type.from).toList).getOrElse(List.empty),
          defIdOpt = raw.defIdOpt.filter(_ != null).toOption,
        )
    }
  }
}

case class ClassType(
  name: String,
  defIdOpt: Option[String],
  typeArguments: List[Type]
) extends Type

case class PrimitiveType(
  name: String
) extends Type

case class ArrayType(
  elemType: Type
) extends Type

case class ParameterizedType(
  name: String,
  isWildcard: Boolean,
  superBoundTypeOpt: Option[Type],
  eventualBoundTypes: List[Type],
  defIdOpt: Option[String],
) extends Type

object Usage {
  def from(raw: bindings.Usage): Usage = {
    Usage(
      location = Location.from(raw.location),
      definitionId = raw.definitionId,
      definitionJarOpt = raw.definitionJarOpt.filter(_ != null).map(Jar.from).toOption,
      definitionLocationOpt = raw.definitionLocationOpt.filter(_ != null).map(Location.from).toOption,
      typeOpt = raw.typeOpt.filter(_ != null).map(Type.from).toOption,
      priority = raw.priority
    )
  }
}

case class Usage(
  location: Location,
  definitionId: String,
  definitionJarOpt: Option[Jar],
  definitionLocationOpt: Option[Location],
  typeOpt: Option[Type],
  priority: Int
) extends Token {
  lazy val locationOpt = Some(location)
}

object Definition {
  def from(raw: bindings.Definition): Definition = {
    Definition(
      id = raw.id,
      locationOpt = raw.locationOpt.filter(_ != null).map(Location.from).toOption,
    )
  }
}

case class Definition(
  id: String,
  locationOpt: Option[Location]
) extends Token {
  lazy val location = locationOpt.get
  val priority = 10
}

object Annotation {
  def from(raw: bindings.Annotation): Annotation = {
    Annotation(
      location = Location.from(raw.location),
      paramName = raw.paramName,
      isVariableLength = raw.isVariableLength,
      priority = raw.priority
    )
  }
}

case class Annotation(
  location: Location,
  paramName: String,
  isVariableLength: Boolean,
  priority: Int
) extends Token {
  lazy val locationOpt = Some(location)
}

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
