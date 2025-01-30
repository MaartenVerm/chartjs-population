<template>
  <div id="map"></div>
</template>

<script>
import L from "leaflet";

export default {
  name: "MapComponent",
  data() {
    return {
      map: null,
      marker: null, // Marker wordt dynamisch geüpdatet
    };
  },
  mounted() {
    this.initializeMap();
  },
  beforeUnmount() {
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
  },
  methods: {
    initializeMap() {
      this.map = L.map("map", {
        center: [52.3702, 4.8952], // Standaard coördinaten (Amsterdam)
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      // Maak een lege marker die later wordt geüpdatet
      this.marker = L.marker([52.3702, 4.8952])
        .addTo(this.map)
        .bindPopup("Geen locatie beschikbaar");
    },
    updateMarker(lat, lon) {
      if (this.marker) {
        this.marker
          .setLatLng([lat, lon])
          .setPopupContent(`Laatste locatie: ${lat}, ${lon}`)
          .openPopup();
        this.map.setView([lat, lon], 13); // Verplaats de kaart naar de nieuwe locatie
      } else {
        console.error("Marker niet geïnitialiseerd!");
      }
    },
  },
};
</script>

<style>
#map {
  width: 100%;
  height: 400px;
}
</style>
