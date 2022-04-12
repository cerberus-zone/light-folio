<template>
    <v-main>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            md="12"
          >
            proposals
 
          </v-col>
        </v-row>
      </v-container>
    </v-main>

</template>

<script>
import { mapState } from 'vuex'
import cosmosConfig from '~/cosmos.config'
  export default {
    data: () => ({  
      cosmosConfig: cosmosConfig,
    }),
    computed: {
      ...mapState('keplr', [`accounts`, `initialized`, `error`, `logged`, `logout`]),
      ...mapState('data', [`balances`, 'validators', 'delegations', 'delegationsLoaded', 'validatorsLoaded', 'rewards', 'rewardsLoaded', 'reDelegations', 'unbondings', 'lastBlock', 'balancesLoaded','priceLoaded', 'price', 'chartColor']),     
    
    },
  }  
</script>
