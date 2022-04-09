import axios from 'axios'
import cosmos from 'cosmos-lib'
import cosmosConfig from '~/cosmos.config'

export const state = () => ({
  lastBlock: '',
  block: undefined,
  chainId: 0,
  price: 0,
  priceLoaded: false,
  balances: [],
  balancesLoaded: false,
  rewards: [],
  rewardsLoaded: false,
  delegations: [],
  delegationsLoaded: false,
  reDelegations: [],
  reDelegationsLoaded: false,
  unbondings: [],
  unbondingsLoaded: false,  
  undelegations: [],
  undelegationsLoaded: false,
  validators: [],
  validatorsLoaded: false,
  proposals: [],
  proposal: [],
  proposalLoaded: false,
  isValidator: false,
  allWallet: [],
  allWalletLoaded: false,
  allCommissions: [],
})

export const mutations = {
  // create set methods from data points
  ...Object.fromEntries(
    Object.keys(state()).map((entity) => {
      return [
        `set${entity.charAt(0).toUpperCase()}${entity.substr(1)}`,
        (state, value) => {
          state[entity] = value
        },
      ]
    })
  ),
  resetSessionData(state) {
    state.balances = []
    state.rewards = []
    state.delegations = []
    state.undelegations = []
    state.rewards = []
    state.transactions = []
  },
}

export const actions = {
  init({ commit }) {
    commit('setApi', new DataSource(this.$axios, network))
  },
  // this is never awaited in the code
  async refresh({ dispatch, state }, address) {
    // console.log(address)
    const calls = [
      dispatch('getWalletInfo', address),
      dispatch('getDelegations', address),
      dispatch('getAllProposals'),
      dispatch('getReDelegations', address),
      dispatch('getLastBlock'),
      dispatch('getPrice'),  
    ]
    await Promise.all(calls)
  },

  async getLastBlock({ commit, state }) {
    const lastBlock = await axios(cosmosConfig[state.chainId].apiURL + `/blocks/latest`)
    commit('setLastBlock', lastBlock.data.block.header.height)
  },  

  async getPrice({ commit, state }) {
    const chainPrice = await axios('https://api.coingecko.com/api/v3/simple/price?ids=' + cosmosConfig[0].coingeckoId + '&vs_currencies=usd')
    // console.log(chainPrice.data[cosmosConfig[0].coingeckoId].usd)
    commit('setPrice', chainPrice.data[cosmosConfig[0].coingeckoId].usd)
    commit('setPriceLoaded', true)    
  },  
  
  async getWalletInfo({ commit, state }, address) {
    const accountInfo = await axios(cosmosConfig[state.chainId].apiURL + `/bank/balances/` + address)
    const foundAccountInfo = accountInfo.data.result.find(element => element.denom === cosmosConfig[state.chainId].coinLookup.chainDenom)

    if(typeof foundAccountInfo === 'undefined') {
      var amount = 0
    } else
      var amount = Number(foundAccountInfo.amount)

    commit('setBalances', amount)
    commit('setBalancesLoaded', true)    
    return accountInfo
  },

  async checkIsValidator({ commit, state }, valAddress) {
    let apiRes = null;
    apiRes = await axios(cosmosConfig[state.chainId].apiURL + `/cosmos/staking/v1beta1/validators/` + valAddress)
    .then(response => {
      //console.log(response)
      commit('setIsValidator', true)
      //
    })
    .catch(error => {
        //console.log(error.response)
        commit('setIsValidator', false)
    });
  },

  async getDelegations({ commit, state }, address) {
    const getDelegations = await axios(cosmosConfig[state.chainId].apiURL + `/cosmos/distribution/v1beta1/delegators/` + address + `/rewards`)
    let foundMainDenom = getDelegations.data.total.find(element => element.denom === cosmosConfig[state.chainId].coinLookup.chainDenom);
    if (typeof foundMainDenom === 'undefined') {
      foundMainDenom = {
        denom: cosmosConfig[state.chainId].coinLookup.chainDenom,
        amount: '0'
      }
    }
    var copieRewards = [];
    //console.log(denomId)
    if (cosmosConfig[state.chainId].name === 'MicroTick') {
      var denomId = 1
    } else {
      var denomId = 0
    }


    const getValidatorInfo = await axios(cosmosConfig[state.chainId].apiURL + `/staking/delegators/` + address + `/delegations?page=1&limit=3`)
    const getValidatorMainInfo = await axios(cosmosConfig[state.chainId].apiURL + `/cosmos/staking/v1beta1/validators?pagination.limit=200`)

    await getDelegations.data.rewards.forEach(function(item){
      let foundDelegByValidator = getValidatorInfo.data.result.find(element => element.delegation.validator_address === item.validator_address);
      let foundValidatorMainInfo = getValidatorMainInfo.data.validators.find(element => element.operator_address === item.validator_address);

      //console.log(getValidatorMainInfo.data.validators.length)
      copieRewards.push({
        validatorName: foundValidatorMainInfo?.description.moniker,
        op_address: foundDelegByValidator.delegation.validator_address,
        reward: item.reward[denomId]?.amount,
        share: foundDelegByValidator.delegation.shares
      });
    });
    // console.log(copieRewards)

    commit('setDelegations', copieRewards)
    commit('setRewards', foundMainDenom)
    commit('setRewardsLoaded', true)
    commit('setDelegationsLoaded', true)
  },
  
  async getReDelegations({ commit, state }, address) {
    // /cosmos/staking/v1beta1/delegators/cerberus13jawsn574rf3f0u5rhu7e8n6sayx5gkwwtq2rg/redelegations
    const getValidatorMainInfo = await axios(cosmosConfig[state.chainId].apiURL + `/cosmos/staking/v1beta1/validators?pagination.limit=200`)    
    let apiRes = await axios(cosmosConfig[state.chainId].apiURL + '/cosmos/staking/v1beta1/delegators/' + address + '/redelegations')

      let output = []
      await apiRes.data.redelegation_responses.forEach(function(item){
        let foundValidatorMainInfo = getValidatorMainInfo.data.validators.find(element => element.operator_address === item.redelegation.validator_src_address);
        let foundValidatorDstInfo = getValidatorMainInfo.data.validators.find(element => element.operator_address === item.redelegation.validator_dst_address);
        // console.log(apiRes.data.redelegation_responses)
        
        output.push({
          validator_src_address: foundValidatorMainInfo.description.moniker,
          validator_dst_address: foundValidatorDstInfo.description.moniker,
          amount: item.entries[0].balance / 1000000,
          completion_time: item.entries[0].redelegation_entry.completion_time
        });     
      });
      commit('setReDelegations', output) 
  },  
  
  async getUnbondings({ commit, state }, address) {
    // /cosmos/staking/v1beta1/delegators/cerberus13jawsn574rf3f0u5rhu7e8n6sayx5gkwwtq2rg/redelegations
    const getValidatorMainInfo = await axios(cosmosConfig[state.chainId].apiURL + `/cosmos/staking/v1beta1/validators?pagination.limit=200`)    
    let apiRes = await axios(cosmosConfig[state.chainId].apiURL + '/cosmos/staking/v1beta1/delegators/' + address + '/unbonding_delegations')

      let output = []
      await apiRes.data.unbonding_responses.forEach(function(item){
        //console.log(item)
        let foundValidatorMainInfo = getValidatorMainInfo.data.validators.find(element => element.operator_address === item.validator_address);
        // console.log(apiRes.data.redelegation_responses)
        
        output.push({
          validator_src_address: foundValidatorMainInfo.description.moniker,
          amount: item.entries[0].balance / 1000000,
          completion_time: item.entries[0].completion_time
        });   
      });
      commit('setUnbondings', output) 
  },  
  
  async getAllValidators({ commit, state }) {
    var copieValidators = [];
    const allValidators = await axios(cosmosConfig[0].apiURL + `/staking/validators`)
    // await allValidators.data.result.forEach(function(item){
    await Promise.all(allValidators.data.result.map(async (item) => {

      let apiRes = null;
      let finalAvatar = cosmosConfig[0].monikerResources + '/' + item.operator_address + '.png'
      try {
        await axios.get(finalAvatar);
        apiRes = finalAvatar
      } catch (err) {
        apiRes = cosmosConfig[0].coinLookup.icon;
      }     
        
      copieValidators.push({
        name: item.description.moniker,
        op_address: item.operator_address,
        crate: (Number(item.commission.commission_rates.rate) * 100).toFixed(2) + ' %',
        website: item.description.website,
        tokens: item.tokens,
        avatar: apiRes
      })
    }))
    
    copieValidators.sort(function(a, b) {
      return b.tokens - a.tokens
    })  

    commit('setValidators', copieValidators)
    commit('setValidatorsLoaded', true)
  },

  async getAllProposals({ commit, state }) {
    const allProposals = await axios(cosmosConfig[state.chainId].apiURL + `/cosmos/gov/v1beta1/proposals`)
    //console.log(allProposals.data.proposals)
    commit('setProposals', allProposals.data.proposals.reverse())
  },

  async getSingleProposal({ commit, state }, proposalId) {
    const allProposals = await axios(cosmosConfig[state.chainId].apiURL + `/cosmos/gov/v1beta1/proposals/` + proposalId)
    // console.log(allProposals.data.proposal)
    commit('setProposal', allProposals.data.proposal)
    commit('setProposalLoaded', true)
  },

  async getAllCommissions({ commit, state }, addVal) {
    // var copieValidators = [];
    const allCommissions = await axios(cosmosConfig[state.chainId].apiURL + `/cosmos/tx/v1beta1/txs?events=message.sender=%27`+addVal+`%27&events=message.action=%27/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission%27`)

    //console.log(allCommissions)
    /*await allValidators.data.result.forEach(function(item){
      copieValidators.push({
        name: item.description.moniker,
        op_address: item.operator_address,
        crate: (Number(item.commission.commission_rates.rate) * 100).toFixed(2)
      });
    });*/

   commit('setAllCommissions', allCommissions.data.tx_responses)
  },

  async getAllAddressData({ commit, state }, data) {

    /*const allProposals = await axios(cosmosConfig[state.chainId].apiURL + `/cosmos/gov/v1beta1/proposals/` + proposalId)*/

    commit('setAllWallet', data)
    //commit('setAllWalletLoaded', true)
  },

  changeChaniId({ commit }, chainId) {
    commit('setChainId', chainId)
  },
  resetSessionData({ commit }) {
    commit('resetSessionData')
  },
}
