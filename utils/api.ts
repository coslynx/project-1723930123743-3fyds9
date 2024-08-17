import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fittrack_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('fittrack_refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { token } = response.data;
        localStorage.setItem('fittrack_token', token);
        originalRequest.headers['Authorization'] = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('fittrack_token');
        localStorage.removeItem('fittrack_refresh_token');
        window.location.href = '/auth/signin';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const fetchGoals = async (userId) => {
  try {
    const response = await api.get(`/goals?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

export const createGoal = async (goalData) => {
  try {
    const response = await api.post('/goals', goalData);
    return response.data;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

export const updateGoal = async (goalId, goalData) => {
  try {
    const response = await api.put(`/goals/${goalId}`, goalData);
    return response.data;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

export const deleteGoal = async (goalId) => {
  try {
    await api.delete(`/goals/${goalId}`);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

export const fetchProgress = async (goalId) => {
  try {
    const response = await api.get(`/progress?goalId=${goalId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching progress:', error);
    throw error;
  }
};

export const addProgress = async (progressData) => {
  try {
    const response = await api.post('/progress', progressData);
    return response.data;
  } catch (error) {
    console.error('Error adding progress:', error);
    throw error;
  }
};

export const updateProgress = async (progressId, progressData) => {
  try {
    const response = await api.put(`/progress/${progressId}`, progressData);
    return response.data;
  } catch (error) {
    console.error('Error updating progress:', error);
    throw error;
  }
};

export const deleteProgress = async (progressId) => {
  try {
    await api.delete(`/progress/${progressId}`);
  } catch (error) {
    console.error('Error deleting progress:', error);
    throw error;
  }
};

export const fetchUserProfile = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await api.put(`/users/${userId}`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const fetchSocialFeed = async (page = 1, limit = 10) => {
  try {
    const response = await api.get(`/posts?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching social feed:', error);
    throw error;
  }
};

export const createPost = async (postData) => {
  try {
    const response = await api.post('/posts', postData);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const likePost = async (postId) => {
  try {
    const response = await api.post(`/posts/${postId}/like`);
    return response.data;
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const commentOnPost = async (postId, commentData) => {
  try {
    const response = await api.post(`/posts/${postId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error commenting on post:', error);
    throw error;
  }
};

export const fetchNotifications = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const sendFriendRequest = async (userId) => {
  try {
    const response = await api.post(`/friends/request/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error sending friend request:', error);
    throw error;
  }
};

export const acceptFriendRequest = async (requestId) => {
  try {
    const response = await api.put(`/friends/accept/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error accepting friend request:', error);
    throw error;
  }
};

export const rejectFriendRequest = async (requestId) => {
  try {
    const response = await api.put(`/friends/reject/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    throw error;
  }
};

export const fetchFriends = async () => {
  try {
    const response = await api.get('/friends');
    return response.data;
  } catch (error) {
    console.error('Error fetching friends:', error);
    throw error;
  }
};

export const removeFriend = async (friendId) => {
  try {
    await api.delete(`/friends/${friendId}`);
  } catch (error) {
    console.error('Error removing friend:', error);
    throw error;
  }
};

export const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const fetchLeaderboard = async (category, timeFrame) => {
  try {
    const response = await api.get(`/leaderboard?category=${category}&timeFrame=${timeFrame}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};

export const fetchWorkoutPlans = async () => {
  try {
    const response = await api.get('/workout-plans');
    return response.data;
  } catch (error) {
    console.error('Error fetching workout plans:', error);
    throw error;
  }
};

export const createWorkoutPlan = async (planData) => {
  try {
    const response = await api.post('/workout-plans', planData);
    return response.data;
  } catch (error) {
    console.error('Error creating workout plan:', error);
    throw error;
  }
};

export const updateWorkoutPlan = async (planId, planData) => {
  try {
    const response = await api.put(`/workout-plans/${planId}`, planData);
    return response.data;
  } catch (error) {
    console.error('Error updating workout plan:', error);
    throw error;
  }
};

export const deleteWorkoutPlan = async (planId) => {
  try {
    await api.delete(`/workout-plans/${planId}`);
  } catch (error) {
    console.error('Error deleting workout plan:', error);
    throw error;
  }
};

export const fetchNutritionLogs = async (startDate, endDate) => {
  try {
    const response = await api.get(`/nutrition-logs?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    throw error;
  }
};

export const addNutritionLog = async (logData) => {
  try {
    const response = await api.post('/nutrition-logs', logData);
    return response.data;
  } catch (error) {
    console.error('Error adding nutrition log:', error);
    throw error;
  }
};

export const updateNutritionLog = async (logId, logData) => {
  try {
    const response = await api.put(`/nutrition-logs/${logId}`, logData);
    return response.data;
  } catch (error) {
    console.error('Error updating nutrition log:', error);
    throw error;
  }
};

export const deleteNutritionLog = async (logId) => {
  try {
    await api.delete(`/nutrition-logs/${logId}`);
  } catch (error) {
    console.error('Error deleting nutrition log:', error);
    throw error;
  }
};

export const fetchChallenges = async () => {
  try {
    const response = await api.get('/challenges');
    return response.data;
  } catch (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }
};

export const joinChallenge = async (challengeId) => {
  try {
    const response = await api.post(`/challenges/${challengeId}/join`);
    return response.data;
  } catch (error) {
    console.error('Error joining challenge:', error);
    throw error;
  }
};

export const leaveChallenge = async (challengeId) => {
  try {
    await api.post(`/challenges/${challengeId}/leave`);
  } catch (error) {
    console.error('Error leaving challenge:', error);
    throw error;
  }
};

export const fetchChallengeProgress = async (challengeId) => {
  try {
    const response = await api.get(`/challenges/${challengeId}/progress`);
    return response.data;
  } catch (error) {
    console.error('Error fetching challenge progress:', error);
    throw error;
  }
};

export default api;