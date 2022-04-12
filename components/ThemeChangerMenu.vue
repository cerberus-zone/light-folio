<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-width="200"
    offset-y
  >
    <template v-slot:activator="{ on }">
      <v-btn large icon v-on="on">
        <v-icon size="30" color="yellow">mdi-palette</v-icon>
      </v-btn>
    </template>
      <v-card>
        <template>
        <!-- menu content start -->
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="font-weight-bold">
              Dark Mode</v-list-item-title>
            </v-list-item-content>
          <v-list-item-action>
            <v-switch color="yellow" v-model="$vuetify.theme.dark" />
          </v-list-item-action>
          </v-list-item>
          <v-divider />
        <!-- menu content end -->
        </template>
      </v-card> 
   </v-menu>
</template>

<script>
export default {
  name: "ThemeChanger",
  data: () => ({
   menu:false
  }),
  methods: {
 
  },
  
};
</script> 
