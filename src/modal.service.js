import { ref, markRaw,  readonly, computed } from 'vue'

const state = ref({
  component: null,
  isVisible: false,
})

const getters = {
  modalIsOpen: () => {
    return computed(() => state.value.isVisible)
  },
}

const actions = {
  openModal: (modal) => {
    state.value.component = markRaw(modal)
    state.value.isVisible = true
  },
  closeModal: () => {
    state.value.component = null
    state.value.isVisible = false
  }
}

export default () => ({
  state: readonly(state),
  ...getters,
  ...actions,
})
