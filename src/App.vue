<template>
  <div class="m-6 p-6 rounded-xl bg-white">
    <h1 class="text-4xl">{{ venue.name }} Buchungsportal</h1>
    <div v-if="loading">Loading</div>
    <div v-else>

      <!-- List of rooms -->
      <div v-for="room in [room(1), room(2)]" :key="room.id">
        <div v-if="!selectedRoom || selectedRoom === room">
          <h2 class="text-2xl">Room: {{ room.name }}</h2>
          <div v-if="selectedRoom === room">
            <button @click="toggleRoom(room)">Back</button>
            <BappProducts
              v-if="selectedRoom.id === 1"
              :products="room.products"
              @selectProduct="selectedProduct = $event"
              @deselectProducts="selectedProduct = null"
            />
            <BappCalendar
              v-if="selectedProduct"
              :room="room"
              :product="selectedProduct"
            />
          </div>
          <div v-else>
            <button
              @click="toggleRoom(room)"
            >Select</button>
          </div>
        </div>
      </div>

      <!-- Curling Option -->
      <div v-if="selectedRoom === room(1)">
        <div>
          <label for="show_curling">Curlingbahn zubuchen</label>
          <input v-model="showCurling" type="checkbox" id="show_curling">
        </div>

        <BappCalendar
          v-if="showCurling"
          :room="room(2)"
          :product="room(2).products[0]"
        />
      </div>

      <button @click="placeOrder">Order NOW</button>

    </div>
  </div>
</template>

<script>
import axios from 'axios'
import BappProducts from './components/BappProducts'
import BappCalendar from './components/BappCalendar'

export default {
  name: 'BappCal',
  components: {
    BappProducts,
    BappCalendar
  },
  data() {
    return {
      loading: true,
      venue: {},
      selectedRoom: null,
      selectedProduct: null,
      showCurling: false,
      bookings: [
        { room: 1, product: 1, amount: 30, starts_at: '', ends_at: '' },
        { room: 2, product: 2, amount: 2, starts_at: '', ends_at: '' },
      ],
      customer: {
        firstName: '',
        lastName: '',
      }
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
    },
    toggleRoom(room) {
      if (room === this.selectedRoom) {
        this.selectedRoom = null
      } else {
        this.selectedRoom = room
      }
    },
    async placeOrder() {
      const response = await axios.post(`venues/${this.venue.id}/orders`, {
        order: this.bookings,
        customer: this.customer
      })
      console.log(response)
    }
  }
}
</script>
