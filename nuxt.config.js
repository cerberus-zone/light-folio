import colors from "vuetify/es5/util/colors";

export default {
  ssr: false,
  target: "server",

  generate: {
    fallback: true,
  },
  head: {
    titleTemplate: "Cerberus Zone Wallet",
    title: "Cerberus Zone Wallet",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  css: [],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: ['~/plugins/v-chart.js'],


  components: true,

  buildModules: ["@nuxtjs/vuetify"],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    "@nuxtjs/axios",
    // https://github.com/dansmaculotte/nuxt-security
    [
      '@dansmaculotte/nuxt-security',
      {
        dev: true,
        additionalHeaders: true,
        referrer: 'same-origin',
        hsts: {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: true,
        },
      },
    ],    
  ],
  axios: {
    baseURL: "/",
  },

  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    theme: {
      dark: false,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3,
          background: "#121212",
        },
        light: {
          primary: colors.blue.darken2,
          accent: "#ff6b99",
          secondary: colors.grey.darken1,
          success: "#a5d64c",
          info: "#ff53d0",
          warning: "#ff8e00",
          error: "#ff5252",
          background: "#eeeeee",
        },
      },
    },
  },
  server: {
    port: 8085,
    host: "stake.cerberus.zone",
  },
  build: {},
};
