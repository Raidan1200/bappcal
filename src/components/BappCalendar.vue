<template>
  <div>
    <h4>Calendar</h4>
    <div>Dates: {{ product.starts_at }} - {{ product.ends_at }}</div>
    <div v-if="bookings && calendar">
      <table>
        <thead>
          <tr class="bg-gray-200">
            <td>Day / Hour</td>
            <td v-for="(hour, idx) in calendar[0]" :key="idx">
              {{ hour.datetime.hour() }}
            </td>
          </tr>
        </thead>
        <tr v-for="(day, dIdx) in calendar" :key="dIdx">
          <td>{{ day[0].datetime.format('dd D.M.') }}</td>
          <td v-for="(hour, hIdx) in day" :key="hIdx">
            {{ hour.free }}
          </td>
        </tr>
      </table>

      <div>
        <button
          v-if="showButton('earlier')"
          @click="moveWeek('prev')"
        >Früher</button>
        <button
          v-if="showButton('later')"
          @click="moveWeek('next')"
        >Später</button>
      </div>

      <label for="starts_at">Von</label>
      <input v-model="booking.starts_at" type="number" name="starts_at" id="starts_at">
      <label for="ends_at">Bis</label>
      <input v-model="booking.ends_at" type="number" name="ends_at" id="ends_at">
      <label for="amount">Menge</label>
      <input v-model="booking.amount" type="number" name="amount" id="amount">
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
    product: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      calendar: null,
      offset: 0,
      bookings: null,
      booking: {
        starts_at: null,
        ends_at: null,
        amount: 0,
      }
    }
  },
  async mounted() {
    this.makeCalendar()
  },
  methods: {
    async makeCalendar() {
      this.calendar = await this.applyBookings(
        this.makeWeek(this.offset)
      )
    },
    async getBookings() {
      const from = dayjs().startOf('week').add(this.offset, 'weeks').format('YYYY-MM-DD')
      const to = dayjs().endOf('week').add(this.offset, 'weeks').format('YYYY-MM-DD')

      const bookings = await axios.get(`rooms/${this.room.id}/bookings?from=${from}&to=${to}`)
      return bookings.data
    },
    moveWeek(direction) {
      if (direction === 'prev') {
        this.offset--
      }
      if (direction === 'next') {
        this.offset++
      }
      this.makeCalendar()
    },
    showButton(direction) {
      if (direction === 'earlier') {
        return this.firstCalendarDay().isAfter(this.product.starts_at, 'day')
      }
      if (direction === 'later') {
        return this.lastCalendarDay().isBefore(this.product.ends_at, 'day')
      }
    },
    firstCalendarDay() {
      return this.calendar[0][0].datetime
    },
    lastCalendarDay() {
      return this.calendar[this.calendar.length - 1][0].datetime
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

      return week
    },
    async applyBookings(week) {
      this.bookings = await this.getBookings()

      this.bookings.forEach(booking => {
        let pointer = dayjs(booking.starts_at)
        while (pointer.isBefore(dayjs(booking.ends_at))) {
          week[pointer.day()][pointer.subtract(this.product.opens_at.substring(0, 2), 'hours').hour()].free -= booking.quantity
          pointer = pointer.add(1, 'hour')
        }
      })

      return week
    },
  }
}
</script>
