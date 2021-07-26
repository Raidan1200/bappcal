<template>
  <article
    @click="$emit('select-product', product)"
    class="rounded-xl p-4 hover:bg-gray-100"
  >
    <h2 class="text-2xl">{{ product.name }}</h2>
    <p>{{ product.slogan }}</p>
    <img
      :src="product.image"
      :alt="`${product.name} Foto`"
      class="h-64 rounded-xl"
    />
    <div
      class="py-4"
      v-html="product.description"
    />
  </article>
</template>

<script>
export default {
  name: 'BappProduct',
  props: {
    product: {
      type: Object,
      required: true
    }
  }

}
</script>
