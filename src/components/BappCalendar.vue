<template>
  <div class="rounded-xl p-4 bg-gray-100 flex justify-center">
    <!-- Loading -->
    <!-- TODO: Placement -->
    <div v-if="loading" class="absolute loader ease-linear rounded-full border-8 border-t-8 border-gray-200 flex justify-center align-middle h-24 w-24"></div>

    <!-- Bookings have been loaded, calendar has been built -->
    <div
      v-if="bookings && calendar"
      class="flex flex-col"
    >

      <!-- Info-Box -->
      <div class="flex justify-between p-2 rounded text-center bg-gray-200">
        <button
          @click="moveWeek('prev')"
          class="px-3 py-1 rounded-xl bg-blue-200 hover:bg-blue-300"
          :class="{'invisible' : hideMoveWeekButton('prev')}"
          :aria-hidden="hideMoveWeekButton('prev')"
        >Früher</button>
<!--
        <div class="px-3 py-1 rounded-xl bg-green-100">
          <div v-if="setTime === 'start'">Startzeit wählen</div>
          <div v-else>Endzeit wählen</div>
        </div>
 -->
        <button
          @click="moveWeek('next')"
          class="px-3 py-1 rounded-xl bg-blue-200 hover:bg-blue-300"
          :class="{'invisible' : hideMoveWeekButton('next')}"
          :aria-hidden="hideMoveWeekButton('next')"
        >Später</button>
      </div>

      <!-- Calendar -->
      <table>
        <thead>
          <tr class="bg-gray-200">
            <td class="md:w-28 w-24 pl-2">Tag / Stunde</td>
            <!-- Hours -->
            <th
              v-for="(hour, idx) in calendar[0]"
              :key="idx"
              class="md:w-16 sm:w-12 w-8 py-1 text-center"
            >
              {{ hour.datetime.hour() }}
            </th>
          </tr>
        </thead>
        <tr
          v-for="(day, dIdx) in calendar"
          :key="dIdx"
        >
          <!-- Clickable Week-Days  -->
          <th
            class="py-1 sm:pl-2 sm:hover:-pl-2 hover:bg-gray-200 rounded text-left"
            @click="updateDayOfYear(day[0].datetime, dIdx)"

          >
            {{ day[0].datetime.format('dd D.M.') }}
          </th>
          <!-- Clickable Matrix-Cell -->
          <td
            v-for="(hour, hIdx) in day"
            :key="hIdx"
            @click="updateTimeFromCalendar(hour.datetime)"
            class="px-2 text-center hover:bg-gray-200 sm:border-none border border-gray-400 "
            :class="hour.color"
          >
            <!-- <div class="text-gray-400">{{ hour.datetime.format('HH:mm') }}</div> -->
          <span class="hidden sm:block">
            {{ hour.free }}
          </span>
          </td>
        </tr>
      </table>

      <!-- Booking Controls -->
      <div
        class="py-2 my-2 rounded"
        :class="{ error : 'bg-red-200' }"
      >
        <div class="md:flex md:justify-evenly">
          <div>
            <label for="starts_at">Von</label>
            <input
              type="number"
              name="starts_at"
              id="starts_at"
              v-model="starts_at"
              :min="pkg.opens_at.substr(0, 2)"
              :max="pkg.closes_at.substr(0, 2)"
              class="ml-2 w-20 border-none h-8"
            >:00 Uhr
          </div>
          <div>
            <label for="ends_at">Bis</label>
            <!-- TODO: value input ... this cannot be right -->
            <input
              type="number"
              name="ends_at"
              id="ends_at"
              v-model="ends_at"
              :min="pkg.opens_at.substr(0, 2)"
              :max="pkg.closes_at.substr(0, 2)"
              class="ml-2 w-20 border-none h-8"
            >:59 Uhr
          </div>
          <div>
            <label for="quantity">Menge</label>
            <input
              :value="booking.quantity"
              @input="updateQuantity($event)"
              type="number"
              name="quantity"
              id="quantity"
              :min="pkg.min_occupancy ?? 0"
              :max="room.capacity"
              class="ml-2 w-20 border-none h-8"
            >
            <span class="ml-2">(Min: {{ pkg.min_occupancy }})</span>
          </div>
        </div>
      </div>

      <!-- Error Box  -->
      <div
        v-if="error"
        class="p-2 rounded text-center bg-red-200"
      >
        {{ this.error }}
      </div>
      <button
        v-if="validated"
        class="p-2 rounded text-center bg-green-200 hover:bg-green-300"
        @click="placeBooking()"
      >
        Daten für <span class="font-semibold">{{ pkg.name }}</span> übernehmen
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'

export default {
  name: 'BappCalendar',
  props: {
    room: {
      type: Object,
      required: true,
    },
    pkg: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      bookings: null,
      calendar: null,
      offset: 0,
      setTime: 'start',
      starts_at: null,
      ends_at: null,
      booking: {
        starts_at: '',
        ends_at: '',
        quantity: this.pkg.min_occupancy ?? 0,
        color: true,
      },
      error: '',
      errors: {
        capacityExceeded: 'Für Ihre Auswahl sind nicht genug Plätze frei.',
        minOccupancyError: 'Sie haben die Mindestbelegung unterschritten',
        startTooEarly: 'Die Startzeit liegt außerhalb der Öffnungszeiten.',
        endTooLate: 'Die Endzeit liegt außerhalb der Öffnungszeiten.',
        endBeforeStart: 'Die Startzeit muss vor der Endzeit liegen.',
      },
      validated: false
    }
  },
  async mounted() {
      this.makeCalendar()
  },
  watch: {
    starts_at(hour) {
      if (this.booking.starts_at) {
        this.booking.starts_at = this.booking.starts_at.hour(hour)
      } else {
        this.booking.starts_at = dayjs(this.calendar[0][0].datetime)
      }
      if (!this.booking.ends_at) {
        this.booking.ends_at = dayjs(this.booking.starts_at)
        this.ends_at = this.booking.ends_at.hour()
      }

      this.makeCalendar()
      this.checkStartAndEndTimes()
    },
    ends_at(hour) {
      if (this.booking.ends_at) {
        this.booking.ends_at = this.booking.ends_at.hour(hour)
      } else {
        this.booking.ends_at = dayjs(this.calendar[0][this.calendar[0].length - 1].datetime)
      }

      if (!this.booking.starts_at) {
        this.booking.starts_at = dayjs(this.booking.ends_at)
        this.starts_at = this.booking.starts_at.hour()
      }

      this.makeCalendar()
      this.checkStartAndEndTimes()
    }
  },
  methods: {
    // Interface
    updateEndsAt(e) {
      this.booking.ends_at = this.booking.ends_at?.hour(e.target.value) || dayjs(this.pkg.closes_at)
      this.makeCalendar()
      this.checkStartAndEndTimes()
    },
    updateDayOfYear(date) {
      this.booking.starts_at = this.booking.starts_at.dayOfYear(date.dayOfYear())
      this.booking.ends_at = this.booking.ends_at.dayOfYear(date.dayOfYear())
      this.makeCalendar()
    },
    updateTimeFromCalendar(date) {
      if (this.setTime === 'start') {
        this.booking.starts_at = date
        // this.starts_at = date.hour()
        this.booking.ends_at = date
      } else {
        this.booking.ends_at = this.booking.starts_at.hour(date.hour())
        this.maybeSwitchStartAndEnd()
      }
      this.toggleStartEndTime()
      this.makeCalendar()
    },
    checkStartAndEndTimes() {
      if (this.booking.starts_at.isBefore(this.pkg.opens_at)) {
        this.error = this.errors.startTooEarly
      }
      if (this.booking.ends_at.isAfter(this.pkg.closes_at)) {
        this.error = this.errors.endTooLate
      }
      if (this.booking.ends_at.isBefore(this.booking.starts_at)) {
        this.error = this.errors.endBeforeStart
      }
    },
    maybeSwitchStartAndEnd() {
      if (this.booking.ends_at.isSameOrBefore(this.booking.starts_at)) {
        const tmp = this.booking.ends_at
        this.booking.ends_at = this.booking.starts_at
        this.booking.starts_at = tmp
      }
    },
    updateQuantity(e) {
      this.booking.quantity = e.target.value
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
    hideMoveWeekButton(direction) {
      if (direction === 'prev') {
        return !this.firstCalendarDay().isAfter(this.pkg.starts_at, 'day') || this.firstCalendarDay().isBefore(dayjs())
      }
      if (direction === 'next') {
        return !this.lastCalendarDay().isBefore(this.pkg.ends_at, 'day')
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
    validate() {
      this.validated = this.booking.starts_at && this.booking.ends_at && this.booking.quantity && !this.error
    },

    // Calendar
    async makeCalendar() {
      this.makeWeek()
      await this.fetchBookings()
      this.applyBookings()
      if (this.booking.starts_at && this.booking.ends_at) {
        this.applyBooking(this.booking)
      }
      this.validate()
      this.$emit('place-booking', null)
    },
    makeWeek() {
      if (!this.offset && dayjs().isBefore(this.pkg.starts_at)) {
        this.offset = dayjs(this.pkg.starts_at).week() - dayjs().week();
      }

      let start = dayjs().startOf('week').add(this.offset, 'weeks').hour(...this.pkg.opens_at.split(':'))
      let end = dayjs().endOf('week').add(this.offset, 'weeks').hour(...this.pkg.closes_at.split(':'))

      if (end.isAfter(this.pkg.ends_at)) {
        end = dayjs(this.pkg.ends_at).hour(...this.pkg.closes_at.split(':'))
      }

      const week = []
      let pointer = start.clone()
      let endOfDay = start.hour(...this.pkg.closes_at.split(':'))

      while (pointer.isSameOrBefore(end, 'days')) {
        const day = []

        while (pointer.isBefore(endOfDay, 'hours')) {
          day.push({
            datetime: pointer,
            free: this.room.capacity,
          })

          pointer = pointer.add(1, 'hour')
        }

        week.push(day)

        pointer = pointer.hour(...this.pkg.opens_at.split(':')).add(1, 'day')
        endOfDay = pointer.hour(...this.pkg.closes_at.split(':'))
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
      if (this.booking.quantity < this.pkg.min_occupancy) {
        this.error = this.errors.minOccupancyError
      }

      let pointer = dayjs(booking.starts_at)
      while (pointer.isSameOrBefore(dayjs(booking.ends_at), 'minute')) {
        let indexDay, indexHour
        if (pointer.isSameOrAfter(pointer.hour(this.pkg.opens_at.substring(0, 2)), 'minute')) {
          indexDay = (pointer.day() + 6) % 7
          indexHour = pointer.subtract(this.pkg.opens_at.substring(0, 2), 'hours').hour()
          if (indexDay < this.calendar.length && indexHour < this.calendar[indexDay].length) {
            const hour = this.calendar[indexDay][indexHour]
            hour.free -= booking.quantity
            if (hour.free < this.pkg.min_occupancy) {
              hour.color = 'bg-red-200'
            }
            if (booking.color) {
              if (hour.free >= 0) {
                hour.color = 'bg-green-300'
              } else {
                this.error = this.errors.capacityExceeded
                hour.color = 'bg-red-400'
              }
            }
          }
        }
        pointer = pointer.add(1, 'hour')
      }
    },
    placeBooking() {
      this.$emit('place-booking', this.booking)
      this.validated = false
    }
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
