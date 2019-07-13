import base.BrowserTest
import utest._

object ViewFileTest extends BrowserTest {
  val tests = Tests {
    "jump to a definition" - {
      go("https://github.com/tanin47/test-java-repo/blob/d022270ccb8f346cb8ef2136c4212ff71802eff5/src/main/java/test_java_repo/Main.java")

      val usage = "#LC150 .lilit-link"
      waitUntil { usage.items.nonEmpty }

      usage.hoverAndGetToolTip.getText ==> "Defined in this file on the line 153\nint"

      usage.click()

      val definition = "#LC153 .lilit-link"
      waitUntil { definition.items.nonEmpty }

      webDriver.getCurrentUrl.contains("#L153") ==> true
      "#LC150".getAttribute("class").contains("lilit-highlighted") ==> true
      "#LC153".getAttribute("class").contains("lilit-highlighted") ==> true
    }

    "See all usages and jump to one" - {
      go("https://github.com/tanin47/test-java-repo/blob/d022270ccb8f346cb8ef2136c4212ff71802eff5/src/main/java/test_java_repo/Main.java")

      val definition = "#LC153 .lilit-link"
      waitUntil { definition.items.nonEmpty }

      definition.hoverAndGetToolTip.getText ==> "Click to find all usages"
      definition.click()

      waitUntil { webDriver.getCurrentUrl.startsWith("https://lilit.dev") }

      ".content ul li a".items(1).click()

      waitUntil { webDriver.getCurrentUrl.startsWith("https://github.com") }
      waitUntil { ".lilit-link".nonEmpty }

      webDriver.getCurrentUrl.contains("#L10") ==> true
      "#LC10".getAttribute("class").contains("lilit-highlighted") ==> true
    }

    "Show tooltips (with type info) and annotations correctly" - {
      go("https://github.com/tanin47/test-java-repo/blob/6d9faf33b4402b4533565edd2f947f45645d5cc9/src/main/java/test_java_repo/Library.java")

      val variable = "#LC45 .lilit-link"
      waitUntil { variable.items.nonEmpty }
      variable.hoverAndGetToolTip.getText ==> "Defined in this file on the line 32\nCollector<Something, ?, Iterator<AnotherThing>>"

      val annotation = "#LC45 .lilit-annotation"
      waitUntil { annotation.items.nonEmpty }
      annotation.getText ==> "classifier="

      val method = "#LC50 .lilit-link"
      waitUntil { method.items.nonEmpty }
      method.hoverAndGetToolTip.getText ==> "Defined in this file on the line 38\nCollector<Something, ?, Iterator<AnotherThing>>"
    }

    "Request to index a commit" - {
      go("https://github.com/tanin47/test-java-repo/blob/b0572fe9bd5e7b4f33ddd1290dfb4f3a266ac3d7/src/main/java/test_java_repo/Main.java")

      webDriver.switchTo().window(openNewTab())
      go("chrome-extension://fahmaaghhglfmonjliepjlchgpgfmobi/popup.html?test")

      waitUntil { "#requestPanel".getText.contains("The commit(s), b0572f, aren't indexed by Lilit.") }

      "#requestButton".click()

      waitUntil {
        "#requestPanel".getText.contains(
          """
            |We've received your request. Indexing a commit can take up to 10 minutes. Please later reload the page to see if the commits have been supported.
          """.stripMargin.trim
        )
      }

      "#requestButton".isRendered() ==> false
    }

    "See an unsupported repo" - {
      go("https://github.com/tanin47/unsupported-java-repo/blob/master/Test.java")

      webDriver.switchTo().window(openNewTab())
      go("chrome-extension://fahmaaghhglfmonjliepjlchgpgfmobi/popup.html?test")

      waitUntil {
        "#failureReasonText".getText.trim == "tanin47/unsupported-java-repo isn't supported. See what to do here."
      }
    }
  }
}
