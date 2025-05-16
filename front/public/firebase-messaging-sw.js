/* eslint-env serviceworker */
/* global firebase */
/* eslint no-restricted-globals: off */
// Service Worker에서 Firebase Messaging 처리
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js");

firebase.initializeApp({
	apiKey: "AIzaSyBCHv5qkSh7-MfEvt3HCkKzWWS4fcPhc3A",
	authDomain: "greenday-8d0a5.firebaseapp.com",
	projectId: "greenday-8d0a5",
	messagingSenderId: "835708905165",
	appId: "1:835708905165:web:87aaa77c7ac47e66726b84",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
	console.log("[firebase-messaging-sw.js] Received background message ", payload);

	self.registration.showNotification(payload.notification.title, {
		body: payload.notification.body,
		icon: "/web-app-manifest-192x192.png",
	});
});
