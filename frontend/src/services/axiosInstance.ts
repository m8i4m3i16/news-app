// import axios from 'axios'

// const getApiBaseUrl = () => {
//   return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
// }

// const instance = axios.create({
//   baseURL: getApiBaseUrl(),
//   withCredentials: true,
// })

// export default instance

import axios from 'axios'

const instance = axios.create({
  // baseURL: '/',
  withCredentials: true,
})

export default instance
