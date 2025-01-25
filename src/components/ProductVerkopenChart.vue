<template>
    <div>
        <Bar :data="chartData"></Bar>

    </div>
</template>

<script>
    import { Bar } from 'vue-chartjs';
    import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

    ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

    export default {
        name: "ProductVerkopenChart",
        components: { Bar },
        data() {
            return {
                chartData:
                {
                    labels: ['Jeroen', 'Ron','Martijn', 'Bart'],
                    datasets: [
                        {
                            label:'Data one',
                            backgroundColor: '#ff4500',
                            data: [10, 10, 10, 10]
                        }
                    ]
                }
            }
        }
    }
</script>

<style>

</style>