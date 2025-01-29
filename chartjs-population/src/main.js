import { createApp } from 'vue';
import App from './App.vue';
import "leaflet/dist/leaflet.css";
import router from "./router"; // Importeer de router

createApp(App).mount('#app');
createApp(App).use(router).mount("#app"); // Voeg de router toe aan de applicatie
