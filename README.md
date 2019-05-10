Lilit's Browser Extension
==========================

* Website: https://lilit.dev
* Browser extension: https://chrome.google.com/webstore/detail/lilitdev/jneikemokfonahdggpfmjboadekgagif


Security
---------

Please see `src/main/resources/manifest_prod.json` for the permissions we ask.


Develop
--------

1. Run `npm install`
2. Run `sbt ~buildDev`. Any change is re-compiled immediately.


Release
--------

1. Run `sbt buildProd`
2. Go to https://chrome.google.com/webstore/developer/edit/jneikemokfonahdggpfmjboadekgagif and upload `target/lilit-chrome-extension.zip