import axios from 'axios'
import { authClient } from './auth'
import { useNavigate } from 'react-router-dom'

let navigate

export const setNavigate = (nav) => {
    navigate = nav
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

const api = axios.create({
    baseURL: backendUrl,
    withCredentials: true
})

api.interceptors.request.use(async (config) => {
    const { data: sessionData } = await authClient.getSession()
    if (sessionData?.session?.token) {
        config.headers.Authorization = `Bearer ${sessionData.session.token}`
    }
    
    // Better Auth uses x-organization-id for multi-tenancy plugins
    const organizationId = sessionData?.session?.activeOrganizationId || sessionData?.user?.organizationId
    if (organizationId) {
        config.headers['x-organization-id'] = organizationId
    }
    
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            authClient.signOut()
            if (navigate) {
                navigate('/login')
            }
        }
        return Promise.reject(error)
    }
)

const extractData = (response) => {
    const data = response.data
    if (data?.success && data?.data !== undefined) {
        return { data: data.data, success: true, message: data.message, pagination: data.pagination }
    }
    return data
}

const extractListData = (response) => {
    const data = response.data
    if (data?.data && data?.pagination) {
        return data
    }
    if (data?.success !== undefined) {
        return data
    }
    return data
}

const handleError = (error) => {
    const data = error.response?.data
    if (data?.message) {
        error.message = data.message
    }
    throw error
}

export const doctorsApi = {
    list: (params = {}) => api.get('/api/doctors', { params }).then(extractData),
    getById: (id) => api.get(`/api/doctors/${id}`).then(extractData)
}

export const patientsApi = {
    create: (data) => api.post('/api/patients', data).then(extractData),
    getById: (id) => api.get(`/api/patients/${id}`).then(extractData),
    update: (id, data) => api.put(`/api/patients/${id}`, data).then(extractData),
    getByUserId: (userId, organizationId) => api.get('/api/patients', { params: { userId, organizationId } }).then(extractData)
}

export const appointmentsApi = {
    list: (params = {}) => api.get('/api/appointments', { params }).then(extractData),
    create: (data) => api.post('/api/appointments', data).then(extractData),
    update: (id, data) => api.put(`/api/appointments/${id}`, data).then(extractData),
    cancel: (id) => api.put(`/api/appointments/${id}/cancel`).then(extractData),
    rate: (id, rating) => api.post(`/api/appointments/${id}/rate`, { rating }).then(extractData),
    submitPaymentProof: (id, data) => api.post(`/api/appointments/${id}/payment-proof`, data).then(extractData)
}

export const paymentsApi = {
    createIntent: (data) => api.post('/api/payments/create-intent', data).then(extractData),
    verify: (data) => api.post('/api/payments/verify', data).then(extractData),
    verifyPayment: (id, data) => api.post(`/api/appointments/${id}/verify-payment`, data).then(extractData)
}


export const ratingsApi = {
    create: (data) => api.post('/api/ratings', data).then(extractData),
    getDoctorReviews: (doctorId, params = {}) => api.get(`/api/ratings/doctor/${doctorId}`, { params }).then(extractData),
    getDoctorStats: (doctorId) => api.get(`/api/ratings/doctor/${doctorId}/stats`).then(extractData)
}

export const chatbotApi = {
    chat: (data) => {
        const formData = new FormData()
        formData.append('message', data.message)
        if (data.image) {
            formData.append('image', data.image)
        }
        return api.post('/api/chatbot/chat', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(extractData)
    }
}

export const uploadApi = {
    uploadImage: (file) => {
        const formData = new FormData()
        formData.append('image', file)
        return api.post('/api/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(extractData)
    }
}

export default api
