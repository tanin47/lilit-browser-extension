{
  "name": "Lilit",
  "short_name": "Lilit",
  "version": "0.0.1.4",
  "description": "Be more productive reading Java code on Github with code intelligence",
  "manifest_version": 2,
  "permissions": [
    "declarativeContent",
    "activeTab",
    "webNavigation",
  ],
  "background": {
    "scripts": ["background.js"],
    "persistent": false
  },
  "icons": { "512": "images/logo.png" },
  "content_scripts": [
    {
      "matches": ["*://*.github.com/*", "*://github.com/*"],
      "css": ["content.css"],
      "js": ["content.js"]
    }
  ],
  "page_action": {
    "default_popup": "popup.html"
  },
  "web_accessible_resources": [
    "config.json"
  ]
}
