package base

import java.awt.image.BufferedImage
import java.io.{ByteArrayInputStream, File}
import java.nio.file.Files

import javax.imageio.ImageIO
import org.openqa.selenium.chrome.ChromeDriver
import org.openqa.selenium.{JavascriptExecutor, OutputType}

import scala.collection.JavaConverters._

object FullPageScreenshot {
  def apply(webDriver: ChromeDriver): File = {
    val js = webDriver.asInstanceOf[JavascriptExecutor]

    val pageHeight = js.executeScript(
      """
        |var body = document.body;
        |var html = document.documentElement;
        |
        |return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
      """.stripMargin).asInstanceOf[Long].toInt
    val pageWidth = js.executeScript(
      """
        |var body = document.body;
        |var html = document.documentElement;
        |
        |return Math.max(body.scrollWidth, body.offsetWidth, html.clientWidth, html.scrollWidth, html.offsetWidth);
      """.stripMargin).asInstanceOf[Long].toInt
    val viewWidth = js.executeScript(
      """
        |return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      """.stripMargin).asInstanceOf[Long].toInt
    val viewHeight = js.executeScript(
      """
        |return Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      """.stripMargin).asInstanceOf[Long].toInt

    val img = new BufferedImage(pageWidth, pageHeight, BufferedImage.TYPE_INT_ARGB)

    val numCols = pageWidth / viewWidth + (if ((pageWidth % viewWidth) == 0) { 0 } else { 1 })
    val numRows = pageHeight / viewHeight + (if ((pageHeight % viewHeight) == 0) { 0 } else { 1 })

    val g = img.createGraphics()

    var first = true

    0.until(numRows).foreach { row =>
      0.until(numCols).foreach { col =>
        val dx1 = col * viewWidth
        val dy1 = row * viewHeight
        val dx2 = Math.min(pageWidth, (col + 1) * viewWidth)
        val dy2 = Math.min(pageHeight, (row + 1) * viewHeight)
        val sx1 = if (col == (numCols - 1)) {
          viewWidth - (dx2 - dx1)
        } else {
          0
        }
        val sy1 = if (row == (numRows - 1)) {
          viewHeight - (dy2 - dy1)
        } else {
          0
        }
        val sx2 = viewWidth
        val sy2 = viewHeight

        js.executeScript(s"window.scrollTo($dx1, $dy1);")
        val part = ImageIO.read(new ByteArrayInputStream(webDriver.getScreenshotAs(OutputType.BYTES)))

        g.drawImage(part, dx1, dy1, dx2, dy2, sx1, sy1, sx2, sy2, null)

        if (first) {
          js.executeScript(
            """
              |var elem = document.querySelector('#simpleHeader')
              |if (elem) {
              |  elem.style.display = 'none';
              |}
            """.stripMargin)
          first = false
        }
      }
    }

    g.dispose()

    val file = Files.createTempFile("tmp-screenshot-", ".png").toFile
    ImageIO.write(img, "png", file)
    file
  }
}
