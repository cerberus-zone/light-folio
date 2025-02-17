<template>
    <v-dialog
      v-model="dialog"
      max-width="600px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          v-on="on"
          :disabled="!enableModal"
          icon
          color="yellow"
        >
        <v-icon>mdi-cached</v-icon>
        </v-btn>
      </template>
      <v-card>
        <v-card-title>
          <span class="text-h5">Redelegate from {{ validatorName }}</span>
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
            <v-row>
              <v-col cols="12">
                <v-col class="text-right">
                  <v-chip
                    @click="getQuarter"
                  >
                  1/4
                  </v-chip>
                  <v-chip
                    @click="getHalf"
                  >
                  1/2
                  </v-chip>
                  <v-chip
                    @click="getMax"
                  >
                  Max
                  </v-chip>
                </v-col>

                <v-text-field
                  v-model="amount"
                  outlined
                  label="Amount Redelegate*"
                  :rules="(!loadingInput) ? amountRules : ''"
                  type="text"
                >
                  <template v-slot:append>
                    <img
                      width="24"
                      height="24"
                      :srcset='coinIcon'
                      alt=""
                      :class="`rounded-xl`"
                    >
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="address"
                  label="Address from*"
                  :rules="addressRules"
                  required
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="addressTo"
                  label="Address to*"
                  :rules="addressRules"
                  required
                  outlined
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="memo"
                  label="Memo"
                  required
                  outlined
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                sm="6"
              >
              </v-col>
            </v-row>
          </v-container>
          <small>*indicates required field</small>
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
            Redelegate
          </v-btn>
        </v-card-actions>
      </v-card>

    </v-dialog>

</template>

<script>
import { mapState } from 'vuex'
import { bech32 } from 'bech32'
import { notifWaiting, notifError, notifSuccess } from '~/libs/notifications'
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
    props: ['chainIdProps', 'addressFrom', 'amountRe', 'validatorName', 'coinIcon'],
    data: (instance) => ({
      dialog: false,
      dislableSend: true,
      address: instance.addressFrom,
      addressTo: '',
      addressRules: [
        v => !!v || 'Address is required',
        v => v.startsWith(instance.chainIdProps.toLowerCase() + 'valoper') || 'Address must start with "' + instance.chainIdProps.toLowerCase() + 'valoper"',
        v => bech32Validation(v) || 'Bad address (not bech32)',
      ],
      amount: instance.amountRe,
      amountRules: [
        v => !!v || 'Amount is required',
        v => !isNaN(v) || 'Amount must be number',
        v => v <= instance.amountRe || 'Amount equal or above delegated amount (' + instance.amountRe + ')',
      ],
      memo: '',
      loading: false,
      loadingInput: false,
      config: cosmosConfig
    }),
    computed: {
      ...mapState('data', ['chainId', `balances`]),
      enableModal: function () {
        var isDeleg = false
        if (this.amountRe !== '0')
          isDeleg =  true

        return isDeleg
      }
    },
    methods: {
      getMax () {
        this.amount = this.amountRe
      },
      getHalf () {
        this.amount = this.amountRe / 2
      },
      getQuarter () {
        this.amount = this.amountRe / 4
      },
      validate () {
        if (this.$refs.form.validate() === true) {
          (async () => {
            this.loading = true

            const chainId = cosmosConfig[0].chainId;
            await window.keplr.enable(chainId);
            const offlineSigner = await window.getOfflineSignerAuto(chainId);
            const accounts = await offlineSigner.getAccounts();

            const client = await SigningStargateClient.connectWithSigner(
              cosmosConfig[0].rpcURL,
              offlineSigner
            )
            const convertAmount = Number(this.amount).toFixed(2) * 1000000
            const amountFinal = {
              denom: cosmosConfig[this.chainId].coinLookup.chainDenom,
              amount: convertAmount.toString(),
            }
            const fee = {
              amount: [
                {
                  denom: cosmosConfig[this.chainId].coinLookup.chainDenom,
                  amount: '5000',
                },
              ],
              gas: '300000', // Need more gas for redelegation!
            }
            const MsgBeginRedelegate = defaultRegistryTypes[8][1] // MsgBeginRedelegate
            const reDelegateMsg = {
              typeUrl: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
              value: MsgBeginRedelegate.fromPartial({
                delegatorAddress: accounts[0].address,
                validatorSrcAddress: this.address,
                validatorDstAddress: this.addressTo,
                amount: amountFinal,
              }),
            }

            try {

              const result = await client.signAndBroadcast(accounts[0].address, [reDelegateMsg], fee, this.memo)
              assertIsDeliverTxSuccess(result)
              this.dialog = false
              this.loading = false
              await this.$store.dispatch('data/refresh', accounts[0].address)
            } catch (error) {
                console.error(error);
                this.loading = false
            }
          })();
        }
      },
    },
  }
</script>

