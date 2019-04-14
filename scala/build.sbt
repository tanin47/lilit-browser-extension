import sbt.Watched

import scala.sys.process.Process

scalaVersion in ThisBuild := "2.12.8"
scalaJSUseMainModuleInitializer in ThisBuild := true

val generatedPath = new File("./target/generated")

lazy val background = (project in file("background"))
  .enablePlugins(ScalaJSPlugin)
  .settings(
    artifactPath in (Compile, fastOptJS) := generatedPath / "background.js",
    scalaJSUseMainModuleInitializer := true,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "0.9.2",
      "net.lullabyte" %%% "scala-js-chrome" % "0.5.0"
    )
  )
lazy val content = (project in file("content"))
  .enablePlugins(ScalaJSPlugin)
  .settings(
    artifactPath in (Compile, fastOptJS) := generatedPath / "content.js",
    scalaJSUseMainModuleInitializer := true,
  )
lazy val popup = (project in file("popup"))
  .enablePlugins(ScalaJSPlugin)
  .settings(
    artifactPath in (Compile, fastOptJS) := generatedPath / "popup.js",
    scalaJSUseMainModuleInitializer := true,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "0.9.2",
      "net.lullabyte" %%% "scala-js-chrome" % "0.5.0"
    )
  )


lazy val root = (project in file("."))
  .aggregate(background, content, popup)

name := "Codelab"

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
val runWebpack = TaskKey[Unit]("run webpack")
val runSass = TaskKey[Unit]("run node-sass")

runSass := {
  execute("./node_modules/.bin/node-sass ./src/main/scss --output ./target/dev")
}

runWebpack := {
  (background / Compile / fastOptJS).value
  (content / Compile / fastOptJS).value
  (popup / Compile / fastOptJS).value

  execute("./node_modules/.bin/webpack --config webpack.dev.js")
}

buildDev := {
  runSass.value
  runWebpack.value
}

