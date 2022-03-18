<template>
    <v-dialog
      v-model="dialog"
      max-width="900px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="mr-4"           
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="green" class="mr-2">mdi-download</v-icon> Claim all
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5"><v-icon color="green" class="mr-2">mdi-download</v-icon> Claim all</span>
          <v-spacer></v-spacer>
          <v-icon class="mr-2" @click="dialog = false">mdi-close-circle</v-icon>
        </v-card-title>
        <v-card-text>
        <v-form
          ref="form"
          v-model="dislableSend"
          lazy-validation
        >        
          <v-container>
            <v-simple-table>
            <thead>
              <tr>
                <th class="text-left">
                  Validator name
                </th>
                <th class="text-left">
                  Delegate
                </th>
                <th class="text-left">
                  Amount rewarded
                </th>
              </tr>
            </thead>      
            <tbody>
              <tr
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
                <!--<td>{{ item.op_address }}</td>-->
                <td> {{ (item.share / 1000000).toFixed(6) }} {{ cosmosConfig[chainId].coinLookup.viewDenom }}</td>
                <td> {{ (item.reward / 1000000).toFixed(6) }} {{ cosmosConfig[chainId].coinLookup.viewDenom }}</td>
              </tr>
              <tr>
                <td>Total to claim</td>
                <!--<td>{{ item.op_address }}</td>-->
                <td></td>
                <td>{{ amountClaimAll }} {{ cosmosConfig[chainId].coinLookup.viewDenom }}</td>
              </tr>
              
            </tbody>          
            </v-simple-table>           
  
          </v-container>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :disabled="!dislableSend"
            :loading="loading"
            color="darken-1"
            @click="validate"
          >
           <v-icon color="green" class="mr-2">mdi-download</v-icon> Claim all
          </v-btn> 
        </v-card-actions>
      </v-card>
      
    </v-dialog>

</template>

<script>
import { mapState } from 'vuex'
import { bech32 } from 'bech32'
import cosmosConfig from '~/cosmos.config'
import {
  defaultRegistryTypes,
  assertIsDeliverTxSuccess,
  SigningStargateClient,
} from '@cosmjs/stargate'

  function bech32Validation(address) {
    try {
      const words = bech32.decode(address)
      Buffer.from(bech32.fromWords(words.words)).toString(`hex`)
      return true
    } catch (error) {
      return false
    }
  }
  function prefixValidation(address) {
    if (address && address.startsWith(this.network.addressPrefix)) {
      return true
    } else {
      return false
    }
  }
  export default {
    props: ['chainIdProps', 'amountClaimAll', 'getAllDelegation'],
    data: (instance) => ({
      dialog: false,
      dialogStepper: false,
      e1: 1,
      eError: true,
      dislableSend: true,
      address: '',
      addressRules: [
        v => !!v || 'Address is required',
        v => v.startsWith(instance.chainIdProps.toLowerCase()) || 'Address must start with "' + instance.chainIdProps.toLowerCase() + '"',
        v => bech32Validation(v) || 'Bad address (not bech32)',
      ],
      amount: '',
      amountRules: [
        v => !!v || 'Amount is required',
        v => !isNaN(v) || 'Amount must be number',
      ],
      memo: '',
      loading: false,
      cosmosConfig: cosmosConfig 
    }),
    computed: {
      ...mapState('data', ['chainId', `balances`, 'delegations']),
    }, 
    methods: {
      validate () {    

      (async () => {
        this.$refs.form.validate()
        this.loading = true
        
        const chainId = cosmosConfig[0].chainId;
        await window.keplr.enable(chainId);
        const offlineSigner = await window.getOfflineSignerAuto(chainId);
        const accounts = await offlineSigner.getAccounts();

        const client = await SigningStargateClient.connectWithSigner(
          cosmosConfig[0].rpcURL,
          offlineSigner
        )
        const convertAmount = this.amount * 1000000
        const amount = {
          denom: cosmosConfig[0].coinLookup.chainDenom,
          amount: convertAmount.toString(),
        }
        const fee = {
          amount: [
            {
              denom: cosmosConfig[0].chainDenom,
              amount: '5000',
            },
          ],
          gas: '1000000',
        }

        const WithdrawDelegatorReward = defaultRegistryTypes[3][1] // MsgWithdrawDelegatorReward
        // console.log(WithdrawDelegatorReward)
        const copieDelegator = []
        this.getAllDelegation.forEach(function (item) {
          copieDelegator.push({
            typeUrl: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
            value: WithdrawDelegatorReward.fromPartial({
              delegatorAddress: accounts[0].address,
              validatorAddress: item.op_address,
            }),
          })
        })

        try {          
          const result = await client.signAndBroadcast(accounts[0].address, copieDelegator, fee, '')
          assertIsDeliverTxSuccess(result)
          this.dialog = false
          this.loading = false        
          await this.$store.dispatch('data/refresh', accounts[0].address)        
        } catch (error) {
            console.error(error);
            this.eError = false
            this.loading = false
        }
        })();

      },
    },
  }  
</script>

<style>
.vuetify-logo {
  height: 180px;
  width: 180px;
  transform: rotateY(560deg);
  animation: turn 3.5s ease-out forwards 1s;
}

@keyframes turn {
  100% {
    transform: rotateY(0deg);
  }
}
</style>
