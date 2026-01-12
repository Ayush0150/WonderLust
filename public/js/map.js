// GeoJSON format: [lng, lat]
const [lng, lat] = listing.geometry.coordinates;

// Initialize map
const map = L.map("map", {
  scrollWheelZoom: false,
  zoomControl: false,
}).setView([lat, lng], 13);

// Tile layer (clean & green)
L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 20,
}).addTo(map);

// Zoom control bottom-right
L.control.zoom({ position: "bottomright" }).addTo(map);

// Modern marker using listing data
L.circleMarker([lat, lng], {
  radius: 10,
  fillColor: "#ff385c", // Airbnb-style red
  color: "#fff",
  weight: 2,
  fillOpacity: 0.9,
})
  .addTo(map)
.bindPopup(`
  <div class="popup-premium">
    <div class="popup-title">${listing.title}</div>
    <div class="popup-sub">
      📍 Exact location provided after booking
    </div>
  </div>
`);

// Smooth camera animation
map.flyTo([lat, lng], 13, {
  animate: true,
  duration: 1.2,
});
