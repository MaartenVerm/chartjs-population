<template>
  <div class="current-values">
    <div v-for="(value, sensor) in data" :key="sensor" class="value-circle">
      <h3>{{ sensor }}</h3>
      <p>{{ value }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CurrentValuesComponent',
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style>
.current-values {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: space-around;
}

.value-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: lightblue;
  color: black;
  font-family: Arial, sans-serif;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
  text-align: center;
  transition: opacity 0.3s ease; /* Voorkom verdwijnen */
}

.value-circle h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.value-circle p {
  margin: 0;
  font-size: 14px;
}
</style>
