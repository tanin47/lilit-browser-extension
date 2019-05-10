package helpers

object UrlHelper {
  def isEquivalent(url1: String, url2: String): Boolean = {
    url1.split("#").head == url2.split("#").head
  }
}
