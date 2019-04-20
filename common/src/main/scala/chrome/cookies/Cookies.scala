package chrome.cookies

import scala.concurrent.{Future, Promise}
import scala.scalajs.js
import scala.scalajs.js.JSConverters._
import scala.util.Success

object Cookies {

  def get(details: GetCookieDetails): Future[Option[Cookie]] = {
    val promise = Promise[Option[Cookie]]()
    bindings.Cookies.get(
      details = new bindings.GetCookieDetails {
        val url = details.url
        val name = details.name
        val storeId = details.storeIdOpt.orUndefined
      },
      callback = js.Any.fromFunction1 { cookieOpt  =>
        promise.complete(Success(
          cookieOpt.toOption.filter(_ != null).map { cookie =>
            Cookie(
              name = cookie.name,
              value = cookie.value
            )
          }
        ))
      }
    )
    promise.future
  }
}

case class GetCookieDetails(
  url: String,
  name: String,
  storeIdOpt: Option[String] = None
)

case class Cookie(
  name: String,
  value: String
)
