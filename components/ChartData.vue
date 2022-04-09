<template>
  <div>
    <p v-if="$fetchState.pending">Fetching data...</p>
    <p v-else-if="$fetchState.error">An error occurred :(</p>
    <div v-else>            
      <!--getMarket-->
      <GChart
        :settings="{ packages: ['corechart'] }"
        type="CandlestickChart"
        :data="priceChartData"
        :options="candleOptions"
      />
    </div>  
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: "ChartData",
  props: ['chartColor'],
  data() {
    return {
      // Array will be automatically processed with visualization.arrayToDataTable function
      chartData: [
        ['Validator', 'Delegation', 'Reward'],
      ],
      priceChartData: [
          ['', '', '', '', '']
      ],
      chartOptions: {
        chart: {
          title: 'Company Performance',
          subtitle: 'Sales, Expenses, and Profit: 2014-2017',
        }
      },
      candleOptions: {
          legend: 'none',
          chartArea: {
            backgroundColor: {
              fill: this.chartColor,
              fillOpacity: 0.1
            },
          },
          backgroundColor: {
            fill: this.chartColor,
            fillOpacity: 0.8
          },          
          candlestick: {
            fallingColor: { strokeWidth: 0, fill: '#a52714' }, // red
            risingColor: { strokeWidth: 0, fill: '#0f9d58' }   // green
          }          
      }
    }
  },
  async fetch() {
    const getMagetData = await axios('https://api.coingecko.com/api/v3/coins/cerberus-2/ohlc?vs_currency=usd&days=1')  
    var priceChartData = this.priceChartData
      getMagetData.data.forEach(function(item){
      var date = new Date(item[0]);
      //console.log(date.getTime())          
      priceChartData.push([
        date, // the date
        item[3], // low
        item[1], // open
        item[4], // close
        item[2] // high
      ]);
    });        
  },  
};
</script> 
 
