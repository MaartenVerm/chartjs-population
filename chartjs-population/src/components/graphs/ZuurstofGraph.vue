<template>
  <div>
    <h2>{{ title }}</h2>
    <GraphComponent :title="title" :dataPoints="data" :labels="label"/>
  </div>
</template>

<script>
import GraphComponent from "../GraphComponent.vue";

export default {
  name: "ZuurstofGraph",
  props: {
    data: {
      type: Array,
      required: true,
    },
    label: {
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
