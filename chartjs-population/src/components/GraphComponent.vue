<template>
  <div class="graph">
    <h3>{{ title }}</h3>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registreer de benodigde Chart.js-componenten
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);

export default {
  name: "GraphComponent",
  props: {
    title: {
      type: String,
      required: true,
    },
    dataPoints: {
      type: Array,
      required: true,
    },labels: {
      type: Array,
      required: true,    },
  },
  data() {
    return {
      chart: null, // Referentie naar de Chart.js instantie
    };
  },
  mounted() {
    this.createChart(); // Maak de grafiek bij het laden
  },
  watch: {
    dataPoints: {
      handler(newData) {
        console.log("Nieuwe data ontvangen:", newData);
        if (this.chart) {
          // Update de grafiek met nieuwe data
          this.chart.data.datasets[0].data = newData.length ? newData : [0, 0, 0, 0, 0];
          this.chart.update();
        }
      }    },
      labels: {
      handler(newLabels) {
        if (this.chart) {
          this.chart.data.labels = newLabels.length ? newLabels : ["Geen data"];
          this.chart.update();
        }
      }
  },
  },
  methods: {
    createChart() {
      const ctx = this.$refs.chartCanvas.getContext("2d");

      this.chart = new Chart(ctx, {
        type: "line",
        data: {
          labels: ["1u geleden", "45m", "30m", "15m", "Nu",0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], // Labels voor de x-as
          datasets: [
            {
              label: this.title,
              data: this.dataPoints.length ? this.dataPoints : [0, 0, 0, 0, 0],
              borderColor: "#007bff",
              borderWidth: 2,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
            },
          },
          scales: {
            y: {
              beginAtZero: true, // Zorg dat de y-as altijd bij 0 begint
            },
          },
        },
      });
    },
    destroyChart() {
      if (this.chart) {
        this.chart.destroy(); // Vernietig de bestaande grafiek
        this.chart = null;
      }
    },
  },
  beforeUnmount() {
    this.destroyChart(); // Zorg ervoor dat de grafiek wordt opgeruimd bij het verwijderen
  },
};
</script>

<style>
.graph {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
  max-width: 600px;
  height: 300px;
}

canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
