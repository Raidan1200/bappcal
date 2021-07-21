<template>
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="first-name">Vorname</label>
      <input v-model="form.first_name" type="text" id="first-name">
    </div>
    <div>
      <label for="last-name">Nachname</label>
      <input v-model="form.last_name" type="text" id="last-name">
    </div>
    <div>
      <label for="show_curling">E-Mail</label>
      <input v-model="form.email" type="text" id="email">
    </div>
    <div>
      <label for="company">Firma</label>
      <input v-model="form.company" type="text" id="company">
    </div>
    <div>
      <label for="street">Straße</label>
      <input v-model="form.street" type="text" id="street">
    </div>
    <div>
      <label for="street-no">Hausnummer</label>
      <input v-model="form.street_no" type="text" id="street-no">
    </div>
    <div>
      <label for="zip">PLZ</label>
      <input v-model="form.zip" type="text" id="zip">
    </div>
    <div>
      <label for="city">Stadt</label>
      <input v-model="form.city" type="text" id="city">
    </div>
    <div>
      <label for="phone">Telefon</label>
      <input v-model="form.phone" type="text" id="phone">
    </div>

    <button type="submit">Jetzt buchen</button>
  </form>
</template>

<script>
export default {
  name: 'BappCustomerForm',
  data() {
    return {
      form: {
        first_name: '',
        last_name: '',
        email: '',
        company: '',
        street: '',
        street_no: '',
        zip: '',
        city: '',
        phone: ''
      },
      errors: {},
    }
  },
  methods: {
    handleSubmit() {
      this.$emit('set-customer', this.form)
    }
  }
}
</script>
