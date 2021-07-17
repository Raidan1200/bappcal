<template>
  <div class="m-6 p-6 rounded-xl bg-white">
    <button @click="selectedRoom = null; selectedProduct = null">Reset</button>

    <h1 class="text-4xl">{{ venue.name }} Buchungsportal</h1>
    <div v-if="loading">Loading</div>
    <div v-else>
      <div v-for="roomId in [1, 2]" :key="roomId">
        <!-- 'TODO: passing curling like this is crap! I need a STORE!!! -->
        <BappRoom
          v-if="!selectedRoom || selectedRoom === roomId"
          @selectRoom="selectedRoom = $event"
          :room="room(roomId)"
          :curling="room(2)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import BappRoom from './BappRoom'

export default {
  name: 'BappCal',
  components: {
    BappRoom,
  },
  data() {
    return {
      loading: true,
      venue: {},
      selectedRoom: null,
    }
  },
  async mounted() {
    const venue = await axios.get('config')
    this.venue = venue.data

    this.loading = false
  },
  methods: {
    room(id) {
      return this.venue.rooms.find((room) => room.id === id)
    }
  }
}
</script>

// TODO
// orders->deposit
// orders->deposit_paid
// orders->paid
// products->parent_id
