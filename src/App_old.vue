<template>
  <BappCal backend="http://localhost" />
</template>

<script>
import BappCal from './components/BappCal.vue'

// TODO: Make a Venue-Service or Config-Service, that provides all the NON-REACTIVE data
//       ie. all the data about venues, rooms, products

export default {
  name: 'App',
  components: {
    BappCal
  }
}
</script>
