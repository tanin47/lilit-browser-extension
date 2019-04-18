package chrome.storage2

import scala.concurrent.{Future, Promise}
import scala.scalajs.js
import scala.util.Success

class StorageArea(binding: bindings2.StorageArea) {

  def get(keys: Map[String, Any]): Future[Map[String, Any]] = {
    val promise = Promise[Map[String, Any]]()
    binding.get(
      keys = js.defined(js.Dictionary.apply(keys.toList:_*)),
      callback = { result =>
        promise.complete(Success(result.asInstanceOf[js.Dictionary[Any]].toList.toMap))
      }
    )

    promise.future
  }

  def set(keys: Map[String, Any]): Future[Unit] = {
    val promise = Promise[Unit]()
    binding.set(
      keys = js.defined(js.Dictionary.apply(keys.toList:_*).asInstanceOf[js.Object]),
      callback = { () => promise.complete(Success(())) }
    )
    promise.future
  }

  def clear(): Future[Unit] = {
    val promise = Promise[Unit]()
    binding.clear(
      callback = { () => promise.complete(Success(())) }
    )
    promise.future
  }
}
