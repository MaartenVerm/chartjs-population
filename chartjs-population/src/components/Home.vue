<template>
  <div class="app-container">
    <header>
      <h1>Waterkwaliteit Dashboard</h1>
      <nav class="top-menu">
        <button @click="$router.push('/historical')">Historische Data</button>
        <button @click="showAddBuoyPopup = true">Boei toevoegen</button>
        <button @click="$router.push('/Maintenance')">Onderhoud</button>
        <button @click="exportData">Export Data</button>
      </nav>
    </header>

    <main>
      <!-- Kaart -->
      <section class="map-section">
        <MapComponent ref="mapComponent" />
      </section>

      <!-- Huidige waarden -->
      <section class="current-values-section">
        <CurrentValuesComponent :data="currentData" />
      </section>

      <!-- Waarschuwingen -->
      <section class="alerts-section">
        <AlertsComponent :alerts="alerts" />
      </section>

      <!-- Grafieken -->
      <section class="graphs-section">
        <GraphComponent title="pH" :dataPoints="sensorData.pH" />
        <GraphComponent title="TDS" :dataPoints="sensorData.TDS" />
        <GraphComponent title="Zuurstof" :dataPoints="sensorData.zuurstof" />
        <GraphComponent title="Troebelheid" :dataPoints="sensorData.troebelheid" />
        <GraphComponent title="Temperatuur" :dataPoints="sensorData.temperatuur" />
      </section>

      <!-- Popup voor boei toevoegen -->
      <div class="popup" v-if="showAddBuoyPopup">
        <div class="popup-content">
          <h2>Boei Toevoegen</h2>
          <form @submit.prevent="addBuoy">
            <label for="buoy-id">Boei ID:</label>
            <input type="text" id="buoy-id" v-model="newBuoy.id" required />

            <label for="buoy-name">Naam:</label>
            <input type="text" id="buoy-name" v-model="newBuoy.name" required />

            <div class="popup-actions">
              <button type="submit">Opslaan</button>
              <button type="button" @click="closePopup">Annuleren</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Footer -->
      <footer class="footer-section">
        <p>Informatie laatste update: 2025-01-19</p>
      </footer>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import download from "downloadjs";
import MapComponent from "./MapComponent.vue";
import CurrentValuesComponent from "./CurrentValuesComponent.vue";
import AlertsComponent from "./AlertsComponent.vue";
import GraphComponent from "./GraphComponent.vue";

export default {
  name: "App",
  components: {
    MapComponent,
    CurrentValuesComponent,
    AlertsComponent,
    GraphComponent,
  },
  data() {
    return {
      currentData: {
        pH: 7.2,
        TDS: 350,
        zuurstof: 5.5,
        troebelheid: 15,
        temperatuur: 20.0,
      },
      alerts: [
        { id: 1, sensor: "TDS", message: "Waarde boven normaal" },
        { id: 2, sensor: "pH", message: "Waarde onder normaal" },
      ],
      sensorData: {
        pH: [7.0, 7.1, 7.2, 7.3, 7.4],
        TDS: [340, 345, 350, 355, 360],
        zuurstof: [5.2, 5.3, 5.4, 5.5, 5.6],
        troebelheid: [12, 14, 15, 16, 14],
        temperatuur: [19.0, 19.5, 20.0, 20.5, 21.0],
      },
      showAddBuoyPopup: false,
      newBuoy: {
        id: "",
        name: "",
      },
    };
  },
  methods: {
    async addBuoy() {
      try {
        const payload = {
          type: 'CREATE',
          id: this.newBuoy.id,
          name: this.newBuoy.name,
        };

        const response = await axios.post(
          "https://nodeapi.hopto.org:1880/boei",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.success) {
          console.log(`Boei met ID: ${this.newBuoy.id} en naam: ${this.newBuoy.name} succesvol toegevoegd.`);
          alert(`Boei met ID: ${this.newBuoy.id} en naam: ${this.newBuoy.name} is succesvol toegevoegd!`);
          this.closePopup();
        } else {
          alert("Er is een fout opgetreden bij het toevoegen van de boei.");
        }
      } catch (error) {
        console.error("Fout bij het toevoegen van de boei:", error);
        alert("Kan de boei niet toevoegen. Probeer het later opnieuw.");
      }
    },

    closePopup() {
      this.showAddBuoyPopup = false;
      this.newBuoy.id = "";
      this.newBuoy.name = "";
    },

    async exportData() {
      try {
        const payload = { type: "standaard" };

        const response = await axios.post(
          "https://nodeapi.hopto.org:1880/metingdata",
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          const dataToExport = {
            timestamp: new Date().toISOString(),
            apiData: response.data,
          };

          download(
            JSON.stringify(dataToExport, null, 2),
            "api_sensor_data.json",
            "application/json"
          );
        } else {
          console.warn("Geen data ontvangen van de API");
        }
      } catch (error) {
        console.error("Fout bij exporteren van data:", error);
      }
    },

    async fetchLastPosition() {
      try {
        const payload = { type: "GPSSELCT" };
        const response = await axios.post(
          "https://nodeapi.hopto.org:1880/metingdata",
          payload
        );

        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const lastPosition = response.data[response.data.length - 1];
          console.log("Laatste positie ontvangen:", lastPosition);

          if (lastPosition.GPS_La && lastPosition.GPS_Lo) {
            this.$refs.mapComponent.updateMarker(lastPosition.GPS_La, lastPosition.GPS_Lo);
          } else {
            console.warn("Ongeldige GPS-gegevens ontvangen:", lastPosition);
          }
        } else {
          console.warn("Geen GPS-data ontvangen:", response.data);
        }
      } catch (error) {
        console.error("Fout bij ophalen van GPS-data:", error);
      }
    },
  },
  async mounted() {
    await this.fetchLastPosition();
  },
};
</script>

<style>
.map-section {
  margin-bottom: 20px;
}

.popup {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 400px;
  max-width: 100%;
}

.popup-content label {
  display: block;
  margin: 10px 0 5px;
}

.popup-content input {
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
