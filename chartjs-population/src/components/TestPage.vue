<template>
    <div class="test-container">
      <header>
        <h1>Testpagina - Waterkwaliteit</h1>
        <button @click="$router.push('/')">Terug naar Home</button>
      </header>
  
      <!-- Dropdowns voor Periode en Boei -->
      <nav class="dropdown-menu">
        <div>
          <label for="period-select">Periode:</label>
          <select id="period-select" v-model="selectedPeriod" @change="fetchData">
            <option v-for="period in periods" :key="period.DATUM_TIJDT" :value="period.DATUM_TIJDT">
              {{ period.DATUM_TIJDT }}
            </option>
          </select>
        </div>
  
        <div>
          <label for="buoy-select">Boei:</label>
          <select id="buoy-select" v-model="selectedBuoy" @change="fetchData">
            <option v-for="buoy in buoys" :key="buoy.NAAM" :value="buoy.ID_NAME">
              {{ buoy.NAAM }}
            </option>
          </select>
        </div>
      </nav>
  
      <!-- Twee Grafieken -->
      <section class="chart-section">
        <GraphComponent title="pH Waarde" :dataPoints="graphData.PhGraph" :labels="graphLabels" />
        <GraphComponent title="TDS Waarde" :dataPoints="graphData.TDSGraph" :labels="graphLabels" />
      </section>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  import GraphComponent from "@/components/GraphComponent.vue"; // Zorg dat dit pad klopt
  
  export default {
    name: "TestPage",
    components: {
      GraphComponent,
    },
    data() {
      return {
        selectedPeriod: "Vandaag",
        selectedBuoy: "Boei 1",
        periods: [],
        buoys: [],
        graphLabels: [],
        graphData: {
          PhGraph: [],
          TDSGraph: [],
        },
      };
    },
    methods: {
      async fetchData() {
        try {
          const phPayload = {
            type: "PHSELCT",
            Datum: this.selectedPeriod,
            Boei_ID: this.selectedBuoy,
          };
  
          const tdsPayload = {
            type: "EVGSELCT",
            Datum: this.selectedPeriod,
            Boei_ID: this.selectedBuoy,
          };
  
          // API Calls tegelijk uitvoeren
          const [phResponse, tdsResponse] = await Promise.all([
            axios.post("https://nodeapi.hopto.org:1880/metingdata", phPayload),
            axios.post("https://nodeapi.hopto.org:1880/metingdata", tdsPayload),
          ]);
  
          this.graphData.PhGraph = phResponse.data.map(entry => entry.PH || null);
          this.graphData.TDSGraph = tdsResponse.data.map(entry => entry.EGV || null);
          this.graphLabels = tdsResponse.data.map(entry => entry.DATUM_TIJDT || "Onbekend");
  
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      },
  
      async fetchBuoyData() {
        try {
          const response = await axios.post("https://nodeapi.hopto.org:1880/metingdata", {
            type: "DATESELCT",
            Boei_ID: this.selectedBuoy,
          });
  
          if (response.data) {
            this.periods = response.data;
          }
        } catch (error) {
          console.error("Error fetching buoy data:", error);
        }
      },
    },
    async mounted() {
      await this.fetchBuoyData();
      await this.fetchData();
    },
  };
  </script>
  
  <style>
  .test-container {
    padding: 20px;
    max-width: 800px;
    margin: auto;
  }
  
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .dropdown-menu {
    display: flex;
    gap: 20px;
    margin: 20px 0;
  }
  
  .chart-section {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
  }
  </style>
  