<template>
  <div class="m-6 px-6 pt-4 rounded-xl bg-white">
    <h1 class="text-4xl">Bapp-Cal</h1>

    <!-- Tab 1: Products -->
    <div class="flex flex-wrap" v-if="currentTab === 'products'">
      <div
        v-for="product in products"
        :key="product.id"
        class="mt-4 w-1/2 p-4"
      >
        <div>
          <h2 class="text-2xl">{{ product.name }}</h2>
          <div>
            <img class="max-h-48" :src="`${backend}/${ product.image }`" alt="">
          </div>
          <div>
            {{ product.description }}
          </div>

          <div class="p-2">
            <dl class="block">
              <dt class="inline">Price</dt>:
              <dd class="inline">{{ product.price / 100 }} €</dd>
            </dl>
            <dl class="block">
              <dt class="inline">Capacity</dt>:
              <dd class="inline">{{ product.capacity }}</dd>
            </dl>
            <dl>
              <dt class="inline">Deposit</dt>:
              <dd class="inline">{{ product.deposit }}</dd>
            </dl>
          </div>
        </div>
        <button
          @click="showCalendarFor(product)"
          class="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-900 text-white"
        >Check Availability</button>
      </div>
    </div>

    <!-- Tab 2: Calendar -->
    <div class="" v-if="currentTab === 'calendar'">
      <div class="font-semibold" @click="currentTab = 'products'">back to products</div>
      <h2 class="text-xl">Availability for {{ selectedProduct.name }}</h2>
      <table class="w-3/5">
        <tr>
          <td>-</td>
          <td class="text-center" v-for="hour in hours()" :key="hour">{{ hour }}</td>
        </tr>
        <tr v-for="(day, i) in calendar" :key="i">
          <td>{{ i }}</td>
          <td
            v-for="hour in day"
            :key="hour"
            class="text-center"
            :class="capacityClass(hour)"
          >
            <span>
              {{ hour.capacity }}
            </span>
          </td>
        </tr>
      </table>

      <form action="" method="post">
        <div>
          <label for="start-date">Date</label>
          <input v-model="booking.date" class="border" type="date" name="start-date" id="start-date">
        </div>
        <div>
          <label for="start-time">Start Time</label>
          <input v-model.number="booking.startTime" class="border" type="number" name="start-time" id="start-time">
          <label for="end-time">End Time</label>
          <input v-model.number="booking.endTime" class="border" type="number" name="end-time" id="end-time">
        </div>

        <button @click="showCustomerForm()" type="button">Continue</button>
      </form>

    </div>

    <!-- Tab 3: Customer Data -->
    <div class="flex flex-wrap" v-if="currentTab === 'customer'">
      <div class="font-semibold" @click="currentTab = 'calendar'">back to calendar</div>
      Customer Data

      <form action="#" method="POST">
        <div class="shadow overflow-hidden sm:rounded-md">
          <div class="px-4 py-5 bg-white sm:p-6">
            <div class="grid grid-cols-6 gap-6">
              <div class="col-span-6 sm:col-span-3">
                <label for="first-name" class="block text-sm font-medium text-gray-700">First name</label>
                <input v-model="customer.name" type="text" name="first-name" id="first-name" autocomplete="given-name" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div class="col-span-6 sm:col-span-3">
                <label for="last-name" class="block text-sm font-medium text-gray-700">Last name</label>
                <input type="text" name="last-name" id="last-name" autocomplete="family-name" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div class="col-span-6 sm:col-span-4">
                <label for="email-address" class="block text-sm font-medium text-gray-700">Email address</label>
                <input v-model="email" type="text" name="email-address" id="email-address" autocomplete="email" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div class="col-span-6 sm:col-span-3">
                <label for="country" class="block text-sm font-medium text-gray-700">Country / Region</label>
                <select id="country" name="country" autocomplete="country" class="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Mexico</option>
                </select>
              </div>

              <div class="col-span-6">
                <label for="street-address" class="block text-sm font-medium text-gray-700">Street address</label>
                <input type="text" name="street-address" id="street-address" autocomplete="street-address" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div class="col-span-6 sm:col-span-6 lg:col-span-2">
                <label for="city" class="block text-sm font-medium text-gray-700">City</label>
                <input type="text" name="city" id="city" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div class="col-span-6 sm:col-span-3 lg:col-span-2">
                <label for="state" class="block text-sm font-medium text-gray-700">State / Province</label>
                <input type="text" name="state" id="state" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>

              <div class="col-span-6 sm:col-span-3 lg:col-span-2">
                <label for="postal-code" class="block text-sm font-medium text-gray-700">ZIP / Postal</label>
                <input type="text" name="postal-code" id="postal-code" autocomplete="postal-code" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
              </div>
            </div>
          </div>
          <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button @click.prevent="submit()" type="button" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              Save
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>

  <hr>
  <h2>Products</h2>
  <pre>
    {{ selectedProduct }}
  </pre>
  <hr>
  <h2>Booking</h2>
  <pre>
    {{ booking }}
  </pre>
</template>

<script>
/* eslint-disable no-unused-vars */

import axios from 'axios'
import dayjs from 'dayjs'

export default {
  name: 'BappCal',
  props: {
    backend: {
      required: true
    }
  },
  data() {
    return {
      currentTab: 'products',
      products: [],

      selectedProduct: null,
      bookings: null,
      calendar: null,
      date: null,

      booking: {
        date: null,
        startTime: null,
        endTime: null,
      },

      customer: {}
    }
  },
  async mounted() {
    // TODO: This is kinda hacky, but I didn't want to require
    //       Vue Router just to make the Back button work
    history.pushState(null, null, location.href);
    window.onpopstate = function () {
      history.go(1);
    }

    const products = await axios.get('products')
    this.products = products.data
  },
  methods: {
    async showCalendarFor(product) {
      this.selectedProduct = product

      this.calendar = []

      // TODO: Error handling
      const bookings = await axios.get(`products/${product.id}/bookings`)
      this.bookings = bookings.data

      const startOfWeek = dayjs().startOf('week')
      const endOfWeek = dayjs().endOf('week')

      const calendar = []
      let pointer = dayjs(startOfWeek).hour(...this.selectedProduct.opens_at.split(':'))

      while (pointer.isBetween(startOfWeek, endOfWeek, 'day', '[]')) {
        const day = []

        const startOfDay = pointer.hour(...this.selectedProduct.opens_at.split(':'))
        const endOfDay = pointer.hour(...this.selectedProduct.closes_at.split(':'))

        while (pointer.isBetween(startOfDay, endOfDay, 'hour', '[)')) {
          let freeCapacity = this.selectedProduct.capacity

          this.bookings.forEach(booking => {
            if (pointer.isBetween(dayjs(booking.starts_at), dayjs(booking.ends_at), 'hour', '[)')) {
              freeCapacity -= booking.quantity
            }
          })

          day.push({
            capacity: freeCapacity,
            start_date: pointer
          })

          pointer = pointer.add(1, 'hour')
        }

        calendar.push(day)

        pointer = pointer.hour(...this.selectedProduct.opens_at.split(':'))
        pointer = pointer.add(1, 'day')
      }

      this.calendar = calendar

      this.currentTab = 'calendar'
    },
    showCustomerForm() {
      this.currentTab = 'customer'
    },
    weekdays() {
      return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    },
    hours() {
      let start = this.selectedProduct.opens_at.substring(0, 2)
      let end = this.selectedProduct.closes_at.substring(0, 2)
      const values = []

      while (start < end) {
        values.push(start++)
      }

      return values
    },
    capacityClass(hour) {
      const percent = 100 / this.selectedProduct.capacity * hour.capacity

      if (percent >= 50) {
        return 'bg-green-500'
      } else if (percent >= 25) {
        return 'bg-yellow-500'
      } else {
        return 'bg-red-500'
      }
    },
    async submit() {
      const bookings = await axios.post('bookings', {
        product: this.selectedProduct,
        customer: this.customer,
        dates: this.booking
      })
    }
  }
}
</script>
