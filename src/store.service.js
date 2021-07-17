import { ref, readonly, computed } from 'vue'

const venue = {}

const state = ref({
  isLoading: false,
  data: null,
})

const getters = {
  isLoading: () => {
    return computed(() => state.value.isLoading)
  },
  getVenue: () => venue,
  getRooms: () => venue.rooms,
  getRoom: (id) => venue.rooms.find((room) => room.id === id),
  getProducts: (roomId) => venue.rooms.find((room) => room.id === roomId).products,
}

const actions = {
  loadVenue: async (loader) => {
    state.value.loading = true
    state.value.data = await loader()
    state.value.loading = false
  },
  setLoading: (state) => {
    state.value.loading = state
  }
}

export default () => ({
  state: readonly(state),
  ...getters,
  ...actions,
})
