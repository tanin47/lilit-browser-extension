Lilit's Browser Extension
==========================

* Website: https://lilit.dev
* Browser extension: https://chrome.google.com/webstore/detail/lilitdev/jneikemokfonahdggpfmjboadekgagif


Security and Privacy
---------------------

Please see `dist/lilit-browser-extension/manifest.json` for the permissions we ask.

* In our browser extension, we do not send the content of the page to our backend. We only send the URL to the backend. All ajax calls are performed in `Background.scala`. See here: https://github.com/tanin47/lilit-browser-extension/blob/master/background/src/main/scala/Background.scala#L84 and https://github.com/tanin47/lilit-browser-extension/blob/master/common/src/main/scala/models/bindings/FileRequestRequest.scala
* We can only read cookies from https://lilit.dev. This is for authentication when private repos are involved. See the defined permission with its scope here: https://github.com/tanin47/lilit-browser-extension/blob/master/dist/lilit-browser-extension/manifest.json#L44
* We cannot read your past browsing history. The permission `webNavigation`, unfortunately, is shown to end users as "Read your browsing history". We use `webNavigation` to detect URL change. See the relevant code here: https://github.com/tanin47/lilit-browser-extension/blob/master/background/src/main/scala/Background.scala#L41. See the discussion here: https://bugs.chromium.org/p/chromium/issues/detail?id=429185

We take security and privacy with the utmost care. Please never hesitate to reach out if you have a question through our email: tanin(at)lilit.dev.


Develop
--------

1. Run `npm install`
2. Run `sbt ~buildLocal`. Any change is re-compiled immediately.


Release
--------

1. Run `sbt buildProd`
2. Go to https://chrome.google.com/webstore/developer/edit/jneikemokfonahdggpfmjboadekgagif and upload `target/lilit-chrome-extension.zip
