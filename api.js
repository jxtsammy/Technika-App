import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://headfirst-native-parish.ngrok-free.dev/api"; // NGROK URL

const api = axios.create({
    baseURL: BASE_URL,
});

// Automatically attach JWT token to every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
