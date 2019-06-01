{
  "name": "Lilit",
  "short_name": "Lilit",
  "version": "0.0.1.0",
  "description": "Be more productive reading and reviewing Java code on Github with code intelligence",
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
