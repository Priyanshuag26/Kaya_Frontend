import axios from 'axios';

// Set the base URL for your API (Backend URL)
const API_BASE_URL = import.meta.env.VITE_API_URL; // Adjust if backend runs on a different port

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

    // Make the API request
    const response = await axiosInstance.post(url, data, { headers });

    // Log the full response to check its format
    console.log("API Raw Response:", response);

    // Check if the API response is correctly structured
    if (!response.data || typeof response.data !== "object") {
      throw new Error("Invalid API response format - Response is not an object");
    }

    return response.data;
  } catch (error) {
    console.error("API request failed:", error);

    let errorMessage = "An error occurred while making the request";
    if (error.response) {
      console.log("Error Response Data:", error.response.data);
      errorMessage = error.response.data?.detail || error.response.data?.message || errorMessage;
    } else if (error.request) {
      errorMessage = "No response from the server. Please check your connection.";
    }

    throw new Error(errorMessage);
  }
};

export default axiosInstance;
