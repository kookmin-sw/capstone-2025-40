// src/axiosInstance.js
import axios from "axios";
import settings from "./settings";

let isRefreshing = false;
let refreshSubscribers = [];

function onAccessTokenFetched(newAccessToken) {
	refreshSubscribers.forEach((callback) => callback(newAccessToken));
	refreshSubscribers = [];
}

const axiosInstance = axios.create({
	baseURL: settings.BASE_URL,
	withCredentials: false,
	headers: {
		"Content-Type": "application/json",
	},
});

// 요청 인터셉터 – access token 자동 포함
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("accessToken");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// 응답 인터셉터 – access token 만료 시 refresh
axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			localStorage.getItem("refreshToken") &&
			error.response?.data?.detail !== "No active account found with the given credentials"
		) {
			originalRequest._retry = true;

			if (isRefreshing) {
				return new Promise((resolve) => {
					refreshSubscribers.push((token) => {
						originalRequest.headers.Authorization = `Bearer ${token}`;
						resolve(axiosInstance(originalRequest));
					});
				});
			}

			isRefreshing = true;

			try {
				const res = await axios.post(`${settings.BASE_URL}/users/token/refresh/`, {
					refresh: localStorage.getItem("refreshToken"),
				});
				const newAccess = res.data.access;
				localStorage.setItem("accessToken", newAccess);
				onAccessTokenFetched(newAccess);
				isRefreshing = false;
				originalRequest.headers.Authorization = `Bearer ${newAccess}`;
				return axiosInstance(originalRequest);
			} catch (err) {
				isRefreshing = false;
				localStorage.clear();
				return Promise.reject(err);
			}
		}
		return Promise.reject(error);
	}
);

export default axiosInstance;
