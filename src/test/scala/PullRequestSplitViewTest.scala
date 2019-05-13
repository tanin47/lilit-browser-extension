import base.BrowserTest
import utest._

object PullRequestSplitViewTest extends BrowserTest {
  val tests = Tests {
    "jumps to a definition" - {
      go("https://github.com/tanin47/test-java-repo/pull/5/files?diff=split")

      waitUntil {
        "#diff-0 .diff-table tr".items(5).select("td").items(1).select(".lilit-link").items.nonEmpty &&
          "#diff-0 .diff-table tr".items(4).select("td").items(3).select(".lilit-link").items.size >= 2
      }

      val linkOnTheLeft = "#diff-0 .diff-table tr".items(5).select("td").items(1).select(".lilit-link")
      linkOnTheLeft.hover()
      linkOnTheLeft.getToolTip.getText ==> "Defined in this file on the line 153"

      val link = "#diff-0 .diff-table tr".items(4).select("td").items(3).select(".lilit-link").items(1)

      link.hover()
      link.getToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
      link.click()

      waitUntil {
        webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/848084a2498fa8fe96a2daffc5e48d3cd9af9d90/src/main/java/test_java_repo/Library.java?p=Method_execute_job_55_c169390cd477_3#L4"
      }

      "#LC4".getAttribute("class").split(" ").toSet.contains("lilit-highlighted") ==> true
    }

    "sees usages" - {
      go("https://github.com/tanin47/test-java-repo/pull/1/files?diff=split")

      waitUntil {
        "#diff-0 .diff-table tr:nth-child(8) td:nth-child(4) .lilit-link".items.nonEmpty
      }

      val linkOnTheLeft = "#diff-0 .diff-table tr:nth-child(8) td:nth-child(2) .lilit-link"
      linkOnTheLeft.hover()
      linkOnTheLeft.getToolTip.getText ==> "Found 1 occurrence only in src/test/java/test_java_repo/MainTest.java"

      val link = "#diff-0 table tr:nth-child(8) td:nth-child(4) .lilit-link"
      link.hover()
      link.getToolTip.getText ==> "Found 1 occurrence only in src/test/java/test_java_repo/MainTest.java"
      link.click()

      waitUntil {
        webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/a7ffb8edbf181e08b25e3223a4619d1d9cf3a878/src/test/java/test_java_repo/MainTest.java?p=Class_Main_job_76_8819853fd7386_2#L10"
      }

      "#LC10".getAttribute("class").split(" ").toSet.contains("lilit-highlighted") ==> true
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
        linkOnTheLeft.hover()
        linkOnTheLeft.getToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"

        val link = "#diff-0 .diff-table tr:nth-child(2) td:nth-child(4) .lilit-link"

        link.hover()
        link.getToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
        link.click()

        waitUntil {
          webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/848084a2498fa8fe96a2daffc5e48d3cd9af9d90/src/main/java/test_java_repo/Library.java?p=Class_Library_job_55_c169390cd477_2#L3"
        }

        "#LC3".getAttribute("class").split(" ").toSet.contains("lilit-highlighted") ==> true
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
      link.hover()
      link.getToolTip.getText ==> "Defined in src/main/java/test_java_repo/Library.java inside tanin47/test-java-repo"
      link.click()

      waitUntil {
        webDriver.getCurrentUrl == "https://github.com/tanin47/test-java-repo/blob/ace7f3130c5993d3c51c6406b4cb8ff77ab16051/src/main/java/test_java_repo/Library.java?p=Class_Library_job_57_66afa90cd477_2#L3"
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
