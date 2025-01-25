<template>
  <div class="alerts">
    <h2>Waarschuwingen</h2>
    <ul>
      <li v-for="alert in alerts" :key="alert.id">
        <strong>{{ alert.sensor }}</strong>: {{ alert.message }}
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'AlertsComponent',
  props: {
    alerts: {
      type: Array,
      required: true
    }
  }
};
</script>

<style>
.alerts {
  border: 1px solid red;
  padding: 10px;
  background: #ffe5e5;
}
</style>
