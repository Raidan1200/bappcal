import { ref, readonly, computed } from 'vue'

const state = ref({
  bookings: [],
  error: null,
})

const getters = {
  getBookings: () => {
    return computed(() => state.value.bookings)
  },
  getError: () => {
    return computed(() => state.value.error)
  }
}

const actions = {
  hasBooking: (roomId) => {
    return !! state.value.bookings.find(booking => booking.roomId === roomId)
  },
  removeBooking: (roomId) => {
    state.value.bookings.splice(
      state.value.bookings.indexOf(booking => booking.room === roomId), 1
    )
  },
  addOrUpdateBooking: ({ roomId, productId, booking }) => {
    if (actions.hasBooking(roomId)) {
      actions.removeBooking(roomId)
    }
    state.value.bookings.push({ roomId, productId, booking })
  },
  setError: (message) => {
    state.value.error = message
  }
}

export default () => ({
  state: readonly(state),
  ...getters,
  ...actions,
})
