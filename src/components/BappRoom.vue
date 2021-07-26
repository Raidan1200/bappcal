<template>
  <article
    @click="$emit('select-room', room)"
    class="rounded-xl p-4 hover:bg-gray-100"
  >
    <h2 class="text-2xl">{{ room.name }}</h2>
    <p>{{ room.slogan }}</p>
    <img
      :src="room.image"
      :alt="`${room.name} Foto`"
      class="h-64 rounded-xl"
    />
    <div
      class="py-4"
      v-html="room.description"
    />
  </article>
</template>

<script>
export default {
  name: 'BappRoom',
  props: {
    room: {
      type: Object,
      required: true
    }
  }

}
</script>
