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
        center: [52.3702, 4.8952],
        zoom: 13,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      L.marker([52.3702, 4.8952]).addTo(this.map).bindPopup("Hier is Amsterdam!");
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
