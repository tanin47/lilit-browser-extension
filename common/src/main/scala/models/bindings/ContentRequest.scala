package models.bindings

object ContentRequest {
  val tpe = "ContentRequest"
}

class ContentRequest(
  val tpe: String = ContentRequest.tpe
) extends MessageRequest {
}
