<template>
  <v-app id="inspire">
    <router-view />
  </v-app>
</template>

<script>
export default {
  name: "App",
  components: {},
  data: () => ({}),
  created() {
    this.$store.commit("Global/clock_update");
    setInterval(() => {
      this.$store.commit("Global/clock_update");
    }, 1000);
  }
};
</script>
