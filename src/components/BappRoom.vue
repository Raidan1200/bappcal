<template>
  <div>
    <h2 class="text-2xl">{{ room.name }}</h2>
    <div v-if="isSelected">
      <button @click="deselectRoom">Back</button>
      <BappProducts
        :products="room.products"
        @selectProduct="selectedProduct = $event"
        @deselectProducts="selectedProduct = null"
      />

      <div v-if="selectedProduct">
        <BappCalendar :room="room" :product="selectedProduct" />
      </div>

      <div v-if="room.id === 1">
        <div>
          <label for="show_curling">Curlingbahn zubuchen</label>
          <input v-model="showCurling" type="checkbox" id="show_curling">
        </div>

        <!-- TODO: This is ugly. Make this an option in the config of the Room?  -->
        <div v-if="showCurling">
          <h3 class="text-2xl">Curlingbahn</h3>
          <BappCalendar :room="curling" />
        </div>
      </div>
    </div>
    <div v-else>
      <button @click="selectRoom">Select</button>
    </div>
  </div>
</template>

<script>

import BappProducts from './BappProducts'
import BappCalendar from './BappCalendar'

export default {
  name: 'BappRoom',
  components: {
    BappProducts,
    BappCalendar,
  },
  props: {
    room: {
      type: Object,
      required: true,
    },
    curling: {
      type: Object,
      default: () => {},
    }
  },
  emits: ['select-room'],
  data() {
    return {
      isSelected: false,
      selectedProduct: null,
      showCurling: false,
    }
  },
  methods: {
    selectRoom() {
      this.$emit('select-room', this.room.id)
      this.isSelected = true
    },
    deselectRoom() {
      this.$emit('select-room', null)
      this.isSelected = false
    },
  }
}
</script>
