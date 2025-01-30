<template>
    <div class="maintenance-container">
        <h1>Onderhoud</h1>
        <button class="back-button" @click="goToHome">Terug naar Home</button>


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

        <!-- SMS Waarschuwingen (IndexedDB) -->
        <section class="sms-notifications">
            <h2>SMS Waarschuwingen</h2>
            <form @submit.prevent="addPhoneNumber">
                <label for="sms-number">Telefoonnummer:</label>
                <input id="sms-number" v-model="smsNumber" type="text" required />
                <button type="submit">Opslaan</button>
            </form>

            <h3>Opgeslagen telefoonnummers</h3>
            <ul>
                <li v-for="(number, index) in phoneNumbers" :key="index">
                    {{ number }}
                    <button class="delete-btn" @click="deletePhoneNumber(index)">❌</button>
                </li>
            </ul>
        </section>

        <!-- Waarschuwingen Beheer (IndexedDB) -->
        <section class="warnings-section">
            <h2>Bestaande Waarschuwingen</h2>
            <ul>
                <li v-for="(warning, index) in warnings" :key="index">
                    {{ warning }}
                    <button class="delete-btn" @click="deleteWarning(index)">❌</button>
                </li>
            </ul>
            <form @submit.prevent="addWarning">
                <label for="new-warning">Nieuwe Waarschuwing:</label>
                <input id="new-warning" v-model="newWarning" type="text" required />
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
            db: null, // IndexedDB referentie
            buoys: [], // Lijst van boeien
            selectedBuoy: null, // Geselecteerde boei
            selectedBuoyDetails: null, // Details van de boei
            selectedSensors: [], // Sensoren binnen de boei
            selectedSensor: null, // Geselecteerde sensor
            newSensorName: "", // Naam voor nieuwe sensor
            smsNumber: "", // Telefoonnummer voor SMS
            phoneNumbers: [], // Telefoonnummers in IndexedDB
            warnings: [], // Lijst van waarschuwingen in IndexedDB
            newWarning: "", // Nieuwe waarschuwing
        };
    },
    methods: {
        goToHome() {
            this.$router.push("/");
        },

        async openDatabase() {
            return new Promise((resolve, reject) => {
                const request = indexedDB.open("MaintenanceDB", 2); 

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains("phoneNumbers")) {
                        db.createObjectStore("phoneNumbers", { autoIncrement: true });
                    }
                    if (!db.objectStoreNames.contains("warnings")) {
                        db.createObjectStore("warnings", { autoIncrement: true });
                    }
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    resolve();
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            });
        },

        async fetchSensorsByBuoy() {
            try {
                const payload = { type: "READBOEI", boei_id: this.selectedBuoy };
                const response = await axios.post(
                    "https://nodeapi.hopto.org:1880/sensorperboei",
                    payload
                );
                console.log("Sensors Response:", response.data);
                this.selectedSensors = response.data || [];
            } catch (error) {
                console.error("Error fetching sensors for buoy:", error);
            }
        },
        //Telefoon nummer toevoegen aan indexedDB, dit omdat de telefoonnummers niet bestaan in de database
        async addPhoneNumber() {
            if (!this.smsNumber.trim()) return;

            const transaction = this.db.transaction(["phoneNumbers"], "readwrite");
            const store = transaction.objectStore("phoneNumbers");
            store.add(this.smsNumber);

            transaction.oncomplete = () => {
                this.phoneNumbers.push(this.smsNumber);
                this.smsNumber = "";
            };
        },
        //Waarschuwingen toevoegen aan indexedDB
        async addWarning() {
            if (!this.newWarning.trim()) return;

            const transaction = this.db.transaction(["warnings"], "readwrite");
            const store = transaction.objectStore("warnings");
            store.add(this.newWarning);

            transaction.oncomplete = () => {
                this.warnings.push(this.newWarning);
                this.newWarning = "";
            };
        },

        async loadPhoneNumbers() {
            const transaction = this.db.transaction(["phoneNumbers"], "readonly");
            const store = transaction.objectStore("phoneNumbers");
            const request = store.getAll();

            request.onsuccess = () => {
                this.phoneNumbers = request.result;
            };
        },

        async loadWarnings() {
            const transaction = this.db.transaction(["warnings"], "readonly");
            const store = transaction.objectStore("warnings");
            const request = store.getAll();

            request.onsuccess = () => {
                this.warnings = request.result;
            };
        },

        async deletePhoneNumber(index) {
            const transaction = this.db.transaction(["phoneNumbers"], "readwrite");
            const store = transaction.objectStore("phoneNumbers");
            store.delete(index + 1);

            transaction.oncomplete = () => {
                this.phoneNumbers.splice(index, 1);
            };
        },

        async deleteWarning(index) {
            const transaction = this.db.transaction(["warnings"], "readwrite");
            const store = transaction.objectStore("warnings");
            store.delete(index + 1);

            transaction.oncomplete = () => {
                this.warnings.splice(index, 1);
            };
        },

        async fetchBuoys() {
            try {
                const response = await axios.post("https://nodeapi.hopto.org:1880/boei", { type: "READ" });
                this.buoys = response.data || [];
            } catch (error) {
                console.error("Error fetching buoys:", error);
            }
        },

        async fetchBuoyDetails() {
            if (!this.selectedBuoy) return;
            try {
                const response = await axios.post("https://nodeapi.hopto.org:1880/boei", { type: "READONE", id: this.selectedBuoy });
                this.selectedBuoyDetails = response.data || {};
            } catch (error) {
                console.error("Error fetching buoy details:", error);
            }
        },
    },
    async mounted() {
        await this.openDatabase();
        await this.loadPhoneNumbers();
        await this.loadWarnings();
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