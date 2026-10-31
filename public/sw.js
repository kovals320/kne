// Minimal service worker so phones treat the site as an installable app.
// It does not cache anything: the rain numbers always come fresh from the network.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
