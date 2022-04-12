<template>
    <v-main>
    <v-parallax height="300" src="https://www.mintscan.io/_next/static/media/bg_cerberus.7ff0969f27e0fe96d9517da3f9c1c03f.png">
    <v-row
      align="center"
      justify="center"
    >
      <v-col
        class="text-center"
        cols="12"
      >
        <h1 class="text-h4 font-weight-thin mb-4">
          Cerberus Webwallet
        </h1>
      </v-col>
    </v-row>    
    </v-parallax>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            md="12"
          >
            <v-simple-table>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th class="text-left">
                      Rank
                    </th>
                    <th class="text-left">
                      Name
                    </th>
                    <th class="text-left">
                      Voting power
                    </th>
                    <th class="text-left">
                      Commission
                    </th>
                    <th class="text-left">
                      Operator address
                    </th>
                    <th class="text-left">
                      Delegate
                    </th>
                  </tr>
                </thead>
                <tbody> 
                  <tr
                    v-for="(item, index) in validators"
                    :key="item.op_address"
                  >
                    <td>                    
                      <v-chip
                        class="ma-2"
                      >
                        {{ (index + 1) }}
                      </v-chip>
                    </td>
                    <td>
                      <v-avatar

                        class="mr-3"
                        color="grey darken-1"
                        size="32"
                      >
                        <img
                          :src="item.avatar"
                          alt="cerberus"
                        >
                      </v-avatar>              
                    {{ item.name }}                    
                    </td>
                    <td>{{ (item.tokens / 1000000).toFixed(2) }} {{ cosmosConfig[0].coinLookup.viewDenom }}</td>
                    <td>{{ item.crate }}</td>
                    <td>{{ item.op_address }}</td>
                    <td><DelegateModal
                      v-if="logged && balancesLoaded"
                      :chainIdProps="cosmosConfig[0].coinLookup.addressPrefix"
                      :addressTo="item.op_address"
                      :validatorName="item.name"
                      :balances="balances"
                      :coinIcon="cosmosConfig[0].coinLookup.icon"
                    /></td>                   
                  </tr>
                </tbody>
              </template>
            </v-simple-table> 
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
