
import scala.sys.process.Process

scalaVersion in ThisBuild := "2.12.8"
scalaJSUseMainModuleInitializer in ThisBuild := true

resolvers in ThisBuild += Resolver.bintrayRepo("veinhorn", "maven")

val generatedDevPath = new File("./target/generated-dev")
val generatedProdPath = new File("./target/generated-prod")

lazy val common = (project in file("common"))
  .enablePlugins(ScalaJSPlugin)
  .settings(
    libraryDependencies ++= Seq(
      "net.lullabyte" %%% "scala-js-chrome" % "0.5.8",
    ),
    scalacOptions ++= Seq(
      "-P:scalajs:sjsDefinedByDefault"
    )
  )

lazy val background = (project in file("background"))
  .enablePlugins(ScalaJSPlugin)
  .aggregate(common)
  .dependsOn(common)
  .settings(
    artifactPath in (Compile, fastOptJS) := generatedDevPath / "background.js",
    artifactPath in (Compile, fullOptJS) := generatedProdPath / "background.js",
    scalaJSUseMainModuleInitializer := true,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "0.9.2",
      "net.lullabyte" %%% "scala-js-chrome" % "0.5.8",
    )
  )
lazy val content = (project in file("content"))
  .enablePlugins(ScalaJSPlugin)
  .aggregate(common)
  .dependsOn(common)
  .settings(
    artifactPath in (Compile, fastOptJS) := generatedDevPath / "content.js",
    artifactPath in (Compile, fullOptJS) := generatedProdPath / "content.js",
    scalaJSUseMainModuleInitializer := true,
    scalaJSModuleKind := ModuleKind.ESModule,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "0.9.2",
      "net.lullabyte" %%% "scala-js-chrome" % "0.5.8",
    ),
    scalacOptions ++= Seq(
      "-P:scalajs:sjsDefinedByDefault"
    )
  )
lazy val popup = (project in file("popup"))
  .enablePlugins(ScalaJSPlugin)
  .aggregate(common)
  .dependsOn(common)
  .settings(
    artifactPath in (Compile, fastOptJS) := generatedDevPath / "popup.js",
    artifactPath in (Compile, fullOptJS) := generatedProdPath / "popup.js",
    scalaJSUseMainModuleInitializer := true,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "0.9.2",
      "net.lullabyte" %%% "scala-js-chrome" % "0.5.8"
    )
  )


lazy val root = (project in file("."))
  .aggregate(background, content, popup)

name := "lilit-browser-extension"
organization := "dev.lilit"

cancelable in Global := true

watchSources ++= Seq(
  (background / Compile / fastOptJS / watchSources).value,
  (content / Compile / fastOptJS / watchSources).value,
  (popup / Compile / fastOptJS / watchSources).value,
  // The below has to be a canonical file. Otherwise, it wouldn't work.
  Seq(WatchSource.apply(new File("./src/main").getCanonicalFile).withRecursive(true))
).flatten

def execute(cmd: String): Unit = {
  println(s"Run: $cmd")
  Process.apply(cmd).!!
}

val buildDev = taskKey[Unit]("build the development version")
val buildWebpackDev = taskKey[Unit]("run webpack (dev)")
val buildSassDev = taskKey[Unit]("run node-sass (dev)")

buildSassDev := {
  execute("./node_modules/.bin/node-sass ./src/main/scss --output ./target/dev")
}

buildWebpackDev := {
  (background / Compile / fastOptJS).value
  (content / Compile / fastOptJS).value
  (popup / Compile / fastOptJS).value

  execute("./node_modules/.bin/webpack --config webpack.dev.js")
}

buildDev := {
  buildSassDev.value
  buildWebpackDev.value
}

val buildProd = taskKey[Unit]("build the prod version")
val buildWebpackProd = taskKey[Unit]("run webpack (prod)")
val buildSassProd = taskKey[Unit]("run node-sass (prod)")

buildSassProd := {
  execute("./node_modules/.bin/node-sass ./src/main/scss --output ./target/prod")
}

buildWebpackProd := {
  (background / Compile / fullOptJS).value
  (content / Compile / fullOptJS).value
  (popup / Compile / fullOptJS).value

  execute("./node_modules/.bin/webpack --config webpack.prod.js")
}

buildProd := {
  buildWebpackProd.value
  buildSassProd.value

  val zipFile = target.value / "lilit-chrome-extension.zip"
  val zipFolder = target.value / "prod"

  println(s"Building ${zipFile.getCanonicalPath}")
  val entries = Path.allSubpaths(zipFolder).map { case (file, _) => file -> file.relativeTo(zipFolder).get.toString }.toList

  entries.foreach { case (file, entry) =>
    println(s"  $entry -> ${file.getCanonicalPath}")
  }

  IO.zip(
    sources = entries,
    outputZip = zipFile
  )
}

