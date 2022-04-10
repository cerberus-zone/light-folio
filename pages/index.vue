<template>
    <v-main>
      <v-container>
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <v-card
              class="pa-2"
              outlined
              rounded="lg"
              height="100%"
            >
            <v-card-title>My wallet 
                <SendModal 
                  v-if="logged"
                  :chainIdProps="cosmosConfig[0].coinLookup.addressPrefix"
                  :amountAvailable="(balances / 1000000)"
                  :coinIcon="cosmosConfig[0].coinLookup.icon"
                />            
            <v-spacer></v-spacer>

            <div v-if="logged">              
              {{ formatNum((balances / 1000000).toFixed(2)) }} {{ cosmosConfig[0].coinLookup.viewDenom }}    
              
            </div>
            <div v-else>0 {{ cosmosConfig[0].coinLookup.viewDenom }}</div>
            </v-card-title>
            <v-card-text v-if="logged">              
 
              
              <v-simple-table>
                <template v-slot:default>
                  <tbody>
                    <tr>
                      <td>Available</td>
                      <td>{{ formatNum((balances / 1000000).toFixed(2)) }} {{ cosmosConfig[0].coinLookup.viewDenom }}</td>
                    </tr>
                    <tr>
                      <td>Delegated</td>
                      <td>{{ formatNum(getTotalDlegated.toFixed(2)) }} {{ cosmosConfig[0].coinLookup.viewDenom }}</td>
                    </tr>
                    <tr>
                      <td>Total</td>
                      <td>{{ formatNum(getTotalWallet.toFixed(2)) }} {{ cosmosConfig[0].coinLookup.viewDenom }}</td>
                    </tr>  
                    <tr>
                      <td>Final amount</td>
                      <td>${{ (getTotalWallet * price).toFixed(2) }}
                      <img width="15" height="15" src="https://static.coingecko.com/s/thumbnail-007177f3eca19695592f0b8b0eabbdae282b54154e1be912285c9034ea6cbaf2.png"> (1 crbrus = ${{ (price).toFixed(5) }})
                  
                      </td>
                    </tr>         
                    
                  </tbody>
                </template>
              </v-simple-table>  
            </v-card-text>
            <v-card-text v-else class="text-center">              
              <v-btn v-if="!logged" elevation="4" depressed v-on:click="connectKeplr">
              <img
                class="mr-2"
                src="/keplr.png"
                width="20"
                height="20"
              >
                Connect keplr
              </v-btn>
            </v-card-text>            
            </v-card>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-card
              class="pa-2"
              outlined
              rounded="lg"
              height="100%"
            >
            <v-card-title>My reward
            <v-spacer></v-spacer>
 
            <div v-if="logged && priceLoaded && delegationsLoaded && delegations.length > 0 && !isNaN(rewards.amount)">
              {{ formatNum((rewards.amount / 1000000).toFixed(2)) }} {{ cosmosConfig[0].coinLookup.viewDenom }} (${{ ((rewards.amount / 1000000) * price).toFixed(2) }})
            </div>
            <div v-else>0 {{ cosmosConfig[0].coinLookup.viewDenom }}</div>
            </v-card-title>
            <v-card-text v-if="logged && priceLoaded && delegationsLoaded">              
             
              <v-simple-table>
                <template v-slot:default>
                  <tbody>
                    <tr>
                      <td>Apr pool 662</td>
                      <td>{{ aprPool662 }} %</td>
                    </tr>
                    <tr>
                      <td>Apr pool 658</td>
                      <td>Soon</td>
                    </tr>
                    <tr>
                      <td>Apr pool 671</td>
                      <td>Soon</td>
                    </tr>  
                    <tr>
                      <td>Apr pool 667</td>
                      <td>Soon</td>
                    </tr>         
                    
                  </tbody>
                </template>
              </v-simple-table>
              
            </v-card-text>
            <v-card-text v-else class="text-center">              
              <v-btn v-if="!logged" elevation="4" depressed v-on:click="connectKeplr">
              <img
                class="mr-2"
                src="/keplr.png"
                width="20"
                height="20"
              >
                Connect keplr
              </v-btn>
            </v-card-text> 
            </v-card>
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-card
              class="pa-2"
              outlined
              rounded="lg"
              height="100%"
            >
            <v-card-title>Cerberus Price
            <v-spacer></v-spacer>${{ (price).toFixed(7) }}
            </v-card-title>

              
              <ChartData 
                :chartColor="chartColor"
              />              
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-card
              class="pa-2"
              outlined
              rounded="lg"
              height="100%"
            >
            <v-card-title>My delegations 
            <v-spacer></v-spacer>         
            <ClaimAllModal 
              v-if="logged"
              :chainIdProps="cosmosConfig[0].coinLookup.addressPrefix" 
              :amountClaimAll="(rewards.amount / 1000000).toFixed(6)"
              :getAllDelegation="delegations"
            />
            </v-card-title>
            <v-card-text>
              <v-simple-table>
                <template v-slot:default>
                  <thead>
                    <tr v-if="logged && delegationsLoaded">
                      <th class="text-left">
                        Name
                      </th>
                      <th class="text-left">
                        Delegate
                      </th>
                      <th class="text-left">
                        Reward
                      </th>
                      <th class="text-left">
                        Redelegate
                      </th>
                      <th class="text-left">
                        Undelegate
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                  
                    <tr
                      v-if="logged && delegationsLoaded"
                      v-for="item in delegations"
                      :key="item.op_address"
                    >
                      <td>
                      <v-avatar

                        class="mr-3"
                        color="grey darken-1"
                        size="32"
                      >
                        <img
                          :src="cosmosConfig[0].coinLookup.icon"
                          alt="cerberus"
                        >
                      </v-avatar>
                      {{ item.validatorName }}
                      </td>
                      <td>{{ formatNum((item.share / 1000000).toFixed(2)) }} {{ cosmosConfig[0].coinLookup.viewDenom }}</td>
                      <td>

                        <div v-if="!isNaN(item.reward)">
                        <v-btn
                          icon
                          color="green"
                          @click="getReward(item.op_address)"
                        >
                          <v-icon>mdi-download</v-icon>
                        </v-btn>
                        {{ formatNum((item.reward / 1000000).toFixed(2)) }} {{ cosmosConfig[0].coinLookup.viewDenom }} </div>
                        <div v-else>0 {{ cosmosConfig[0].coinLookup.viewDenom }}</div>
                        </td>
                      <td>
                        <RedelegateModal
                          :chainIdProps="cosmosConfig[0].coinLookup.addressPrefix"
                          :addressFrom="item.op_address"
                          :amountRe="item.share / 1000000"
                          :validatorName="item.validatorName"
                          :coinIcon="cosmosConfig[0].coinLookup.icon"
                        />
                      </td>
                      <td>
                        <UndelegateModal
                          :chainIdProps="cosmosConfig[0].coinLookup.addressPrefix"
                          :addressFrom="item.op_address"
                          :amountUn="item.share / 1000000"
                          :validatorName="item.validatorName"
                          :coinIcon="cosmosConfig[0].coinLookup.icon"
                        />
                      </td>
                    </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </v-card-text>
            </v-card>
          </v-col>           
          <v-col
            cols="12"
            md="6"
          > 
            <v-card
              class="pa-2"
              outlined
              rounded="lg"
              height="100%"
            >          
            <v-card-title>Other</v-card-title>
            <v-card-text>
              <v-tabs v-model="tab" v-if="logged">
                <v-tab href="#tab-1">
                  Redelegations
                </v-tab>

                <v-tab href="#tab-2">
                  Undelegations
                </v-tab>

              </v-tabs>
              </v-tabs>
              <v-tabs-items v-model="tab" v-if="logged && delegationsLoaded">
                <v-tab-item
                  value="tab-1"
                >
                  <v-card flat>
                    <v-card-text>
                      <v-simple-table>
                        <template v-slot:default>
                          <thead>
                            <tr>
                              <th class="text-left">
                                Name
                              </th>
                              <th class="text-left">
                                Amount
                              </th>
                              <th class="text-left">
                                Completion time
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            <tr
                              v-if="logged"
                              v-for="item in reDelegations"
                              :key="item.amount"
                            >
                            
                              <td>
                              <v-avatar

                                class="mr-3"
                                color="grey darken-1"
                                size="32"
                              >
                                <img
                                  :src="cosmosConfig[0].coinLookup.icon"
                                  alt="cerberus"
                                >
                              </v-avatar>
                              {{ item.validator_src_address }} <v-icon>mdi-ray-start-arrow</v-icon> {{ item.validator_dst_address }}
                              </td>
                              <td>
                                {{ formatNum(item.amount) }} {{ cosmosConfig[0].coinLookup.viewDenom }}                                
                              </td>
                              <td>
                                {{ item.completion_time }}                                
                              </td>        
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>                    
                    </v-card-text>
                  </v-card>
                </v-tab-item>
                <v-tab-item
                  value="tab-2"
                >
                  <v-card flat>
                    <v-card-text>
                      <v-simple-table>
                        <template v-slot:default>
                          <thead>
                            <tr v-if="logged && delegationsLoaded">
                              <th class="text-left">
                                Name
                              </th>
                              <th class="text-left">
                                Amount
                              </th>
                              <th class="text-left">
                                Completion time
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            <tr
                              v-if="logged"
                              v-for="item in unbondings"
                              :key="item.validator_src_address"
                            >
                            
                              <td>
                              <v-avatar

                                class="mr-3"
                                color="grey darken-1"
                                size="32"
                              >
                                <img
                                  :src="cosmosConfig[0].coinLookup.icon"
                                  alt="cerberus"
                                >
                              </v-avatar>
                              {{ item.validator_src_address }}
                              </td>
                              <td>
                                {{ formatNum(item.amount) }} {{ cosmosConfig[0].coinLookup.viewDenom }}                                
                              </td>
                              <td>
                                {{ item.completion_time }}                                
                              </td>        
                            </tr>
                          </tbody>
                        </template>
                      </v-simple-table>                      
                    </v-card-text>
                  </v-card>
                </v-tab-item>
              </v-tabs-items>
    
            </v-card-text>
            </v-card>
          </v-col>
       </v-row>
        <!-- Here -->
        <!--<v-row>
          <v-col
            cols="12"
            md="12"
          >
            <v-card
              class="pa-2"
              outlined
              rounded="lg"
            >
            
            test
            </v-card>
          </v-col> 
        </v-row> -->       
 
      </v-container>
    </v-main>

</template>

<script>
import { mapState } from 'vuex'
import axios from 'axios'
import cosmosConfig from '~/cosmos.config'
import {
	assertIsDeliverTxSuccess,
	SigningStargateClient,
} from '@cosmjs/stargate'

  export default {
    data: () => ({  
      aprPool662: '',
      tab: null,   
      cosmosConfig: cosmosConfig,
      loadingRefresh: false,
      interval: {},
      timerValue: 0,
      totalDelegated: 0
    }),
    computed: {
      ...mapState('keplr', [`accounts`, `initialized`, `error`, `logged`, `logout`]),
      ...mapState('data', [`balances`, 'validators', 'delegations', 'delegationsLoaded', 'validatorsLoaded', 'rewards', 'rewardsLoaded', 'reDelegations', 'unbondings', 'lastBlock', 'balancesLoaded','priceLoaded', 'price', 'chartColor']),     
      getTotalDlegated(){
        let totalDel = 0
        this.delegations.forEach(function(item){
          //console.log(item)
          totalDel += Number(item.share / 1000000);
        });
        this.totalDelegated = totalDel
        return totalDel
      },
      getTotalWallet(){
        return (this.totalDelegated + (this.balances/1000000))
      },   
      
    },
    async fetch() {
      const getAprPool662 = await axios('https://api-osmosis.imperator.co/apr/v2/662')  
      console.log(getAprPool662.data[0].apr_list[0].apr_14d)
      this.aprPool662 = getAprPool662.data[0].apr_list[0].apr_14d.toFixed(2)
       
    },    
    async mounted() {
      // this.$vuetify.theme.themes[(this.$vuetify.theme.dark) ? 'dark' : 'light'].background
      //console.log(this.chartColor)
      // this.candleOptions.chartArea.backgroundColor.fill = this.chartColor
      /*this.interval = setInterval(async () => {
        if (this.timerValue === 100) {
          await this.$store.dispatch('data/getLastBlock')
          // console.log(this.logged)
          if (this.logged === true)
            this.$store.dispatch('data/refresh', this.accounts[0].address)        
          return (this.timerValue = 0)
        }
        this.timerValue += 10
      }, 1000)

      setInterval(async () => {
        this.value.shift()
        this.value.push(this.rewards.amount / 1000000)  
 
      }, 5000)   */   
      
      await this.$store.dispatch('data/getLastBlock')      
      
      
      window.addEventListener("keplr_keystorechange", async () => {
        await this.$store.dispatch('keplr/connectWallet', cosmosConfig[0])
        //this.$store.dispatch('data/getAccountInfo', account[0].address)
        this.$store.dispatch('data/resetSessionData')
        this.$store.dispatch('data/refresh', this.accounts[0].address)
      })
    },
    methods: {
      connectKeplr: async function (event) {
        await this.$store.dispatch('data/resetSessionData')
        await this.$store.dispatch('keplr/connectWallet', cosmosConfig[0])
        await this.$store.dispatch('data/getWalletInfo', this.accounts[0].address)
        await this.$store.dispatch('data/getDelegations', this.accounts[0].address)
        await this.$store.dispatch('data/getAllProposals')
        await this.$store.dispatch('data/getReDelegations', this.accounts[0].address)
        await this.$store.dispatch('data/getUnbondings', this.accounts[0].address)
        await this.$store.dispatch('data/getLastBlock')
        await this.$store.dispatch('data/getPrice')
        
        
        //await this.$store.dispatch('data/refresh', this.accounts[0].address)

        // this.address = this.accounts
        // this.$router.push({path: "/"})
      },    
      getReward(addrValidator) {
        (async () => {
            const chainId = cosmosConfig[0].chainId;
            await window.keplr.enable(chainId);
            const offlineSigner = await window.getOfflineSignerAuto(chainId);

            const accounts = await offlineSigner.getAccounts();
            const client = await SigningStargateClient.connectWithSigner(
              cosmosConfig[0].rpcURL,
              offlineSigner
            )
              const fee = {
                amount: [
                  {
                    denom: cosmosConfig[0].chainDenom,
                    amount: '5000',
                  },
                ],
                gas: '200000',
              }
            try {
              const result = await client.withdrawRewards(accounts[0].address, addrValidator, fee, '')
              assertIsDeliverTxSuccess(result)
              await this.$store.dispatch('data/refresh', accounts[0].address)
            } catch (error) {
              console.error(error);
            }
        })();
      },
      formatNum(nombre){
        return new Intl.NumberFormat().format(nombre)
      },        
    },
  }
</script>
<style scoped>
.v-progress-circular {
  margin: 1rem;
}
.text-right .v-image {
  display: inline-block;
}

</style>
