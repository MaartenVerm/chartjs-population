<template>
    <GraphComponent title="Zuurstof Data" :dataPoints="dataPoints" />
  </template>
  
  <script>
  import GraphComponent from "../GraphComponent.vue";
  
  export default {
    name: "ZuurstofGraph",
    components: {
      GraphComponent,
    },
    data() {
      return {
        dataPoints: [340, 345, 350, 355, 360], // Specifieke data voor deze grafiek
      };
    },
  };
  </script>
  