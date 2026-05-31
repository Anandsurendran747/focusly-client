import axios from "axios";
import { useApp } from "./context/AppContext";
const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL, // Update with your server URL
  withCredentials: true
});

let sessionExpiredAlertShown = false;

const logout = async () => {
  try {
    localStorage.removeItem('focuslyUser');
    window.location.href = '/auth';
  }
  catch (error) {
    console.error("Logout error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Logout failed");
  }
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (!sessionExpiredAlertShown) {
        sessionExpiredAlertShown = true;
        alert("Session expired. Please log in again.");
      }
      logout();
    }
    return Promise.reject(error);
  }
);

// User API
export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Registration failed");
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', credentials);
    return response.data;
  } catch (error) {
    console.error("Login error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Login failed");
  }
};

// Todos API
export const fetchTodos = async () => {
  try {
    const response = await api.get('/todos');
    return response.data;
  }
  catch (error) {

    console.error("Fetch todos error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch todos");
  }
};

export const createTodo = async (todoData) => {
  try {
    const response = await api.post('/todos', todoData);
    return response.data;
  } catch (error) {
    console.error("Create todo error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to create todo");
  }
};

export const deleteTodo = async (id) => {
  try {
    await api.delete(`/todos/${id}`);
  } catch (error) {
    console.error("Delete todo error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to delete todo");
  }
};

export const toggleTodo = async (id, completed) => {
  try {
    const response = await api.put(`/todos/${id}`, { completed });
    return response.data;
  } catch (error) {
    console.error("Toggle todo error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to toggle todo");
  }
};

// Books API
export const fetchBooks = async () => {
  try {
    const response = await api.get('/books');
    return response.data;
  } catch (error) {
    console.error("Fetch books error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch books");
  }
};

export const createBook = async (bookData) => {
  try {
    const response = await api.post('/books', bookData);
    return response.data;
  } catch (error) {
    console.error("Create book error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to create book");
  }
};

export const deleteBook = async (id) => {
  try {
    await api.delete(`/books/${id}`);
  } catch (error) {
    console.error("Delete book error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to delete book");
  }
};

export const updateBook = async (id, bookData) => {
  try {
    const response = await api.put(`/books/${id}`, bookData);
    return response.data;
  }
  catch (error) {
    console.error("Update book error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to update book");
  }
};

// Lessons API
export const fetchLessons = async () => {
  try {
    const response = await api.get('/lessons');
    return response.data;
  }
  catch (error) {
    console.error("Fetch lessons error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch lessons");
  }
};

export const createLesson = async (lessonData) => {
  try {
    const response = await api.post('/lessons', lessonData);
    return response.data;
  } catch (error) {
    console.error("Create lesson error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to create lesson");
  }
};

export const deleteLesson = async (id) => {
  try {
    await api.delete(`/lessons/${id}`);
  } catch (error) {
    console.error("Delete lesson error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to delete lesson");
  }
};

export const updateLesson = async (id, lessonData) => {
  try {
    const response = await api.put(`/lessons/${id}`, lessonData);
    return response.data;
  } catch (error) {
    console.error("Update lesson error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to update lesson");
  }
};

// Schedule API
export const fetchSchedules = async () => {
  try {
    const response = await api.get('/schedules');
    return response.data;
  } catch (error) {
    console.error("Fetch schedules error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to fetch schedules");
  }
};

export const createSchedule = async (scheduleData) => {
  try {
    const response = await api.post('/schedules', scheduleData);
    return response.data;
  } catch (error) {
    console.error("Create schedule error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to create schedule");
  }
};

export const deleteSchedule = async (id) => {
  try {
    await api.delete(`/schedules/${id}`);
  } catch (error) {
    console.error("Delete schedule error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to delete schedule");
  }
};

export const updateSchedule = async (id, scheduleData) => {
  try {
    const response = await api.put(`/schedules/${id}`, scheduleData);
    return response.data;
  } catch (error) {
    console.error("Update schedule error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to update schedule");
  }
};

// FCM Token API
export const saveFcmToken = async (token) => {
  try {
    await api.post('/tokens/save-token', { token });
  } catch (error) {
    console.error("Save FCM token error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to save FCM token");
  }
};

export const sendNotification = async (userId, title, body) => {
  try {
    await api.post('/tokens/notify', { userId, title, body });
  } catch (error) {
    console.error("Send notification error:", error.response?.data || error.message);
    throw error.response?.data || new Error("Failed to send notification");
  }
};