<template>
  <div class="historical-data-container">
    <!-- Header -->
    <header>
      <h1>Historische Data</h1>
      <button class="back-button" @click="goToHome">Terug naar Home</button>
    </header>

    <!-- Navigatieknoppen en dropdowns -->
    <nav class="sensor-menu">
      <div class="dropdowns">
        <label for="period-select">Periode:</label>
        <select id="period-select" v-model="selectedPeriod" @change="fetchTDS(); fetchPH();">
          <option v-for="period in periods" :key="period.DATUM_TIJDT" :value="period.DATUM_TIJDT">
            {{ period.DATUM_TIJDT }}
          </option>
        </select>

        <label for="buoy-select">Boei:</label>
        <select id="buoy-select" v-model="selectedBuoy" @change="fetchBuoyData">
          <option v-for="buoy in buoys" :key="buoy.NAAM" :value="buoy.ID_NAME">
            {{ buoy.NAAM }}
          </option>
        </select>
      </div>

      <div class="sensor-buttons">
        <button @click="selectGraph('TDSGraph')">TDS Data</button>
        <button @click="selectGraph('PhGraph')">pH Data</button>
        <button @click="selectGraph('ZuurstofGraph')">Zuurstof Data</button>
        <button @click="selectGraph('TempGraph')">Temperatuur Data</button>
        <button @click="selectGraph('TroebelGraph')">Troebelheid Data</button>
      </div>
    </nav>

    <!-- Dynamisch geladen grafiek -->
    <main>
      <section class="chart-section">
        <component :is="currentGraph" :data="graphData[currentGraph]" :label="graphlabel" />
      </section>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import TDSGraph from "./graphs/TDSGraph.vue";
import PhGraph from "./graphs/PhGraph.vue";
import ZuurstofGraph from "./graphs/ZuurstofGraph.vue";
import TempGraph from "./graphs/TempGraph.vue";
import TroebelGraph from "./graphs/TroebelGraph.vue";

export default {
  name: "HistoricalData",
  components: {
    TDSGraph,
    PhGraph,
    ZuurstofGraph,
    TempGraph,
    TroebelGraph,
  },
  data() {
    return {
      currentGraph: "TDSGraph", // Standaard geselecteerde grafiek
      periods: {},
      buoys: {},
      graphlabel: [],
      graphData: {
        TDSGraph: [],
        PhGraph: [],
        ZuurstofGraph: [],
        TempGraph: [],
        TroebelGraph: [],
      },
      selectedPeriod: "Vandaag",
      selectedBuoy: "Boei 1",
      currentData: {}, // Placeholder voor API-gegevens
      sensorData: {}, // Placeholder voor API-sensorgegevens
    };
  },
  methods: {
    async fetchTDS() {
      try {
        const payload = {
          type: "EVGSELCT",
          Datum: this.selectedPeriod,
          Boei_ID: this.selectedBuoy,
        };

        const tdsResponse = await axios.post(
          "https://nodeapi.hopto.org:1880/metingdata",
          payload
        );
        const EGVArray = tdsResponse.data;
        const turbidityData = [];
        const Label = [];


        for (const element of EGVArray) {
          turbidityData.push(element.EGV || null);
          Label.push(element.DATUM_TIJD || "Unknown");

        }
        this.graphData.TDSGraph = turbidityData;
        this.graphlabel = Label;
        console.log(this.TDSdata);
      } catch (error) {
        console.error("Error fetching period data:", error);
      }
    },
    async fetchPH() {
      try {
        const payload = {
          type: "PHSELCT",
          Datum: this.selectedPeriod,
          Boei_ID: this.selectedBuoy,
        };

        const phResponse = await axios.post(
          "https://nodeapi.hopto.org:1880/metingdata",
          payload
        );

        // Check of de response bestaat en een array is
        if (phResponse.data && Array.isArray(phResponse.data)) {
          this.graphData.PhGraph = phResponse.data.map(entry => entry.PH || null);
        } else {
          console.warn("Ongeldige of lege pH data ontvangen:", phResponse.data);
          this.graphData.PhGraph = [null]; // Zet een standaardwaarde om crashes te voorkomen
        }

      } catch (error) {
        console.error("Error fetching pH data:", error);
        this.graphData.PhGraph = [null]; // Zorg dat de grafiek een geldige waarde heeft
      }
    },
    async fetchBuoyData() {
      console.log(this.selectedBuoy);

      try {
        const payload = {
          type: "DATESELCT",
          Boei_ID: this.selectedBuoy,
        };

        const response = await axios.post(
          "https://nodeapi.hopto.org:1880/metingdata",
          payload
        );
        console.log(this.selectedBuoy);
        console.log("Boeidata response:", response);

        if (response.data) {
          this.periods = response.data;
        }
      } catch (error) {
        console.error("Error fetching buoy data:", error);
      }
    },

    selectGraph(graphName) {
      this.currentGraph = graphName;
    },
    goToHome() {
      this.$router.push("/");
    },
  },
  async mounted() {
    try {
      const payload = {
        type: "READ",
        key: "value",
      };

      const response = await axios.post(
        "https://nodeapi.hopto.org:1880/boei",
        payload
      );

      console.log("Mounted response:", response.data);
      if (response.data) {
        console.log(response.data.ID_NAME);
        this.buoys = response.data;
      }
      console.log(this.buoys);
    } catch (error) {
      console.error("Error fetching data during mount:", error);
    }
  },
};
</script>

<style>
.historical-data-container {
  display: grid;
  grid-template-areas:
    "menu menu menu menu"
    "chart chart chart chart";
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto 1fr;
  gap: 20px;
  padding: 20px;
}

header {
  grid-area: menu;
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.back-button:hover {
  background-color: #0056b3;
}

.sensor-menu {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.sensor-buttons {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.sensor-buttons button {
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.sensor-buttons button:hover {
  background-color: #0056b3;
}

.dropdowns {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 20px;
}

.dropdowns select {
  padding: 5px 10px;
  font-size: 14px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.chart-section {
  grid-area: chart;
  border: 1px solid #ccc;
  border-radius: 10px;
  overflow: hidden;
  padding: 10px;
  background-color: #f9f9f9;
}
</style>