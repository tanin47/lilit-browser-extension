import base.BrowserTest
import utest._

object PullRequestTest extends BrowserTest {
  val tests = Tests {
    "jumps to a definition (split view)" - {
      go("https://github.com/tanin47/test-java-repo/pull/5/files?diff=split")

      waitUntil {
        "#diff-0 .diff-table tr".items(5).select("td").items(1).select(".lilit-link").items.nonEmpty &&
          "#diff-0 .diff-table tr".items(4).select("td").items(3).select(".lilit-link").items.size >= 2
      }

      val linkOnTheLeft = "#diff-0 .diff-table tr".items(5).select("td").items(1).select(".lilit-link")
      linkOnTheLeft.hoverAndGetToolTip.getText ==> "Defined in this file on the line 153"

      val link = "#diff-0 .diff-table tr".items(4).select("td").items(3).select(".lilit-link").items(1)

      link.hoverAndGetToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
      link.click()

      waitUntil {
        webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/848084a2498fa8fe96a2daffc5e48d3cd9af9d90/src/main/java/test_java_repo/Library.java?p=u_5_27_build_src/main/java/test_java_repo/Library.java_3_Method_execute#L4"
      }

      waitUntil {
        "#LC4".getAttribute("class").split(" ").toSet.contains("lilit-highlighted")
      }
    }

    "jumps to a definition (unified view)" - {
      go("https://github.com/tanin47/test-java-repo/pull/1/files?diff=unified")

      waitUntil {
        "#diff-0 .diff-table tr:nth-child(11) td:nth-child(4) .lilit-link".items.nonEmpty
      }

      val linkOnSubtract = "#diff-0 .diff-table tr:nth-child(8) td:nth-child(4) .lilit-link"
      linkOnSubtract.hoverAndGetToolTip.getText ==> "Click to find all usages"

      val link = "#diff-0 .diff-table tr:nth-child(10) td:nth-child(4) .lilit-link"
      link.hoverAndGetToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
      link.click()

      waitUntil {
        webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/24e0307ad76ce2fc344f3fba3b37d48344a15f21/src/main/java/test_java_repo/Library.java?p=u_5_28_build_src/main/java/test_java_repo/Library.java_2_Class_Library#L3"
      }

      waitUntil {
        "#LC3".getAttribute("class").split(" ").toSet.contains("lilit-highlighted")
      }
    }

    "The diff is hidden because it is too long" - {
      go("https://github.com/tanin47/test-java-repo/pull/7/files")

      val loadDiffButton = "#diff-2 .load-diff-button"
      waitUntil { loadDiffButton.items.nonEmpty }

      loadDiffButton.click()

      val link = "#diff-2 .diff-table tr:nth-child(8) td:nth-child(4) .lilit-link"
      link.hoverAndGetToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
      link.click()

      waitUntil {
        webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/8e2cd946a5fd0d62ece883c43681ebd8618ae7c3/src/main/java/test_java_repo/Library.java?p=u_5_33_build_src/main/java/test_java_repo/Library.java_2_Class_Library#L3"
      }

      waitUntil {
        "#LC3".getAttribute("class").split(" ").toSet.contains("lilit-highlighted")
      }
    }

    "sees usages (split view)" - {
      go("https://github.com/tanin47/test-java-repo/pull/1/files?diff=split")

      waitUntil {
        "#diff-0 .diff-table tr:nth-child(8) td:nth-child(4) .lilit-link".items.nonEmpty
      }

      val linkOnTheLeft = "#diff-0 .diff-table tr:nth-child(8) td:nth-child(2) .lilit-link"
      linkOnTheLeft.hoverAndGetToolTip.getText ==> "Click to find all usages"

      val link = "#diff-0 table tr:nth-child(8) td:nth-child(4) .lilit-link"
      link.hoverAndGetToolTip.getText ==> "Click to find all usages"
      link.click()

      waitUntil {
        webDriver.getCurrentUrl == "https://lilit.dev/github/tanin47/test-java-repo/f6dee0110a9b1319accc3ab435e2ad9f3870776c/usage/u_5_29_build_src/main/java/test_java_repo/Main.java_2_Class_Main"
      }
    }

    "expands" - {
      def test(shouldWait: Boolean): Unit = {
        go("https://github.com/tanin47/test-java-repo/pull/5/files?diff=split")

        if (shouldWait) {
          waitUntil {
            "#diff-0 .diff-table tr:nth-child(6) td:nth-child(2) .lilit-link".items.nonEmpty
          }
        }

        // Expand
        "#diff-0 .diff-table tr".items.length ==> 9
        "#diff-0 .diff-table tr a".click()
        waitUntil { "#diff-0 .diff-table tr.blob-expanded".items.length == 20 }

        val linkOnTheLeft = "#diff-0 .diff-table tr:nth-child(2) td:nth-child(2) .lilit-link"
        linkOnTheLeft.hoverAndGetToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"

        val link = "#diff-0 .diff-table tr:nth-child(2) td:nth-child(4) .lilit-link"

        link.hoverAndGetToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
        link.click()

        waitUntil {
          webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/848084a2498fa8fe96a2daffc5e48d3cd9af9d90/src/main/java/test_java_repo/Library.java?p=u_5_27_build_src/main/java/test_java_repo/Library.java_2_Class_Library#L3"
        }

        waitUntil {
          "#LC3".getAttribute("class").split(" ").toSet.contains("lilit-highlighted")
        }
      }

      "immediately (possibly before load)" - {
        test(false)
      }

      "after load" - {
        test(true)
      }
    }

    "works with the ajaxically-loaded diffs" - {
      go("https://github.com/tanin47/test-java-repo/pull/3/files?diff=split")

      waitUntil { "#diff-37 table tr:nth-child(6) td:nth-child(4) .lilit-link".items.nonEmpty }

      val link = "#diff-37 table tr:nth-child(6) td:nth-child(4) .lilit-link"
      link.hoverAndGetToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
      link.click()

      waitUntil {
        webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/ace7f3130c5993d3c51c6406b4cb8ff77ab16051/src/main/java/test_java_repo/Library.java?p=u_5_32_build_src/main/java/test_java_repo/Library.java_2_Class_Library#L3"
      }
    }

    "request for a commit" - {
      go("https://github.com/tanin47/test-java-repo/pull/6/files?diff=split")

      webDriver.switchTo().window(openNewTab())
      go("chrome-extension://fahmaaghhglfmonjliepjlchgpgfmobi/popup.html?test")

      waitUntil { "#requestPanel".getText.contains("The commit(s), 7bc997, aren't indexed by Lilit.") }

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
  }
}
