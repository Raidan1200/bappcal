<template>
  <div class="sm:m-6 sm:p-6 rounded-xl bg-white">
    <h1 class="sm:text-4xl text-3xl mb-4">{{ venue.name }} Buchungsportal</h1>
    <!-- Loading -->
    <div v-if="loading">Lade Daten...</div>

    <!-- Error -->
    <div v-else-if="error">Da ist wohl etwas schief gelaufen. Bitte kontaktieren Sie uns telefonisch.</div>

    <!-- OK ... Go go go -->
    <div v-else>

      <!-- Step 1: Nothing has been selected -->
      <div
        v-if="!selectedRoom && !selectedProduct"
        class="md:flex md:space-x-4"
      >
        <!-- Hüttenrestaurant  -->
        <BappRoom @selectRoom="selectRoom($event)" class="flex-1" :room="room(1)" />
        <!-- Curlingband -->
        <BappRoom @selectRoom="selectRoom($event)" class="flex-1" :room="room(2)" />
      </div>

      <!-- Step 2: Room has been selected -->
      <div
        v-if="selectedRoom && !selectedProduct"
      >
        <div>
          <button
            @click="deselectRoom()"
            class="px-4 py-1 mb-2 rounded-xl bg-blue-200 hover:bg-blue-300"
          >
            zurück
          </button>
        </div>
        <!-- <h2 class="text-2xl">{{ selectedRoom.name }}</h2> -->
        <div
          v-if="selectedRoom.id === 1"
          class="md:flex md:space-x-4"
        >
          <!-- Classic -->
          <BappProduct @selectProduct="selectProduct($event)" class="flex-1" :product="room(1).products[0]" />
          <!-- Premium -->
          <BappProduct @selectProduct="selectProduct($event)" class="flex-1" :product="room(1).products[1]" />
        </div>
      </div>

      <!-- Step 3: Room and Product have been selected -->
      <div v-if="selectedRoom && selectedProduct">
        <div>
          <button
            @click="deselectProduct(selectedProduct)"
            class="px-4 py-1 mb-2 rounded-xl bg-blue-200 hover:bg-blue-300"
          >
            zurück
          </button>
        </div>

        <h2 class="text-2xl">{{ selectedProduct.name }}</h2>

        <!-- Calendar for selected Room and Product -->
        <BappCalendar
          :room="selectedRoom"
          :product="selectedProduct"
          @placeBooking="selectedBooking = $event"
        />

        <!-- For Hüttenrestaurant also show Curling-Calendar -->
        <div
          v-if="selectedRoom.id === 1"
          class="p-4"
        >
          <label for="add-curling">Curlingbahn zubuchen</label>
          <input v-model="addCurling" type="checkbox" name="add-curling">
        </div>

        <div v-if="addCurling">
          <h2 class="text-2xl">Curlingbahn</h2>
          <BappCalendar
            :room="room(2)"
            :product="room(2).products[0]"
            @placeBooking="curlingBooking = $event"
          />
        </div>
      </div>

      <!-- Step 4: Calendar-Dates have been chosen -->
      <!-- TODO: "The Horror! THE HORROR!" ... by Joseph Conrad, good writer, bad coder -->
      <div
        v-if="selectedRoom && selectedProduct && selectedBooking && (!addCurling || addCurling && curlingBooking)"
      >
        <div class="p-4 my-4 bg-gray-100 rounded-xl">
          <h2 class="mb-4 text-2xl">Überprüfen Sie Ihre Buchung</h2>
          <ul class="text-xl">
            <li>{{ formatBookingData(selectedBooking) }} : {{ selectedProduct.name }} für {{ selectedBooking.quantity }} Personen</li>
            <li v-if="addCurling">{{ formatBookingData(curlingBooking) }} : {{ curlingBooking.quantity }} Bahnen auf der {{ room(2).products[0].name }}</li>
          </ul>
        </div>
        <div
          v-if="addCurling && (selectedBooking.starts_at.dayOfYear() !== curlingBooking.starts_at.dayOfYear())"
          class="m-2 px-3 py-2 rounded-xl bg-yellow-200 text-center"
        >
          Hinweis! Ihre Buchungen sind an verschiedenen Tagen!
          Fahren Sie nur fort, wenn dies so gewollt ist.
        </div>
      </div>
      <div
        v-show="selectedBooking && (!addCurling || addCurling && curlingBooking)"
        class="m-8"
      >
        <BappCustomerForm
          @customerCompleted="submitBooking($event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-unused-components */

import axios from 'axios'
import BappRoom from './components/BappRoom'
import BappProduct from './components/BappProduct'
import BappCalendar from './components/BappCalendar'
import BappCustomerForm from './components/BappCustomerForm'

export default {
  name: 'BappCal',
  components: {
    BappRoom,
    BappProduct,
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
      selectedBooking: null,
      addCurling: false,
      curlingBooking: null,
      showCustomerForm: false,
    }
  },
  async mounted() {
    try {
      const venue = await axios.get('config')
      this.venue = venue.data
    } catch (e) {
      console.error(e)
      this.error = true
    }

    this.loading = false
  },
  methods: {
    room(id) {
      return this.venue.rooms.find((room) => room.id === id)
    },
    selectRoom(room) {
      this.selectedRoom = room

      if (room.id === 2) {
        this.selectProduct(this.room(2).products[0])
      }

      console.log('room ' + room.name + ' selected')
    },
    selectProduct(product) {
      this.selectedProduct = product
    },
    deselectProduct(product) {
      const productId = product.id

      this.selectedProduct = null

      if (productId === 3) {
        this.selectedRoom = null
      }

      this.addCurling = false
      this.showCustomerForm = false
    },
    deselectRoom() {
      this.selectedProduct = null
      this.selectedRoom = null
      this.addCurling = false
      this.showCustomerForm = false
    },
    formatBookingData(booking) {
      return `${booking.starts_at.format('dddd, D.M.')} von ${booking.starts_at.format('HH:mm')} bis ${booking.ends_at.add(1, 'hour').format('HH:mm')}`
    },
    collectBookings() {
      const bookings = [{
        room_id: this.selectedRoom.id,
        product_id: this.selectedProduct.id,
        starts_at: this.selectedBooking.starts_at,
        ends_at: this.selectedBooking.ends_at,
        quantity: this.selectedBooking.quantity
      }]

      if (this.addCurling) {
        bookings.push({
          room_id: 2,
          product_id: 3,
          starts_at: this.curlingBooking.starts_at,
          ends_at: this.curlingBooking.ends_at,
          quantity: this.curlingBooking.quantity
        })
      }

      return bookings
    },
    async submitBooking(customer) {
      const bookings = this.collectBookings()
      const response = await axios.post(`venues/${this.venue.id}/orders`, {
        bookings,
        customer
      })

      console.log(response)
    }
  },
}
</script>
