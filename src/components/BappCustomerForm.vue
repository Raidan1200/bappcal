<template>
  <form
    @submit.prevent="handleSubmit"
  >
    <div class="md:flex">
      <div class="md:w-1/2 mr-6">
        <div class="flex flex-col my-2">
          <label for="first-name">Vorname *</label>
          <div v-if="errors.first_name" class="text-red-600">
            {{ errors.first_name }}
          </div>
          <input v-model="form.first_name" type="text" id="first-name">
        </div>
        <div class="flex flex-col my-2">
          <label for="last-name">Nachname *</label>
          <div v-if="errors.last_name" class="text-red-600">
            {{ errors.last_name }}
          </div>
          <input v-model="form.last_name" type="text" id="last-name">
        </div>
        <div class="flex flex-col my-2">
          <label for="company">Firma</label>
          <input v-model="form.company" type="text" id="company">
        </div>
        <div class="flex flex-col my-2">
          <label for="show_curling">E-Mail *</label>
          <div v-if="errors.email" class="text-red-600">
            {{ errors.email }}
          </div>
          <input v-model="form.email" type="text" id="email">
        </div>
        <div class="flex flex-col my-2">
          <label for="phone">Telefon</label>
          <div v-if="errors.phone" class="text-red-600">
            {{ errors.phone }}
          </div>
          <input v-model="form.phone" type="text" id="phone">
        </div>
      </div>
      <div class="md:w-1/2 ml-6">
        <div v-if="errors.address" class="text-red-600">
          {{ errors.address }}
        </div>
        <div class="flex flex-col my-2">
          <label for="street">Straße *</label>
          <input v-model="form.street" type="text" id="street">
        </div>
        <div class="flex flex-col my-2">
          <label for="street-no">Hausnummer *</label>
          <input v-model="form.street_no" type="text" id="street-no">
        </div>
        <div class="flex flex-col my-2">
          <label for="zip">PLZ *</label>
          <input v-model="form.zip" type="text" id="zip">
        </div>
        <div class="flex flex-col my-2">
          <label for="city">Stadt *</label>
          <input v-model="form.city" type="text" id="city">
        </div>
      </div>
    </div>
    <div class="text-sm text-gray-700 float-right">Die mit * gekennzeichneten Felder sind Pflichtfelder.</div>
    <button
      type="submit"
      class="w-full my-6 py-2 rounded-xl bg-green-200 hover:bg-green-300"
    >
      Jetzt buchen
    </button>
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
        company: '',
        email: '',
        phone: '',
        street: '',
        street_no: '',
        zip: '',
        city: '',
      },
      errors: {},
      submitted: false,
    }
  },
  watch: {
    form: {
      deep: true,
      handler() {
        if (this.submitted) {
          this.validate()
        }
      }
    }
  },
  methods: {
    handleSubmit() {
      this.validate()

      if (Object.keys(this.errors).length === 0) {
        this.$emit('customer-completed', this.form)
      }

      this.submitted = true
    },
    validate() {
      this.errors = {}

      if (this.form.first_name === '') {
        this.errors.first_name = 'Geben Sie ihren Vornamen ein'
      }

      if (this.form.last_name === '') {
        this.errors.last_name = 'Geben Sie ihren Nachnamen ein'
      }

      if (this.form.email === '') {
        this.errors.email = 'Geben Sie ihren E-Mail-Adresse ein'
      }

      if (this.form.phone === '') {
        this.errors.phone = 'Geben Sie ihren Telefonnummer ein'
      }

      if (this.form.street === '' || this.form.street_no === '' || this.form.zip === '' || this.form.city === '') {
        this.errors.address = 'Geben Sie ihre vollständige Adresse ein. Alle vier Felder müssen ausgefüllt werden.'
      }
    }
  }
}
</script>
