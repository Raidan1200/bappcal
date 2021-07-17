<template>
  <div>
    <h4>Calendar</h4>

    <div v-if="bookings">
      {{ bookings[0].starts_at }}
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
    }
  },
  data() {
    return {
      calendar: null,
      bookings: null,
    }
  },
  async mounted() {
    const bookings = await axios.get(`rooms/${this.room.id}/bookings`)
    this.bookings = bookings.data
  },
  methods: {
    buildCalendar() {
      this.calendar = []
    },
    weekArray() {
      const startOfWeek = dayjs().startOf('week')
      const endOfWeek = dayjs().endOf('week')

      return startOfWeek - endOfWeek
    },
    hourArray() {

    }
  }
}
</script>
