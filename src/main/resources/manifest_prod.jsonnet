local template = import 'manifest.libsonnet';

template {
  "permissions"+: [
    "cookies",
    "https://lilit.dev/*"
  ],
  "content_scripts"+: [
    {
      "matches": ["*://lilit.dev/*", "*://*.lilit.dev/*"],
      "js": ["modify-path.js"]
    }
  ]
}
