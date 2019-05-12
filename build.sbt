import scala.sys.process.Process

name := "lilit-browser-extension"
organization := "dev.lilit"

cancelable in Global := true

libraryDependencies ++= Seq(
  "com.lihaoyi" %% "utest" % "0.6.7" % Test,
  "org.seleniumhq.selenium" % "selenium-java" % "3.141.59" % Test,
  "org.seleniumhq.selenium" % "selenium-chrome-driver" % "3.141.59" % Test,
)
testFrameworks += new TestFramework("utest.runner.Framework")

scalaVersion in ThisBuild := "2.12.8"
scalaJSUseMainModuleInitializer in ThisBuild := true

resolvers in ThisBuild += Resolver.bintrayRepo("veinhorn", "maven")

val generatedLocalPath = new File("./target/generated-js-source/local")
val generatedProdPath = new File("./target/generated-js-source/prod")

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
    artifactPath in (Compile, fastOptJS) := generatedLocalPath / "background.js",
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
    artifactPath in (Compile, fastOptJS) := generatedLocalPath / "content.js",
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
lazy val modifyPath = (project in file("modify-path"))
  .enablePlugins(ScalaJSPlugin)
  .settings(
    artifactPath in (Compile, fastOptJS) := generatedLocalPath / "modify-path.js",
    artifactPath in (Compile, fullOptJS) := generatedProdPath / "modify-path.js",
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
    artifactPath in (Compile, fastOptJS) := generatedLocalPath / "popup.js",
    artifactPath in (Compile, fullOptJS) := generatedProdPath / "popup.js",
    scalaJSUseMainModuleInitializer := true,
    libraryDependencies ++= Seq(
      "org.scala-js" %%% "scalajs-dom" % "0.9.2",
      "net.lullabyte" %%% "scala-js-chrome" % "0.5.8"
    )
  )



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

def buildJsonnet(inputPath: String, outputPath: String): Unit = {
  println(s"Compile $inputPath to $outputPath")

  sjsonnet.SjsonnetMain.main0(
    Array(inputPath, "--output-file", outputPath),
    sjsonnet.SjsonnetMain.createParseCache(),
    System.in,
    System.out,
    System.err,
    ammonite.ops.pwd
  )
}

def buildConfigFiles(env: String, destinationDir: File): Unit = {
  buildJsonnet(s"./src/main/resources/config_$env.jsonnet", (destinationDir / "config.json").getCanonicalPath)
  buildJsonnet(s"./src/main/resources/manifest_$env.jsonnet", (destinationDir / "manifest.json").getCanonicalPath)
}

val buildLocal = taskKey[Unit]("build the local development version")
val buildWebpackLocal = taskKey[Unit]("run webpack (local)")
val buildSassLocal = taskKey[Unit]("run node-sass (local)")

buildSassLocal := {
  execute("./node_modules/.bin/node-sass ./src/main/scss --output ./target/local")
}

buildWebpackLocal := {
  (background / Compile / fastOptJS).value
  (content / Compile / fastOptJS).value
  (popup / Compile / fastOptJS).value
  (modifyPath / Compile / fastOptJS).value

  execute("./node_modules/.bin/webpack --config webpack.local.js")
}

buildLocal := {
  buildSassLocal.value
  buildWebpackLocal.value
  buildConfigFiles("local", target.value / "local")
}

val buildProd = taskKey[Unit]("build the prod version")
val buildWebpackProd = taskKey[Unit]("run webpack (prod)")
val buildSassProd = taskKey[Unit]("run node-sass (prod)")

buildSassProd := {
  execute("./node_modules/.bin/node-sass ./src/main/scss --output ./dist/lilit-browser-extension")
}

buildWebpackProd := {
  (background / Compile / fullOptJS).value
  (content / Compile / fullOptJS).value
  (popup / Compile / fullOptJS).value
  (modifyPath / Compile / fullOptJS).value

  execute("./node_modules/.bin/webpack --config webpack.prod.js")
}

val distDir = new File("./dist")
cleanFiles += distDir

buildProd := {
  val srcDistDir = distDir / "lilit-browser-extension"

  buildWebpackProd.value
  buildSassProd.value
  buildConfigFiles("prod", srcDistDir)

  val zipFile = distDir / "lilit-chrome-extension.zip"

  println(s"Building ${zipFile.getCanonicalPath}")
  val entries = Path.allSubpaths(srcDistDir).map { case (file, _) => file -> file.relativeTo(srcDistDir).get.toString }.toList

  entries.foreach { case (file, entry) =>
    println(s"  $entry -> ${file.getCanonicalPath}")
  }

  IO.zip(
    sources = entries,
    outputZip = zipFile
  )
}

