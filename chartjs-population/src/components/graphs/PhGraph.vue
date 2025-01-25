<template>
  <div>
    <h2>{{ title }}</h2>
    <GraphComponent :title="title" :dataPoints="data" />
  </div>
</template>

<script>
import GraphComponent from "../GraphComponent.vue";

export default {
  name: "PhGraph",
  props: {
    data: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  components: {
    GraphComponent,
  },
};
</script>
