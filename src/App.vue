<template>
  <div class="m-6 p-6 rounded-xl bg-white">
    <h1 class="text-4xl">{{ venue.name }} Buchungsportal</h1>
    <!-- Loading -->
    <div v-if="loading">Loading</div>

    <!-- Error -->
    <div v-else-if="error">There was a problem. Try again later</div>

    <!-- OK ... Go go go -->
    <div v-else>

      <!-- List of rooms -->
      <div v-for="room in [room(1), room(2)]" :key="room.id">
        <div v-if="!selectedRoom || selectedRoom === room">
          <h2 class="text-2xl">Room: {{ room.name }}</h2>
          <div v-if="selectedRoom === room">
            <button @click="toggleRoom(room)">Back</button>
            <BappProducts
              :products="room.products"
              @selectProduct="selectProduct($event)"
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
    </div>
    <div v-if="getError">{{ getError() }}</div>

    <BappCustomerForm
      v-if="showCustomerForm"
      @setCustomer="handleSubmit($event)"
    />

    <button
      v-if="!showCustomerForm"
      @click="showCustomerForm = true"
      :disabled="getError()"
      :class="{ 'bg-red-300' : getError() }"
    >Kundendaten eingeben</button>
    {{ bla() }}
  </div>
</template>

<script>
import axios from 'axios'
import cart from './cart.service'
import BappProducts from './components/BappProducts'
import BappCalendar from './components/BappCalendar'
import BappCustomerForm from './components/BappCustomerForm'

export default {
  name: 'BappCal',
  components: {
    BappProducts,
    BappCalendar,
    BappCustomerForm
  },
  data() {
    return {
      loading: true,
      error: false,
      venue: {},
      selectedRoom: null,
      selectedProduct: null,
      showCurling: false,
      showCustomerForm: false,
    }
  },
  async mounted() {
    try {
      const venue = await axios.get('config')
      this.venue = venue.data
    } catch (e) {
      console.log(e)
      this.error = true
    }

    this.loading = false
  },
  methods: {
    room(id) {
      return this.venue.rooms.find((room) => room.id === id)
    },
    toggleRoom(room) {
      if (room === this.selectedRoom) {
        this.selectedRoom = null
        this.selectedProduct = null
      } else {
        this.selectedRoom = room
        if (this.selectedRoom === this.room(2)) {
          this.selectedProduct = this.room(2).products[0]
        }
      }
    },
    selectProduct(product) {
      this.selectedProduct = product
      if (product) {
        cart().addOrUpdateBooking(product)
      } else {
        cart().removeBooking(this.selectedRoom)
      }
    },
    getError() {
      return cart().getError().value
    },
    async handleSubmit($event) {
      const response = await axios.post(`venues/${this.venue.id}/orders`, {
        bookings: cart().getBookings().value,
        customer: $event
      })

      console.log(response)
    },
    bla() {
      return cart().getBookings().value
    },
  },
}
</script>
