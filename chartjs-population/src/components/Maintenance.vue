<template>
    <div class="maintenance-container">
      <h1>Onderhoud</h1>
  
      <!-- Dropdown voor boeien -->
      <div class="dropdowns">
        <label for="buoy-select">Boei:</label>
        <select id="buoy-select" v-model="selectedBuoy" @change="fetchBuoyDetails">
          <option v-for="buoy in buoys" :key="buoy.ID_NAME" :value="buoy.ID_NAME">
            {{ buoy.NAAM }}
          </option>
        </select>
      </div>
  
      <!-- Boei Details -->
      <section v-if="selectedBuoyDetails" class="buoy-details">
        <h2>Boei Details</h2>
        <p><strong>ID:</strong> {{ selectedBuoyDetails.id }}</p>
        <p><strong>Naam:</strong> {{ selectedBuoyDetails.name }}</p>
        <p><strong>Status:</strong> {{ selectedBuoyDetails.status }}</p>
      </section>
  
      <!-- Dropdown voor sensoren -->
      <div v-if="selectedSensors.length > 0" class="dropdowns">
        <label for="sensor-select">Sensor:</label>
        <select id="sensor-select" v-model="selectedSensor">
          <option v-for="sensor in selectedSensors" :key="sensor.serienummer" :value="sensor.serienummer">
            {{ sensor.sensornaam }}
          </option>
        </select>
      </div>
  
      <!-- Sensoren Beheer -->
      <section v-if="selectedSensors.length > 0" class="sensor-section">
        <h2>Sensoren</h2>
        <ul>
          <li v-for="sensor in selectedSensors" :key="sensor.serienummer">
            <span @click="selectSensor(sensor)">{{ sensor.sensornaam }}</span>
          </li>
        </ul>
  
        <!-- Sensor Beheer -->
        <div v-if="selectedSensor" class="sensor-management">
          <h3>Beheer Sensor</h3>
          <label for="sensor-name">Naam:</label>
          <input id="sensor-name" v-model="selectedSensor.sensornaam" type="text" />
          <button @click="updateSensor">Bijwerken</button>
          <button @click="deleteSensor">Verwijderen</button>
        </div>
      </section>
  
      <!-- Nieuwe Sensor Toevoegen -->
      <section v-if="selectedBuoy" class="add-sensor">
        <h2>Nieuwe Sensor Toevoegen</h2>
        <form @submit.prevent="addSensor">
          <label for="new-sensor-name">Sensor Naam:</label>
          <input id="new-sensor-name" v-model="newSensorName" type="text" />
          <button type="submit">Toevoegen</button>
        </form>
      </section>
  
      <!-- SMS Waarschuwingen -->
      <section class="sms-notifications">
        <h2>SMS Waarschuwingen</h2>
        <label for="sms-number">Telefoonnummer:</label>
        <input id="sms-number" v-model="smsNumber" type="text" />
        <label for="sms-warning">Waarschuwing:</label>
        <input id="sms-warning" v-model="smsWarning" type="text" />
        <button @click="addSmsNotification">Instellen</button>
      </section>
  
      <!-- Waarschuwingen -->
      <section class="warnings-section">
        <h2>Bestaande Waarschuwingen</h2>
        <ul>
          <li v-for="warning in warnings" :key="warning.id">
            {{ warning.message }}
          </li>
        </ul>
        <form @submit.prevent="addWarning">
          <label for="new-warning">Nieuwe Waarschuwing:</label>
          <input id="new-warning" v-model="newWarning" type="text" />
          <button type="submit">Toevoegen</button>
        </form>
      </section>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "MaintenancePage",
    data() {
      return {
        buoys: [], // Lijst van boeien
        selectedBuoy: null, // Geselecteerde boei
        selectedBuoyDetails: null, // Details van de boei
        selectedSensors: [], // Sensoren binnen de boei
        selectedSensor: null, // Geselecteerde sensor
        newSensorName: "", // Naam voor nieuwe sensor
        smsNumber: "", // Telefoonnummer voor SMS
        smsWarning: "", // Waarschuwingstekst
        warnings: [], // Lijst van waarschuwingen
        newWarning: "", // Nieuwe waarschuwing
      };
    },
    //methodes voor het ophalen van data
    methods: {
      async fetchBuoys() {
        try {
          const payload = { type: "READ", key: "value" };
          const response = await axios.post("http://143.47.190.25:1880/boei", payload);
          this.buoys = response.data || [];
        } catch (error) {
          console.error("Error fetching buoys:", error);
        }
      },
      async fetchBuoyDetails() {
        if (!this.selectedBuoy) return;
        try {
          const payload = { type: "READONE", id: this.selectedBuoy };
          const response = await axios.post(
            "http://143.47.190.25:1880/boei",
            payload
          );
          this.selectedBuoyDetails = response.data || {};
          await this.fetchSensorsByBuoy();
        } catch (error) {
          console.error("Error fetching buoy details:", error);
        }
      },
      async fetchSensorsByBuoy() {
        if (!this.selectedBuoy) return;
        try {
          const payload = { type: "READBOEI", boei_id: this.selectedBuoy };
          const response = await axios.post(
            "http://143.47.190.25:1880/sensorperboei",
            payload
          );
          this.selectedSensors = response.data || [];
        } catch (error) {
          console.error("Error fetching sensors for buoy:", error);
        }
      },
      selectSensor(sensor) {
        this.selectedSensor = { ...sensor };
      },
      async updateSensor() {
        try {
          const payload = {
            type: "UPDATE",
            serienummer: this.selectedSensor.serienummer,
            sensornaam: this.selectedSensor.sensornaam,
          };
          await axios.post("http://143.47.190.25:1880/sensor", payload);
          alert("Sensor bijgewerkt!");
          await this.fetchSensorsByBuoy();
        } catch (error) {
          console.error("Error updating sensor:", error);
        }
      },
      async deleteSensor() {
        try {
          const payload = { type: "DELETE", serienummer: this.selectedSensor.serienummer };
          await axios.post("http://143.47.190.25:1880/sensor", payload);
          alert("Sensor verwijderd!");
          this.selectedSensor = null;
          await this.fetchSensorsByBuoy();
        } catch (error) {
          console.error("Error deleting sensor:", error);
        }
      },
      async addSensor() {
        if (!this.newSensorName || !this.selectedBuoy) return;
        try {
          const payload = {
            type: "CREATE",
            sensornaam: this.newSensorName,
            boei_id: this.selectedBuoy,
          };
          await axios.post("http://143.47.190.25:1880/sensor", payload);
          alert("Nieuwe sensor toegevoegd!");
          this.newSensorName = "";
          await this.fetchSensorsByBuoy();
        } catch (error) {
          console.error("Error adding sensor:", error);
        }
      },
      async addSmsNotification() {
        alert(
          `SMS-melding ingesteld voor nummer: ${this.smsNumber} met waarschuwing: ${this.smsWarning}`
        );
        this.smsNumber = "";
        this.smsWarning = "";
      },
      async addWarning() {
        this.warnings.push({ id: Date.now(), message: this.newWarning });
        this.newWarning = "";
      },
    },
    async mounted() {
      await this.fetchBuoys();
    },
  };
  </script>
  
  <style>
  .maintenance-container {
    padding: 20px;
  }
  .dropdowns {
    margin-bottom: 20px;
  }
  .dropdowns select {
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }
  .buoy-details {
    margin-top: 20px;
  }
  .sensor-section {
    margin-top: 20px;
  }
  </style>
  