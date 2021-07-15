import { createApp } from 'vue'
import App from './App.vue'
import './assets/tailwind.css'
import axios from 'axios'

// TODO: move this to an .env file
const API_KEY = 'Guw1d5estrzJUm0Y2Q8l67NjlIQ9fjqKKn7AGqsk'
// const API_KEY = 'JGamVnWbwBRFKeELp8gHVEdgp7OmP65yhoFVDFRo'

axios.defaults.baseURL = 'http://localhost/api'
axios.defaults.headers.post['Accept'] = 'application/json'
axios.defaults.headers.common['Authorization'] = `Bearer ${API_KEY}`

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import de from 'dayjs/locale/de'
import localeData from 'dayjs/plugin/localeData'
import timezone from 'dayjs/plugin/timezone'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault("Europe/Berlin")
dayjs.locale({...de, weekStart: 1})
dayjs.extend(localeData)
dayjs.extend(isBetween)

createApp(App).mount('#app')
