import { createApp } from 'vue'

import axios from 'axios'
import './assets/tailwind.css'

// TODO: move this to an .env file
const API_KEY = '1|bjxWP6UsJPpoKbDBqp9n0jr2ehP3qZBmGY29LQBv'

axios.defaults.baseURL = 'http://localhost/api'
axios.defaults.headers.post['Accept'] = 'application/json'
axios.defaults.headers.common['Authorization'] = `Bearer ${API_KEY}`

import App from './App.vue'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import de from 'dayjs/locale/de'
import localeData from 'dayjs/plugin/localeData'
import timezone from 'dayjs/plugin/timezone'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Europe/Berlin")
dayjs.locale({...de, weekStart: 1})
dayjs.extend(localeData)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

createApp(App).mount('#app')
