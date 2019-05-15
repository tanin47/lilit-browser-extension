import base.BrowserTest
import utest.Tests
import utest._

object TooltipTest extends BrowserTest {
  val tests = Tests {
    "shows 'defined in'" - {
      go("https://github.com/tanin47/test-java-repo/blob/e7b0af0ad9d4462b6605ebdcffcbb17807faceb8/src/main/java/test_java_repo/Main.java")

      val usage = "#LC7 .lilit-link"
      waitUntil { usage.items.nonEmpty }

      usage.hover()
      usage.getToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
      usage.click()

      waitUntil {
        webDriver.getCurrentUrl.startsWith("https://github.com/tanin47/test-java-repo/blob/e7b0af0ad9d4462b6605ebdcffcbb17807faceb8/src/main/java/test_java_repo/Library.java")
      }

      webDriver.getCurrentUrl.contains("#L3") ==> true
      "#LC3".getClasses.contains("lilit-highlighted") ==> true
    }

    // TODO: We should write more tests on a tooltip with multiple files
    "shows 'used in multiple files'" - {
      go("https://github.com/tanin47/test-java-repo/blob/e7b0af0ad9d4462b6605ebdcffcbb17807faceb8/src/main/java/test_java_repo/Main.java")

      waitUntil { "#LC158 .lilit-link".items.nonEmpty }

      val usage = "#LC158 .lilit-link".items(1)
      usage.hover()
      usage.getToolTip.getText ==>
        """
          |Found 1 occurrence in this file
          |Found 1 occurrence in src/test/java/test_java_repo/MainTest.java
        """.stripMargin.trim

      val links = usage.getToolTip.select("a").items
      links.head.getAttribute("href").startsWith("https://github.com/tanin47/test-java-repo/blob/e7b0af0ad9d4462b6605ebdcffcbb17807faceb8/src/main/java/test_java_repo/Main.java") ==> true
      links.head.getAttribute("href").contains("#L152") ==> true

      links(1).getAttribute("href").startsWith("https://github.com/tanin47/test-java-repo/blob/e7b0af0ad9d4462b6605ebdcffcbb17807faceb8/src/test/java/test_java_repo/MainTest.java") ==> true
      links(1).getAttribute("href").contains("#L10") ==> true
    }

    "shows 'used only in this file'" - {
      go("https://github.com/tanin47/test-java-repo/blob/e7b0af0ad9d4462b6605ebdcffcbb17807faceb8/src/main/java/test_java_repo/Main.java")

      val usage = "#LC156 .lilit-link"
      waitUntil { usage.items.nonEmpty }

      usage.hover()
      usage.getToolTip.getText ==> "Found 1 occurrence only in this file"
      usage.click()

      waitUntil {
        webDriver.getCurrentUrl.startsWith("https://github.com/tanin47/test-java-repo/blob/e7b0af0ad9d4462b6605ebdcffcbb17807faceb8/src/main/java/test_java_repo/Main.java")
      }

      webDriver.getCurrentUrl.contains("#L153") ==> true
      "#LC153".getClasses.contains("lilit-highlighted") ==> true
    }

    "shows 'used only in the other file'" - {
      go("https://github.com/tanin47/test-java-repo/blob/e7b0af0ad9d4462b6605ebdcffcbb17807faceb8/src/main/java/test_java_repo/Library.java")

      val usage = "#LC4 .lilit-link"
      waitUntil { usage.items.nonEmpty }

      usage.hover()
      usage.getToolTip.getText ==> "Found 145 occurrences only in src/main/java/test_java_repo/Main.java"
      usage.click()

      waitUntil {
        webDriver.getCurrentUrl.startsWith("https://github.com/tanin47/test-java-repo/blob/e7b0af0ad9d4462b6605ebdcffcbb17807faceb8/src/main/java/test_java_repo/Main.java")
      }

      webDriver.getCurrentUrl.contains("#L7") ==> true
      "#LC7".getClasses.contains("lilit-highlighted") ==> true
      "#LC8".getClasses.contains("lilit-highlighted") ==> true
      "#LC9".getClasses.contains("lilit-highlighted") ==> true
      // Other lines are highlighted as well. But we only test for these 3 lines.
    }
  }
}
