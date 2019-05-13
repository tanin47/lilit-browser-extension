package base

import java.io.{File, FileOutputStream}
import java.nio.file.{Files, Paths}
import java.util.zip.{ZipEntry, ZipFile, ZipOutputStream}

import org.openqa.selenium.chrome.{ChromeDriver, ChromeOptions}
import org.openqa.selenium.interactions.Actions
import org.openqa.selenium.support.ui.Select
import org.openqa.selenium._
import utest._

import scala.collection.JavaConverters._
import scala.io.Source
import scala.language.implicitConversions


object BrowserTest {
  def prepareExtensionFile(dest: File): Unit = {
    Files.deleteIfExists(dest.toPath)

    val zipFile = new ZipFile("./dist/lilit-chrome-extension.zip")
    val output = new ZipOutputStream(new FileOutputStream(dest))

    zipFile.entries().asScala.foreach { entry =>
      output.putNextEntry(new ZipEntry(entry.getName))

      entry.getName match {
        case "manifest.json" =>
          val manifest = Source.fromInputStream(zipFile.getInputStream(entry)).mkString
          output.write(
            manifest
              .replace(
                """"short_name"""",
                """
                  |"key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv2/LE734DHpQ0GGIhTcJmGtFINnu8l5BxaowJmD0paMUwqQiAu7anu/W8e+4KMOpDguY4Uk7TFqbM8M8pTidSsfAh4mQdtxYcJ+Gc8/wZJ9ULXGcsDf5w/a03YuWj3FafBZazHabYirhhkd7g5jGP+gbdJ/FoJC1wP/Y7D3qvAXGohxFIAxqCNt78z4t5eECrgSoMIjKqvtlJjtsFQtkeSvt2xkI+hV4xw16D3gjQ5p7BculrYNkIe7z7gPdWVyQoLrVFIs1ZFmuhhDqoKX4cFEF/NjTW+VUmoJsI5wekTqsQepYT2Z5myIXGyYPI0KGcD71NOqdiXGwPgEMN57TdQIDAQAB",
                  |"short_name"
                """.stripMargin
              )
              .getBytes
          )
        case _ =>
          val input = zipFile.getInputStream(entry)
          Iterator
            .continually(input.read)
            .takeWhile(_ != -1)
            .foreach(output.write)
      }

      output.closeEntry()
    }

    output.close()
  }
}

abstract class BrowserTest extends TestSuite {
  val browserExtensionFile = {
    val extensionFile = Paths.get(sys.props("java.io.tmpdir")).resolve("local-lilit-browser-extension.crx").toFile
    BrowserTest.prepareExtensionFile(extensionFile)
    extensionFile
  }

  implicit val webDriver: ChromeDriver = {

    def init(retryCount: Int = 4): ChromeDriver = {
      val options = new ChromeOptions()

      // Headless chrome doesn't support browser extension, btw
      options.addExtensions(browserExtensionFile)
      options.addArguments("--disable-gpu")
      options.addArguments("--disable-web-security")
      options.addArguments("--window-size=1280,800")

      try {
        new ChromeDriver(options)
      } catch { case e: Exception =>
        Thread.sleep(250)
        if (retryCount > 0) {
          init(retryCount - 1)
        } else {
          throw e
        }
      }
    }

    init()
  }

  val mainWindowHandle = webDriver.getWindowHandle

  def reset(): Unit = {
    webDriver.manage().deleteAllCookies()

    if (webDriver.getWindowHandles.size > 1) {
      import scala.collection.JavaConverters._

      webDriver.getWindowHandles.asScala
        .filterNot(_ == mainWindowHandle)
        .foreach { window =>
          webDriver.switchTo().window(window).close()
        }

      webDriver.getWindowHandles.size ==> 1
      webDriver.switchTo().window(mainWindowHandle)
    }

    go("chrome://version")
  }

  override def utestBeforeEach(path: Seq[String]): Unit = {
    super.utestBeforeEach(path)
    reset()
  }

  override def utestAfterAll(): Unit = {
    webDriver.quit()
  }

  def go(path: String): Unit = {
    webDriver.get(path)
  }

  def waitUntil(cond: => Boolean): Unit = {
    waitUntil(20, 500)(cond)
  }

  def openNewTab(): String = {
    webDriver.asInstanceOf[JavascriptExecutor].executeScript( "window.open();")
    webDriver.getWindowHandles.asScala.filter(_ != webDriver.getWindowHandle).head
  }

  def waitUntil(timeoutInSeconds: Int, intervalInMs: Long)(cond: => Boolean): Unit = {
    var i = 1
    val maxIteration = Math.max(2, timeoutInSeconds * 1000 / intervalInMs)
    Thread.sleep(intervalInMs)
    while (i < maxIteration) {
      try {
        if (cond) {
          Thread.sleep(500)
          return
        }
      } catch {
        case _: StaleElementReferenceException => // do nothing
      }

      i += 1
      Thread.sleep(intervalInMs)
    }

    throw new TimeoutException()
  }

  abstract class SuperElement {
    def getElement: WebElement
    def select(selector: String): NewRichElement

    def tryForSuccess[T](fn: => T): T = {
      val startTime = System.currentTimeMillis()

      def handleException(e: Throwable): Unit = {
        if ((System.currentTimeMillis() - startTime) > 30000L) {
          throw e
        } else {
          Thread.sleep(500)
        }
      }

      while (true) {
        try {
          return fn
        } catch {
          case e @ (_: StaleElementReferenceException | _: ElementNotVisibleException | _: NoSuchElementException | _: InvalidElementStateException) =>
            handleException(e)
          case e: WebDriverException if e.getMessage.contains("is not clickable") || e.getMessage.contains("Other element would receive the click") =>
            // Sometimes the target element moves before we click. Because the layout moves.
            handleException(e)
        }
      }

      throw new Exception("This exception is impossible")
    }

    def fill(s: String, shouldClear: Boolean = true): Unit = tryForSuccess {
      val elem = getElement
      try {
        elem.click()
      } catch {
        case _: WebDriverException => // ignore because the input might be out of view, and it's fine.
        // We've seen one occurrence where the sticky top bar blocks the element.
        // More than often, clicking will also scroll to the element. But if the element ends up under the top sticky bar.
        // Then, that's just unfortunate.
      }
      if (shouldClear) {
        // In the newer version of Chrome (around Oct 2018), elem.clear() doesn't work on the Stripe element anymore.
        // I don't know why. But Ctrl+A and Backspace seems superior in any case.
        if (sys.props.get("os.name").exists(_.toLowerCase().contains("mac"))) {
          // The command key doesn't work.
          //          elem.sendKeys(Keys.chord(Keys.COMMAND, "a"))
          elem.clear()
          elem.sendKeys("a")
        } else {
          elem.sendKeys(Keys.chord(Keys.CONTROL, "a"))
        }
        // This key has to be separated in order to triggers the Javascripts' event
        elem.sendKeys(Keys.BACK_SPACE)
      }
      Thread.sleep(10)
      s.foreach { c =>
        elem.sendKeys(c.toString)
        Thread.sleep(1)
      }
    }

    def getToolTip: WebElement = {
      waitUntil { getAttribute("aria-describedby") != null }
      s"#${getAttribute("aria-describedby")}".getElement
    }
    def hover(): Unit = tryForSuccess { new Actions(webDriver).moveToElement(getElement).perform() }
    def click(): Unit = tryForSuccess { getElement.click() }
    def sendKeys(keysToSend: CharSequence*): Unit = tryForSuccess { getElement.sendKeys(keysToSend:_*) }
    def clear(): Unit = tryForSuccess { getElement.clear() }
    def getTagName = tryForSuccess { getElement.getTagName }
    def getAttribute(name: String) = tryForSuccess { getElement.getAttribute(name) }
    def selectByValue(value: String): Unit = tryForSuccess { new Select(getElement).selectByValue(value) }
    def isSelected = tryForSuccess { getElement.isSelected }
    def isEnabled = tryForSuccess { getElement.isEnabled }
    def getText = tryForSuccess { getElement.getText }
    def isDisplayed = tryForSuccess { getElement.isDisplayed }
    def getCssValue(propertyName: String) = tryForSuccess {  getElement.getCssValue(propertyName) }
    def isRendered(): Boolean = tryForSuccess {
      val height = webDriver.asInstanceOf[JavascriptExecutor].executeScript( "return arguments[0].offsetHeight;", getElement).asInstanceOf[Long]

      if (height > 0) {
        Thread.sleep(10) // Sleep a little to handle some delay.
        true
      } else {
        false
      }
    }
  }

  class DelayedElement(elem: WebElement) extends SuperElement {
    def getElement: WebElement = elem
    def select(selector: String) = new NewRichElement(selector, Some(this))
    def use[T](fn: DelayedElement => T): T = {
      fn(this)
    }
  }

  class NewRichElement(selector: String, parentOpt: Option[SuperElement]) extends SuperElement {
    def getElement: WebElement = parentOpt.map(_.getElement).getOrElse(webDriver).findElement(By.cssSelector(selector))
    def items: List[DelayedElement] = {
      import scala.collection.JavaConverters._
      parentOpt.map(_.getElement).getOrElse(webDriver)
        .findElements(By.cssSelector(selector)).asScala.toList
        .map { e => new DelayedElement(e) }
    }
    def item(index: Int): DelayedElement = tryForSuccess {
      if (items.length <= index) {
        throw new NoSuchElementException(s"There are only ${items.length} elements. The element number $index doesn't exist.")
      }

      items(index)
    }
    def select(selector: String) = new NewRichElement(selector, Some(this))
    def use[T](fn: NewRichElement => T): T = {
      fn(this)
    }
  }

  implicit def webElementToDelayedElement(elem: WebElement): DelayedElement = new DelayedElement(elem)
  implicit def stringToNewRichElement(s: String): NewRichElement = new NewRichElement(s, None)
}
