import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";
import HistoricalData from "../components/HistoricalData.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home, // Gebruik de nieuwe Home-component
  },
  {
    path: "/historical",
    name: "HistoricalData",
    component: HistoricalData, // Gebruik de historische data-component
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
