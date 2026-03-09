import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export const repositoryAPI = {
    getInfo: () => api.get('/repository'),
};

export const contributorsAPI = {
    getAll: (limit = 50, offset = 0) => api.get(`/contributors?limit=${limit}&offset=${offset}`),
    getTop: (limit = 10) => api.get(`/contributors/top?limit=${limit}`),
};

export const commitsAPI = {
    getRecent: (limit = 50, offset = 0) => api.get(`/commits?limit=${limit}&offset=${offset}`),
};

export const pullRequestsAPI = {
    getAll: (state = 'all', limit = 50, offset = 0) =>
        api.get(`/pull-requests?state=${state}&limit=${limit}&offset=${offset}`),
};

export const issuesAPI = {
    getAll: (state = 'all', limit = 50, offset = 0) =>
        api.get(`/issues?state=${state}&limit=${limit}&offset=${offset}`),
};

export const analyticsAPI = {
    getOverview: () => api.get('/analytics/overview'),
    getCommitActivity: (days = 30) => api.get(`/analytics/commit-activity?days=${days}`),
    getPRStats: () => api.get('/analytics/pr-stats'),
    getIssueStats: () => api.get('/analytics/issue-stats'),
};

export default api;
