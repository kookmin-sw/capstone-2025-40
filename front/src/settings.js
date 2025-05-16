const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";

const settings = {
	BASE_URL: "https://green-day-api.duckdns.org/api",
	TIMEOUT: 5000,
	PAGINATION_LIMIT: 10,
	FIREBASE_CONFIG: {
		apiKey: "AIzaSyBCHv5qkSh7-MfEvt3HCkKzWWS4fcPhc3A",
		authDomain: "greenday-8d0a5.firebaseapp.com",
		projectId: "greenday-8d0a5",
		storageBucket: "greenday-8d0a5.firebasestorage.app",
		messagingSenderId: "835708905165",
		appId: "1:835708905165:web:87aaa77c7ac47e66726b84",
		measurementId: "G-KPJ7JCN2SW",
	},
	VAPID_KEY: "BJXp3popi3oh0o3jMZADZyWjzDb9ycCl-GLpZ1MFfU4Ril-Q6CZ97_3-m4x5LViIKBWPUwOOPZhmlfSMyZKLKYA",
};

export default settings;
