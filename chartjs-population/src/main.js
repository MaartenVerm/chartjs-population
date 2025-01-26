import { createApp } from 'vue';
import App from './App.vue';
import "leaflet/dist/leaflet.css";
import router from "./router"; // Importeer de router

// Maak één enkele Vue-app aan en gebruik de router
const app = createApp(App);
app.use(router);
app.mount("#app");
