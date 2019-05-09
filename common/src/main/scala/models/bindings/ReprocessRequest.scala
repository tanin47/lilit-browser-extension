package models.bindings

import chrome.webNavigation.bindings.OnCommittedDetails

object ReprocessRequest {
  val tpe = "ReprocessRequest"
}

class ReprocessRequest(
  val details: OnCommittedDetails,
  val tpe: String = ReprocessRequest.tpe
) extends MessageRequest {
}
