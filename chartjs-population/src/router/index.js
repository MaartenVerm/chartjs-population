import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";
import HistoricalData from "../components/HistoricalData.vue";
import MaintenancePage from "../components/Maintenance.vue"; // Importeer de nieuwe pagina
import TestPage from "@/components/TestPage.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/historical",
    name: "HistoricalData",
    component: HistoricalData,
  },
  {
    path: "/maintenance", // Nieuwe route
    name: "MaintenancePage",
    component: MaintenancePage,
  },
  {
    path: "/testpage", // Nieuwe route
    name: "TestPage",
    component: TestPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
