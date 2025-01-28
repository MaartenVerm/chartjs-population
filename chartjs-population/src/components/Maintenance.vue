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
        <div class="dropdowns">
            <label for="sensor-select">Sensor:</label>
            <select id="sensor-select" v-model="selectedSensor">
                <option v-for="sensor in selectedSensors" :key="sensor.sensor_serienummer"
                    :value="sensor.sensor_serienummer">
                    {{ sensor.sensornaam }}
                </option>
            </select>
        </div>

        <!-- Sensoren Beheer -->
        <section class="sensor-section">
            <h2>Sensoren</h2>
            <ul>
                <li v-for="sensor in selectedSensors" :key="sensor.sensor_serienummer">
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
    methods: {
        // Fetch all buoys
        async fetchBuoys() {
            try {
                const payload = { type: "READ" }; // No additional parameters needed
                const response = await axios.post("http://143.47.190.25:1880/boei", payload);
                this.buoys = response.data || [];
                console.log("Buoys fetched:", this.buoys); // Debugging
            } catch (error) {
                console.error("Error fetching buoys:", error);
            }
        },

        // Fetch details for a specific buoy
        async fetchBuoyDetails() {
            if (!this.selectedBuoy) return;
            try {
                const payload = { type: "READONE", id: this.selectedBuoy }; // Use 'id' as per API
                const response = await axios.post("http://143.47.190.25:1880/boei", payload);
                console.log("Buoy Details Response:", response.data); // Debugging
                this.selectedBuoyDetails = response.data || {};
                await this.fetchSensorsByBuoy();
            } catch (error) {
                console.error("Error fetching buoy details:", error);
            }
        },

        // Fetch sensors for the selected buoy
        async fetchSensorsByBuoy() {
            try {
                const payload = { type: "READBOEI", boei_id: this.selectedBuoy };
                const response = await axios.post(
                    "http://143.47.190.25:1880/sensorperboei",
                    payload
                );
                console.log("Sensors Response:", response.data); // Inspect the response
                this.selectedSensors = response.data || [];
            } catch (error) {
                console.error("Error fetching sensors for buoy:", error);
            }
        },

        // Select a sensor
        selectSensor(sensor) {
            this.selectedSensor = { ...sensor };
        },

        // Update a sensor
        async updateSensor() {
            try {
                const payload = {
                    type: "UPDATE",
                    serienummer: this.selectedSensor.sensor_serienummer, // Use 'serienummer' as per API
                    tiepe: this.selectedSensor.tiepe, // Add 'tiepe' if available
                    eenheid: this.selectedSensor.eenheid, // Add 'eenheid' if available
                };
                await axios.post("http://143.47.190.25:1880/sensor", payload);
                alert("Sensor bijgewerkt!");
                await this.fetchSensorsByBuoy();
            } catch (error) {
                console.error("Error updating sensor:", error);
            }
        },

        // Delete a sensor
        async deleteSensor() {
            try {
                const payload = {
                    type: "DELETE",
                    serienummer: this.selectedSensor.sensor_serienummer // Use 'serienummer' as per API
                };
                await axios.post("http://143.47.190.25:1880/sensor", payload);
                alert("Sensor verwijderd!");
                this.selectedSensor = null;
                await this.fetchSensorsByBuoy();
            } catch (error) {
                console.error("Error deleting sensor:", error);
            }
        },

        // Add a new sensor
        async addSensor() {
            if (!this.newSensorName || !this.selectedBuoy) return;
            try {
                const payload = {
                    type: "CREATE",
                    serienummer: "NEW_SERIENUMMER", // Replace with actual serial number logic
                    sensornaam: this.newSensorName,
                    tiepe: "TYPE_HERE", // Replace with actual type
                    eenheid: "UNIT_HERE", // Replace with actual unit
                };
                await axios.post("http://143.47.190.25:1880/sensor", payload);
                alert("Nieuwe sensor toegevoegd!");
                this.newSensorName = "";
                await this.fetchSensorsByBuoy();
            } catch (error) {
                console.error("Error adding sensor:", error);
            }
        },

        // Other methods (unchanged)
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