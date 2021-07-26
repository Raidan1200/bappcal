<template>
  <div class="relative">
    <div v-if="loading" class="absolute loader ease-linear rounded-full border-8 border-t-8 border-gray-200 flex justify-center align-middle h-24 w-24"></div>
    <div v-if="bookings && calendar">
      <div v-if="setTime === 'start'">Startzeit wählen</div>
      <div v-else>Endzeit wählen</div>
      <table>
        <thead>
          <tr class="bg-gray-200">
            <td>Day / Hour</td>
            <td
              v-for="(hour, idx) in calendar[0]"
              :key="idx"
              class="text-center"
            >
              {{ hour.datetime.hour() }}
            </td>
          </tr>
        </thead>
        <tr v-for="(day, dIdx) in calendar" :key="dIdx">
          <td
            class="hover:bg-gray-300"
            @click="updateDayOfYear(day[0].datetime, dIdx)"
          >
            {{ day[0].datetime.format('dd D.M.') }}
          </td>
          <td
            v-for="(hour, hIdx) in day"
            :key="hIdx"
            @click="updateTimeFromCalendar(hour.datetime)"
            class="px-2 hover:bg-gray-200"
            :class="hour.color"
          >
            <div class="text-gray-400">{{ hour.datetime.format('HH:mm') }}</div>
            {{ hour.free }}
          </td>
        </tr>
      </table>

      <div>
        <button
          v-if="showMoveWeekButton('prev')"
          @click="moveWeek('prev')"
        >Früher</button>
        <button
          v-if="showMoveWeekButton('next')"
          @click="moveWeek('next')"
        >Später</button>
      </div>

      <div
        v-if="error"
        class="bg-red-300"
      >
        {{ this.error }}
      </div>

      <label for="starts_at">Von</label>
      <input
        type="number"
        name="starts_at"
        id="starts_at"
        :value="booking.starts_at?.hour()"
        @input="updateStartsAt($event)"
        :min="product.opens_at.substr(0, 2)"
        :max="product.closes_at.substr(0, 2)"
        :class="{ 'bg-green-100' : setTime === 'start' }"
      >
      <label for="ends_at">Bis</label>
      <input
        type="number"
        name="ends_at"
        id="ends_at"
        :value="booking.ends_at?.hour()"
        @input="updateEndsAt($event)"
        :min="product.opens_at.substr(0, 2)"
        :max="product.closes_at.substr(0, 2)"
        :class="{ 'bg-green-100' : setTime === 'end' }"
      >
      <label for="quantity">Menge</label>
      <input
        :value="booking.quantity"
        @input="updateQuantity($event)"
        type="number"
        name="quantity"
        id="quantity"
        :min="product.min_occupancy ?? 0"
        :max="room.capacity"
      >
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'
import cart from '../cart.service'

export default {
  name: 'BappCalendar',
  props: {
    room: {
      type: Object,
      required: true,
    },
    product: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      loading: false,
      calendar: null,
      offset: 0,
      setTime: 'start',
      bookings: null,  // TODO actually I don't need to store the bookings - just apply them?
      booking: {
        starts_at: null,
        ends_at: null,
        quantity: this.product.min_occupancy ?? 0,
        color: true,
      },
      error: '',
      errors: {
        capacityExceeded: 'Für Ihre Auswahl sind nicht genug Plätze frei.',
      }
    }
  },
  async mounted() {
      await this.fetchBookings()
      this.makeCalendar()
  },
  beforeUnmount() {
    console.log(this.roomId);
    cart().removeBooking(this.roomId)
  },
  methods: {
    // Interface
    updateStartsAt(e) {
      this.booking.starts_at = this.booking.starts_at?.hour(e.target.value) || dayjs(this.product.opens_at)
      this.makeCalendar()
    },
    updateEndsAt(e) {
      this.booking.ends_at = this.booking.ends_at?.hour(e.target.value) || dayjs(this.product.closes_at)
      this.makeCalendar()
    },
    updateQuantity(e) {
      this.booking.quantity = e.target.value
      this.makeCalendar()
    },
    updateDayOfYear(date) {
      this.booking.starts_at = this.booking.starts_at.dayOfYear(date.dayOfYear())
      this.booking.ends_at = this.booking.ends_at.dayOfYear(date.dayOfYear())
      this.makeCalendar()
    },
    updateTimeFromCalendar(date) {
      if (this.setTime === 'start') {
        this.booking.starts_at = date
        this.booking.ends_at = date
      } else {
        this.booking.ends_at = this.booking.starts_at.hour(date.hour())
      }
      this.toggleStartEndTime()
      this.makeCalendar()
    },
    async moveWeek(direction) {
      if (direction === 'prev') {
        this.offset--
        if (this.booking.starts_at && this.booking.ends_at) {
          this.booking.starts_at = this.booking.starts_at.subtract(1, 'week')
          this.booking.ends_at = this.booking.ends_at.subtract(1, 'week')
        }
      }
      if (direction === 'next') {
        this.offset++
        if (this.booking.starts_at && this.booking.ends_at) {
          this.booking.starts_at = this.booking.starts_at.add(1, 'week')
          this.booking.ends_at = this.booking.ends_at.add(1, 'week')
        }
      }

      await this.fetchBookings()
      this.makeCalendar()
    },
    showMoveWeekButton(direction) {
      if (direction === 'prev') {
        return this.firstCalendarDay().isAfter(this.product.starts_at, 'day')
      }
      if (direction === 'next') {
        return this.lastCalendarDay().isBefore(this.product.ends_at, 'day')
      }
    },
    toggleStartEndTime() {
      this.setTime = (this.setTime === 'start') ? 'end' : 'start'
    },
    firstCalendarDay() {
      return this.calendar[0][0].datetime
    },
    lastCalendarDay() {
      return this.calendar[this.calendar.length - 1][0].datetime
    },

    // Calendar
    makeCalendar() {
      this.makeWeek()
      this.applyBookings()
      if (this.booking.starts_at && this.booking.ends_at) {
        this.applyBooking(this.booking)
      }
      cart().addOrUpdateBooking({
        roomId: this.room.id,
        productId: this.product.id,
        booking: this.booking,
      })
    },
    makeWeek() {
      let start = dayjs().startOf('week').add(this.offset, 'weeks').hour(...this.product.opens_at.split(':'))
      let end = dayjs().endOf('week').add(this.offset, 'weeks').hour(...this.product.closes_at.split(':'))

      if (start.isBefore(this.product.starts_at)) {
        start = dayjs(this.product.starts_at).hour(...this.product.opens_at.split(':'))
      }

      if (end.isAfter(this.product.ends_at)) {
        end = dayjs(this.product.ends_at).hour(...this.product.closes_at.split(':'))
      }

      const week = []
      let pointer = start.clone()
      let endOfDay = start.hour(...this.product.closes_at.split(':'))

      while (pointer.isSameOrBefore(end, 'days')) {
        const day = []

        while (pointer.isBefore(endOfDay, 'hours')) {
          day.push({
            datetime: pointer,
            free: this.room.capacity
          })

          pointer = pointer.add(1, 'hour')
        }

        week.push(day)
        pointer = pointer.hour(...this.product.opens_at.split(':')).add(1, 'day')
        endOfDay = pointer.hour(...this.product.closes_at.split(':'))
      }

      this.calendar = week
    },
    // Bookings
    async fetchBookings() {
      const from = dayjs().startOf('week').add(this.offset, 'weeks').format('YYYY-MM-DD')
      const to = dayjs().endOf('week').add(this.offset, 'weeks').format('YYYY-MM-DD')

      this.loading = true
      const bookings = await axios.get(`rooms/${this.room.id}/bookings?from=${from}&to=${to}`)
      this.loading = false

      this.bookings = bookings.data
    },
    applyBookings() {
      this.bookings.forEach(booking => this.applyBooking(booking))
    },
    applyBooking(booking) {
      this.error = ''
      let pointer = dayjs(booking.starts_at)
      while (pointer.isSameOrBefore(dayjs(booking.ends_at), 'minute')) {
        let indexDay, indexHour
        if (pointer.isSameOrAfter(pointer.hour(this.product.opens_at.substring(0, 2)), 'minute')) {
          indexDay = (pointer.day() + 6) % 7
          indexHour = pointer.subtract(this.product.opens_at.substring(0, 2), 'hours').hour()
          if (indexDay < this.calendar.length && indexHour < this.calendar[indexDay].length) {
            const hour = this.calendar[indexDay][indexHour]
            hour.free -= booking.quantity
            if (booking.color) {
              hour.color = 'bg-green-300'
              if (hour.free < 0) {
                this.error = this.errors.capacityExceeded
              }
            }
            if (hour.free < 0) {
              hour.color = 'bg-red-300'
            }
          }
        }
        pointer = pointer.add(1, 'hour')
      }
    },
  }
}
</script>

<style>
.loader {
  border-top-color: #3498db;
  -webkit-animation: spinner 1.5s linear infinite;
  animation: spinner 1.5s linear infinite;
}

@-webkit-keyframes spinner {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spinner {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
