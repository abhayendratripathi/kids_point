import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('kp_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

API.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kp_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login:    d => API.post('/auth/login',    d),
  register: d => API.post('/auth/register', d),
  me:       () => API.get('/auth/me'),
};
export const kidsAPI = {
  getAll:    ()       => API.get('/kids'),
  get:       id       => API.get(`/kids/${id}`),
  create:    d        => API.post('/kids', d),
  update:    (id, d)  => API.put(`/kids/${id}`, d),
  delete:    id       => API.delete(`/kids/${id}`),
  addHealth: (id, d)  => API.post(`/kids/${id}/health`, d),
  getHealth: id       => API.get(`/kids/${id}/health`),
};
export const activitiesAPI = {
  getAll:  ()      => API.get('/activities'),
  create:  d       => API.post('/activities', d),
  update:  (id, d) => API.put(`/activities/${id}`, d),
  delete:  id      => API.delete(`/activities/${id}`),
};
export const historyAPI = {
  getAll:  p       => API.get('/history', { params: p }),
  assign:  d       => API.post('/history/assign', d),
  manual:  d       => API.post('/history/manual', d),
  delete:  id      => API.delete(`/history/${id}`),
};
export const profileAPI = {
  get:    () => API.get('/profile'),
  update: d  => API.put('/profile', d),
};
export default API;
