var cacheName = "phaser-v1";
var filesToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/font/font.png",
  "/assets/font/font.xml",
  "/assets/sounds/explosion-2.mp3",
  "/assets/sounds/explosion.mp3",
  "/assets/sounds/music.mp3",
  "/assets/sounds/shoot.mp3",
  "/assets/spritesheets/beamBlue.png",
  "/assets/spritesheets/explosion.png",
  "/assets/spritesheets/gray-btn.png",
  "/assets/spritesheets/icon-192.png",
  "/assets/spritesheets/icon-256.png",
  "/assets/spritesheets/icon-512.png",
  "/assets/spritesheets/joystick-btm.png",
  "/assets/spritesheets/joystick-top.png",
  "/assets/spritesheets/laserbase.png",
  "/assets/spritesheets/lasers.png",
  "/assets/tilesets/metalface78x92.png",
  "/assets/tilesets/shmup-ship2.png",
  "/assets/tilesets/star.png",
  "/assets/tilesets/star2.png",
  "/assets/tilesets/star3.png",
  "/assets/tilesets/star4.png",
  "/scripts/BaseScene.js",
  "/scripts/beam.js",
  "/scripts/explosion.js",
  "/scripts/main.js",
  "/scripts/phaser.min.js",
  "/scripts/Scene1.js",
  "/styles/styles.css",
];

self.addEventListener("install", function (event) {
  console.log("sw install");
  event.waitUntil(
    caches
      .open(cacheName)
      .then(function (cache) {
        console.log("sw caching files");
        return cache.addAll(filesToCache);
      })
      .catch(function (err) {
        console.log(err);
      })
  );
});

self.addEventListener("fetch", (event) => {
  console.log("sw fetch");
  console.log(event.request.url);
  event.respondWith(
    caches
      .match(event.request)
      .then(function (response) {
        return response || fetch(event.request);
      })
      .catch(function (error) {
        console.log(error);
      })
  );
});

self.addEventListener("activate", function (event) {
  console.log("sw activate");
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(
        keyList.map(function (key) {
          if (key !== cacheName) {
            console.log("sw removing old cache", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
});
