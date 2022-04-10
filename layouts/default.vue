<template>
  
  <v-app :style="{background: $vuetify.theme.themes[theme].background}">
 
    <v-app-bar
      app
      flat
    >
      <v-container fluid class="py-0 fill-height">
        <v-avatar

          class="mr-10"
          color="grey darken-1"
          size="32"
        >
          <img
            :src="cosmosConfig[0].coinLookup.icon"
            alt="cerberus"
          >
        </v-avatar>

        <v-btn
          class="mr-3"
          v-for="link in links"
          :key="link.link"
          text
          :to="link.link"
        >
          {{ link.name }}
        </v-btn>
        <v-spacer></v-spacer>        
          <!--<v-progress-circular
            v-if="logged"
            :rotate="360"
            :size="20"
            :width="5"
            :value="timerValue"
            color="amber"
            class="mr-4"
          >
      
          </v-progress-circular> -->       
          <v-btn v-if="!logged" elevation="4" depressed v-on:click="connectKeplr">
          <img
            class="mr-2"
            src="/keplr.png"
            width="20"
            height="20"
          >
            Connect keplr
          </v-btn>
        <div v-else>
          {{ accounts[0].address }}
          <v-btn
            v-if="logged"
            class="ma-2"
            :loading="loadingRefresh"
            :disabled="loadingRefresh"
            @click="refresh"
          >
            <v-icon class="mr-2">mdi-refresh</v-icon> Refresh
          </v-btn>
          <v-btn
            v-if="logged"
            class="ma-2"
            @click="logoutNow"
          >
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </div>
      <v-toolbar-items>
        <ThemeChangerMenu />
      </v-toolbar-items>
      </v-container>
    </v-app-bar>
  <Nuxt />
  <v-footer
    padless
  >
    <v-row
      justify="center"
      no-gutters
    >

      <v-col
        class="py-4 text-center"
        cols="12"
      > 
        cerberus.zone - {{ new Date().getFullYear() }} - v1.1.5     
      </v-col>
    </v-row>
  </v-footer>
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
import cosmosConfig from '~/cosmos.config'

export default {
  name: 'DefaultLayout',
  data () {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      links: [
        {
          name: 'Dashboard',
          link: '/'
        },
        {
          name: 'Validators',
          link: '/validators'
        }/*,
        {
          name: 'Proposals',
          link: '/proposals'
        }*/
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js',
      cosmosConfig: cosmosConfig,
      loadingRefresh: false,
    }
  },
  computed: {
    ...mapState('keplr', [`accounts`, `initialized`, `error`, `logged`, `logout`]),
    ...mapState('data', [`balances`, 'validators', 'delegations', 'delegationsLoaded', 'validatorsLoaded', 'rewards', 'rewardsLoaded', 'reDelegations', 'unbondings', 'lastBlock', 'balancesLoaded','priceLoaded', 'price']),
    theme(){
      // console.log(this.$vuetify.theme.themes[(this.$vuetify.theme.dark) ? 'dark' : 'light'].background)
      return (this.$vuetify.theme.dark) ? 'dark' : 'light'
    },  
  },
  async mounted() {
    await this.$store.dispatch('data/getAllValidators')
    await this.$store.dispatch('data/getPrice')
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
 
      async refresh() {
        this.loadingRefresh = true
        await this.$store.dispatch('data/refresh', this.accounts[0].address)
        // await this.$store.dispatch('test/refresh')
        this.loadingRefresh = false
        // console.log(this.accounts)
      },
      logoutNow() {
        this.$store.dispatch('keplr/logout')
        this.$store.dispatch('data/resetSessionData')
        // this.$router.push({path: "login"})
      },
    },  
}
</script>
