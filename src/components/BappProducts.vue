<template>
  <div>
    <div v-for="product in products" :key="product.id">
      <h4 class="text-xl">{{ product.name }}</h4>
      <button @click="selectProduct(product)">Select</button>
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
    selectProduct(product) {
      if (this.selectedProduct === product) {
        this.selectedProduct = null
      } else {
        this.selectedProduct = product
        this.$emit('select-product', product)
      }
    },
    deselectProducts() {
      this.$emit('select-product', null)
      this.selectedProduct = null
    }
  }
}
</script>

<style>

</style>