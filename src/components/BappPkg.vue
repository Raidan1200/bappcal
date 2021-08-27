<template>
  <article
    @click="$emit('select-pkg', pkg)"
    class="rounded-xl p-4 hover:bg-gray-100"
  >
    <h2 class="text-2xl">{{ pkg.name }}</h2>
    <p>{{ pkg.slogan }}</p>
    <img
      :src="pkg.image"
      :alt="`${pkg.name} Foto`"
      class="h-64 rounded-xl"
    />
    <div
      class="py-4"
      v-html="pkg.description"
    />
  </article>
</template>

<script>
export default {
  name: 'BappPkg',
  props: {
    pkg: {
      type: Object,
      required: true
    }
  }

}
</script>
