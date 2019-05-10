local template = import 'manifest.libsonnet';

template {
  "name"+: " [Local]",
  "short_name"+: ".local",
  "permissions"+: [
    "cookies",
    "http://localhost:9000/*"
  ],
  "content_scripts"+: [
    {
      "matches": ["*://localhost:*/*"],
      "js": ["modify-path.js"]
    }
  ]
}
