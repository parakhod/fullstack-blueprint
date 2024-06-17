import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4005/',
  headers:{
    "Content-Type": "application/json"
  },
  timeout: 5000,
})

const uploadFile = (url, file) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post('/transcribe-audio', formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }})
}

export { api, uploadFile, axios }