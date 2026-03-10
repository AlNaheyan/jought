import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000',
})

let _getToken = null

export function setTokenGetter(fn) {
  _getToken = fn
}

api.interceptors.request.use(async (config) => {
  if (_getToken) {
    const token = await _getToken()
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Notes ─────────────────────────────────────────────────────────────────
export const getNotes = (params) => api.get('/api/notes', { params }).then((r) => r.data)
export const getNote = (id) => api.get(`/api/notes/${id}`).then((r) => r.data)
export const createNote = (data) => api.post('/api/notes', data).then((r) => r.data)
export const updateNote = (id, data) => api.put(`/api/notes/${id}`, data).then((r) => r.data)
export const deleteNote = (id) => api.delete(`/api/notes/${id}`)
export const getNoteVersions = (id) => api.get(`/api/notes/${id}/versions`).then((r) => r.data)
export const getNoteBacklinks = (id) => api.get(`/api/notes/${id}/backlinks`).then((r) => r.data)
export const getRelatedNotes = (id) => api.get(`/api/notes/${id}/related`).then((r) => r.data)

// ── AI ────────────────────────────────────────────────────────────────────
export const askNotes = (data) => api.post('/api/ai/ask', data).then((r) => r.data)
export const summarizeNote = (data) => api.post('/api/ai/summarize', data).then((r) => r.data)
export const expandText = (data) => api.post('/api/ai/expand', data).then((r) => r.data)
export const rewriteText = (data) => api.post('/api/ai/rewrite', data).then((r) => r.data)

// ── Graph ─────────────────────────────────────────────────────────────────
export const getGraph = () => api.get('/api/graph').then((r) => r.data)
export const getClusters = () => api.get('/api/graph/clusters').then((r) => r.data)

// ── Insights ──────────────────────────────────────────────────────────────
export const getSentiment = () => api.get('/api/insights/sentiment').then((r) => r.data)
export const getActivity = () => api.get('/api/insights/activity').then((r) => r.data)
export const getInsightsSummary = () => api.get('/api/insights/summary').then((r) => r.data)
export const generateInsightsSummary = () => api.post('/api/insights/summary').then((r) => r.data)
export const getInsightsStats = () => api.get('/api/insights/stats').then((r) => r.data)

// ── Notebooks ──────────────────────────────────────────────────────────────
export const getNotebooks = () => api.get('/api/notebooks').then((r) => r.data)
export const createNotebook = (data) => api.post('/api/notebooks', data).then((r) => r.data)
export const updateNotebook = (id, data) => api.put(`/api/notebooks/${id}`, data).then((r) => r.data)
export const deleteNotebook = (id) => api.delete(`/api/notebooks/${id}`)
