import axios from 'axios';

// Set the base URL for your API (Backend URL)
const API_BASE_URL = 'http://127.0.0.1:8000'; // Adjust if backend runs on a different port

// Create an axios instance with default configurations
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to set Authorization token dynamically (if needed)
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers['Authorization'];
  }
};

// Function to handle POST requests
export const postAPI = async (url, data, token = null) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axiosInstance.post(url, data, { headers });

    // Ensure response has correct structure
    if (!response.data || !response.data.response) {
      throw new Error("Invalid API response format");
    }

    return response.data;
  } catch (error) {
    console.error("API request failed:", error);

    let errorMessage = "An error occurred while making the request";
    if (error.response) {
      errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
    } else if (error.request) {
      errorMessage = "No response from the server. Please check your connection.";
    }

    throw new Error(errorMessage);
  }
};
export default axiosInstance;
