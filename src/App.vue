<template>
  <div class="sm:m-6 sm:p-6 rounded-xl bg-white">
    <!-- <h1 class="sm:text-4xl text-3xl mb-4">{{ venue.name }} Buchungsportal</h1> -->
    <!-- Loading -->
    <div v-if="loading">
      Bitte warten ...
    </div>

    <!-- Error -->
    <div v-else-if="error">
      Da ist wohl etwas schief gelaufen. Bitte kontaktieren Sie uns telefonisch.
      <button
        @click="startFromScratch()"
        class="block px-4 py-1 mt-8 mb-12 rounded-xl bg-blue-200 hover:bg-blue-300"
      >
        Zurück zum Anfang
      </button>
    </div>

    <!-- OK ... Go go go -->
    <div v-else>

      <!-- Step 1: Nothing has been selected
             Show room selection -->
      <div
        v-if="!selectedRoom && !selectedPkg"
        class="md:flex md:space-x-4"
      >
        <!-- Hüttenrestaurant  -->
        <BappRoom @selectRoom="selectRoom($event)" class="flex-1" :room="room(1)" />
        <!-- Curlingbahn -->
        <BappRoom @selectRoom="selectRoom($event)" class="flex-1" :room="room(2)" />
      </div>

      <!-- Step 2: Room has been selected
             Show package selection
             If room 2 has been selected package 3 gets selected automatically -->
      <div v-if="selectedRoom && !selectedPkg" >
        <div>
          <button
            @click="deselectRoom()"
            class="px-4 py-1 mb-2 rounded-xl bg-blue-200 hover:bg-blue-300"
          >
            zurück
          </button>
        </div>
        <div
          v-if="selectedRoom.id === 1"
          class="md:flex md:space-x-4"
        >
          <!-- Classic -->
          <BappPkg @selectPkg="selectPkg($event)" class="flex-1" :pkg="room(1).packages[0]" />
          <!-- Premium -->
          <BappPkg @selectPkg="selectPkg($event)" class="flex-1" :pkg="room(1).packages[1]" />
        </div>
      </div>

      <!-- Step 3: Room and Pkg have been selected
             Show Calendar -->
      <div v-if="!complete && selectedRoom && selectedPkg">
        <div>
          <button
            @click="deselectPkg(selectedPkg)"
            class="px-4 py-1 mb-2 rounded-xl bg-blue-200 hover:bg-blue-300"
          >
            zurück
          </button>
        </div>

        <h2 class="text-2xl">{{ selectedPkg.name }}</h2>

        <!-- Calendar for selected Room and Pkg -->
        <BappCalendar
          :room="selectedRoom"
          :pkg="selectedPkg"
          @placeBooking="selectedBooking = $event"
          :debug="debug"
        />

        <!-- If room 1 has been selected (Hüttenrestaurant)
               show a checkbox to combine it with room 2 (Curlingbahn) -->
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
            :pkg="room(2).packages[0]"
            @placeBooking="curlingBooking = $event"
            :debug="debug"
          />
        </div>
      </div>

      <!-- Step 4: A package, date and time have been selected,
             possibly combined with Curling and date
      -->
      <!-- "The Horror! THE HORROR!" ... by Joseph Conrad, good writer, bad coder -->
      <div
        v-if="selectedBooking && (!addCurling || addCurling && curlingBooking)"
      >
        <div class="p-4 my-4 bg-gray-100 rounded-xl">
          <h2 class="mb-4 text-2xl">Überprüfen Sie Ihre Buchung</h2>
          <ul class="text-xl">
            <li>{{ formatBookingData(selectedBooking) }} : {{ selectedPkg.name }} für {{ selectedBooking.quantity }}
              <span v-if="selectedPkg.id !== 3 && selectedBooking.quantity === 1">Person</span>
              <span v-if="selectedPkg.id !== 3 && selectedBooking.quantity > 1">Personen</span>
              <span v-if="selectedPkg.id === 3 && selectedBooking.quantity === 1">Bahn</span>
              <span v-if="selectedPkg.id === 3 && selectedBooking.quantity > 1">Bahnen</span>
            </li>
            <li v-if="addCurling">{{ formatBookingData(curlingBooking) }} : {{ curlingBooking.quantity }} Bahnen auf der {{ room(2).packages[0].name }}</li>
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
          :loading="loading"
        />
      </div>
      <div
        v-show="complete"
        class="flex flex-col items-center justify-center"
      >
        <div class="text-2xl mt-12">
          Vielen Dank für ihre Buchung!
        </div>

        <button
          @click="startFromScratch()"
          class="block px-4 py-1 mt-8 mb-12 rounded-xl bg-blue-200 hover:bg-blue-300"
        >
          Neue Buchung
        </button>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-unused-components */

import axios from 'axios'
import BappRoom from './components/BappRoom'
import BappPkg from './components/BappPkg'
import BappCalendar from './components/BappCalendar'
import BappCustomerForm from './components/BappCustomerForm'

export default {
  name: 'BappCal',
  components: {
    BappRoom,
    BappPkg,
    BappCalendar,
    BappCustomerForm
  },
  data() {
    return {
      loading: true,
      error: false,
      venue: {},
      selectedRoom: null,
      selectedPkg: null,
      selectedBooking: null,
      curlingBooking: null,

      addCurling: false,
      complete: false,

      debug: false,
    }
  },
  async mounted() {
    const app = document.getElementById('app')

    this.debug = app.classList.contains('debug')

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
        this.selectPkg(this.room(2).packages[0])
      }
    },
    selectPkg(pkg) {
      this.selectedPkg = pkg
    },
    deselectPkg(pkg) {
      const pkgId = pkg.id

      this.selectedPkg = null

      if (pkgId === 3) {
        this.selectedRoom = null
      }

      this.selectedBooking = null
      this.addCurling = false
    },
    deselectRoom() {
      this.selectedPkg = null
      this.selectedRoom = null
      this.addCurling = false
    },
    formatBookingData(booking) {
      return `${booking.starts_at.format('dddd, D.M.')} von ${booking.starts_at.format('HH:mm')} bis ${booking.ends_at.format('HH:mm')}`
    },
    collectBookings() {
      const bookings = [{
        room_id: this.selectedRoom.id,
        package_id: this.selectedPkg.id,
        starts_at: this.selectedBooking.starts_at,
        ends_at: this.selectedBooking.ends_at,
        quantity: this.selectedBooking.quantity
      }]

      if (this.addCurling) {
        bookings.push({
          room_id: 2,
          package_id: 3,
          starts_at: this.curlingBooking.starts_at,
          ends_at: this.curlingBooking.ends_at,
          quantity: this.curlingBooking.quantity
        })
      }

      return bookings
    },
    async submitBooking(customer) {
      const bookings = this.collectBookings()

      this.loading = true

      try {
        const res = await axios.post(`venues/${this.venue.id}/orders`, {
          bookings,
          customer,
        }, {
          timeout: 10000,
        })

        console.log(res)
        if (res.status !== 200) {
          this.error = true;
        }
      } catch (error) {
        this.error = true;
      }

      this.loading = false
      this.complete = true
    },

    startFromScratch() {
      this.loading = false
      this.error = false
      this.complete = false

      this.selectedRoom = null
      this.selectedBooking = null
      this.selectedPkg = null

      this.addCurling = false
      this.curlingBooking = null
    }
  },
}
</script>
