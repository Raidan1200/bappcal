<template>
  <BappCal backend="http://localhost" />
</template>

<script>
import BappCal from './components/BappCal.vue'

export default {
  name: 'App',
  components: {
    BappCal
  }
}
</script>
