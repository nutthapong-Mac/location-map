// ===== CONFIG =====
const PLANNED_LAT = 13.7563;   // ใส่จาก SharePoint / DB
const PLANNED_LNG = 100.5018;
const PASS_LIMIT = 50;
const REVIEW_LIMIT = 150;

// ===== MAP INIT =====
const map = L.map("map").setView([PLANNED_LAT, PLANNED_LNG], 17);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

// Planned Marker
const plannedMarker = L.marker([PLANNED_LAT, PLANNED_LNG], {
  title: "Planned Location"
}).addTo(map);

// Actual Marker (empty)
let actualMarker = null;

// ===== GEOLOCATION =====
document.getElementById("btnLocate").onclick = () => {
  if (!navigator.geolocation) {
    alert("อุปกรณ์ไม่รองรับ GPS");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      if (actualMarker) {
        actualMarker.setLatLng([lat, lng]);
      } else {
        actualMarker = L.marker([lat, lng], { title: "Actual Location" }).addTo(map);
      }

      map.setView([lat, lng], 18);

      const distance = calcDistance(
        PLANNED_LAT,
        PLANNED_LNG,
        lat,
        lng
      );

      document.getElementById("distance").innerText = distance.toFixed(1);

      let status = "FAIL";
      if (distance <= PASS_LIMIT) status = "PASS";
      else if (distance <= REVIEW_LIMIT) status = "REVIEW";

      document.getElementById("status").innerText = status;

      // ===== SEND TO BACKEND =====
      sendResult(lat, lng, distance, status);
    },
    err => {
      alert("ไม่สามารถดึงพิกัดได้");
    },
    {
      enableHighAccuracy: true,
      timeout: 10000
    }
  );
};

// ===== DISTANCE (Haversine) =====
function calcDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = v => v * Math.PI / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

// ===== BACKEND HOOK =====
function sendResult(lat, lng, distance, status) {
  console.log("SEND", {
    actual_lat: lat,
    actual_lng: lng,
    distance_m: distance,
    verify_status: status,
    timestamp: new Date().toISOString(),
    user_agent: navigator.userAgent
  });

  // 👉 ตรงนี้ต่อ SharePoint / API จริงได้
}
