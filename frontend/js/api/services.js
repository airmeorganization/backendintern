import { api } from './client.js';

export const ProfileService = {
    getProfile: () => api.get('/api/v1/profile'),
    updateProfile: (data) => api.post('/api/v1/profile', data)
};

export const InternshipService = {
    getInternships: (limit = 50, offset = 0) => api.get(`/api/v1/internships?limit=${limit}&offset=${offset}`),
    createInternship: (data) => api.post('/api/v1/internships', data)
};

export const ApplicationService = {
    getApplications: () => api.get('/api/v1/applications'),
    createApplication: (data) => api.post('/api/v1/applications', data)
};

export const RecommendationService = {
    getRecommendations: () => api.get('/api/v1/recommendations')
};
