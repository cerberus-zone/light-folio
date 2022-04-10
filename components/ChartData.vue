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
          },
          explorer: {
            axis: 'horizontal',
            keepInBounds: false,
            maxZoomIn: 8.0
          },
          tooltip: {
            trigger: 'none'
          }          
      }
    }
  },
  async fetch() {
  
    // const getMagetData = await axios('https://api.coingecko.com/api/v3/coins/cerberus-2/ohlc?vs_currency=usd&days=1')  
    const getMagetData = await axios('https://api-osmosis.imperator.co/tokens/v2/historical/CRBRUS/chart?tf=15') 
    var priceChartData = this.priceChartData
      getMagetData.data.forEach(function(item){
      console.log(item) 
      var date = new Date(item.time);
      //console.log(date.getTime())          
      priceChartData.push([
        date, // the date
        item.low, // low
        item.open, // open
        item.close, // close
        item.high // high
      ]);
    }); 
    console.log(this.priceChartData) 
  },  
};
</script> 
 
