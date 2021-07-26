import { ref, readonly, computed } from 'vue'

// TODO IMPORTANT: This actually is a shopping cart!

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
    return !! state.value.bookings.find(booking => {
      return booking.roomId === roomId
    })
  },
  removeBooking: (roomId) => {
    const index = state.value.bookings.findIndex(booking => {
      return booking.roomId === roomId
    })
    state.value.bookings.splice(index, 1)
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
