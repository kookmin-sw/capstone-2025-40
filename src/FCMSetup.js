import React, {useEffect, useState} from "react";
import {messaging, getToken, onMessage} from "./firebase";
import settings from "./settings";
import Snackbar from "@mui/material/Snackbar";

const FCMSetup = () => {
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMsg, setSnackbarMsg] = useState("");

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
					}).then((currentToken) => {
						if (currentToken) {
							console.log("FCM 토큰:", currentToken);
							// 서버로 전송하는 API 호출
						}
					});
				}
			});

			// 앱 실행 중 (포그라운드 수신 시)
			onMessage(messaging, (payload) => {
				console.log("포그라운드 메시지 수신:", payload);
				setSnackbarMsg(payload.notification?.body || "알림이 도착했습니다.");
				setSnackbarOpen(true);
			});
		}
	}, []);

	return (
		<Snackbar
			open={snackbarOpen}
			autoHideDuration={3000}
			onClose={() => setSnackbarOpen(false)}
			message={snackbarMsg}
			anchorOrigin={{vertical: "top", horizontal: "center"}}
		/>
	);
};

export default FCMSetup;
