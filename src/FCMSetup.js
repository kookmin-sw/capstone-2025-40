import {useEffect} from "react";
import {messaging, getToken, onMessage} from "./firebase";
import settings from "./settings";

const FCMSetup = () => {
	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			"Notification" in window &&
			"serviceWorker" in navigator &&
			window.matchMedia("(display-mode: standalone)").matches
		) {
			Notification.requestPermission().then((permission) => {
				if (permission === "granted") {
					getToken(messaging, {
						vapidKey: settings.VAPID_KEY,
					})
						.then((currentToken) => {
							if (currentToken) {
								console.log("FCM 토큰:", currentToken);
								// TODO: 서버로 전송하거나 저장
							} else {
								console.log("토큰을 받을 수 없습니다.");
							}
						})
						.catch((err) => {
							console.log("토큰 가져오기 실패:", err);
						});
				}
			});

			// 포그라운드 수신 처리
			onMessage(messaging, (payload) => {
				console.log("Message received. ", payload);
				alert(payload.notification?.body);
			});
		} else {
			console.log("PWA로 설치되지 않았거나 알림을 지원하지 않는 환경입니다.");
		}
	}, []);

	return null;
};

export default FCMSetup;
