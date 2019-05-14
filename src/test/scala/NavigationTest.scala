import base.BrowserTest
import utest._

object NavigationTest extends BrowserTest {
  val tests = Tests {
    "Use back/forward button" - {
      go("https://github.com/tanin47/test-java-repo/pull/5/files")

      waitUntil { ".lilit-link".nonEmpty }

      val link = ".lilit-link"
      waitUntil {
        link.hover()
        link.getToolTip.getText == "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
      }
      link.click()

      waitUntil {
        webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/d022270ccb8f346cb8ef2136c4212ff71802eff5/src/main/java/test_java_repo/Library.java?p=Class_Library_job_56_d3ea090cd477_2#L3"
      }

      waitUntil {
        link.hover()
        link.getToolTip.getText == "Found 145 occurrences only in src/main/java/test_java_repo/Main.java"
      }

      webDriver.navigate().back()
      waitUntil {
        link.hover()
        link.getToolTip.getText == "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
      }

      webDriver.navigate().forward()
      waitUntil {
        link.hover()
        link.getToolTip.getText == "Found 145 occurrences only in src/main/java/test_java_repo/Main.java"
      }
    }

    "Navigate between tabs" - {
      "click" - {
        go("https://github.com/tanin47/test-java-repo/pull/5/files")

        waitUntil { ".lilit-link".nonEmpty }

        ".tabnav-tab".items(1).click()
        waitUntil { ".commits-listing".nonEmpty }
        Thread.sleep(1000)

        ".tabnav-tab".items(3).click()
        val link = ".lilit-link"
        waitUntil {
          link.hover()
          link.getToolTip.getText == "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
        }
      }

      "use back button" - {
        go("https://github.com/tanin47/test-java-repo/pull/5/files")

        waitUntil { ".lilit-link".nonEmpty }

        ".tabnav-tab".items(1).click()
        waitUntil { ".commits-listing".nonEmpty }
        Thread.sleep(1000)

        webDriver.navigate().back()
        val link = ".lilit-link"
        waitUntil {
          link.hover()
          link.getToolTip.getText == "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
        }
      }
    }

    "Navigate file tree" - {
      "click" - {
        go("https://github.com/tanin47/test-java-repo/blob/d022270ccb8f346cb8ef2136c4212ff71802eff5/src/main/java/test_java_repo/Main.java")

        waitUntil { ".lilit-link".nonEmpty }

        ".js-path-segment".items(4).click()

        waitUntil { ".files .js-navigation-open".items.size >= 2 }
        Thread.sleep(1000)

        ".files .js-navigation-open".items(2).click()

        waitUntil { ".lilit-link".nonEmpty }

        val link = ".lilit-link"
        waitUntil {
          link.hover()
          link.getToolTip.getText == "Found 1 occurrence only in src/test/java/test_java_repo/MainTest.java"
        }
      }

      "use back button" - {
        go("https://github.com/tanin47/test-java-repo/blob/d022270ccb8f346cb8ef2136c4212ff71802eff5/src/main/java/test_java_repo/Main.java")

        waitUntil { ".lilit-link".nonEmpty }

        ".js-path-segment".items(4).click()

        waitUntil { ".files .js-navigation-open".items.size >= 2 }
        Thread.sleep(1000)

        webDriver.navigate().back()

        waitUntil { ".lilit-link".nonEmpty }

        val link = ".lilit-link"
        waitUntil {
          link.hover()
          link.getToolTip.getText == "Found 1 occurrence only in src/test/java/test_java_repo/MainTest.java"
        }
      }
    }
  }
}
