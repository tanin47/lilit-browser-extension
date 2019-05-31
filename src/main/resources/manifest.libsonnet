{
  "name": "Lilit.dev",
  "short_name": "lilit.dev",
  "version": "0.0.0.14",
  "description": "",
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
