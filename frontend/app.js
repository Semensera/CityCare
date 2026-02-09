let selectedLat = null;
let selectedLng = null;
let marker = null;

// карта на сторінці додавання
if (document.getElementById("map") && !document.getElementById("mapPage")) {
  const map = L.map("map").setView([48.9226, 24.7111], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  // клік по карті
  map.on("click", function (e) {
    selectedLat = e.latlng.lat;
    selectedLng = e.latlng.lng;

    if (marker) {
      marker.setLatLng(e.latlng);
    } else {
      marker = L.marker(e.latlng).addTo(map);
    }
  });

  // геолокація
  window.getMyLocation = function () {
    if (!navigator.geolocation) {
      alert("Геолокація не підтримується");
      return;
    }

    navigator.geolocation.getCurrentPosition(position => {
      selectedLat = position.coords.latitude;
      selectedLng = position.coords.longitude;

      map.setView([selectedLat, selectedLng], 16);

      if (marker) {
        marker.setLatLng([selectedLat, selectedLng]);
      } else {
        marker = L.marker([selectedLat, selectedLng]).addTo(map);
      }
    });
  };
}

// відправка проблеми
function addProblem() {
  if (selectedLat === null || selectedLng === null) {
    alert("❗ Виберіть місце на карті або використайте геолокацію");
    return;
  }

  const problem = {
    title: title.value,
    description: description.value,
    category: category.value,
    lat: selectedLat,
    lng: selectedLng
  };

  fetch("http://localhost:3000/problems", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(problem)
  })
    .then(() => {
      alert("✅ Проблему додано");
      window.location.href = "map.html";
    });
}
