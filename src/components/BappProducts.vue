<template>
  <div>
    <div v-for="product in products" :key="product.id">
      <h4 class="text-xl">Product: {{ product.name }}</h4>
      <button
        @click="toggleProduct(product)"
        :class="{ 'text-blue-500' : product === selectedProduct }"
      >Select</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'BappProducts',
  props: {
    products: {
      type: Array,
      required: true,
    }
  },
  data() {
    return {
      selectedProduct: null,
    }
  },
  methods: {
    toggleProduct(product) {
      if (product === this.selectedProduct) {
        this.selectedProduct = null
        this.$emit('select-product', null)
      } else {
        this.selectedProduct = product
        this.$emit('select-product', product)
      }
    }
  }
}
</script>
