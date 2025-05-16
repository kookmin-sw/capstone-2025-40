import React, {useState, useEffect} from "react";
import {Box, Typography} from "@mui/material";
import styles from "./InstallPrompt.module.css"; // ✅ CSS 모듈 import
import GreendayIcon from "../../greenday_icon.png";

const InstallPrompt = ({onInstall}) => {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [isInstalled, setIsInstalled] = useState(false);
	const [isIOS, setIsIOS] = useState(false);

	useEffect(() => {
		// iOS 및 iPad 감지
		const userAgent = window.navigator.userAgent.toLowerCase();
		const isIOSDevice =
			/iphone|ipad|ipod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
		setIsIOS(isIOSDevice);

		// PWA 설치 여부 확인 (iPad 대응)
		const isPWAInstalled = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
		setIsInstalled(isPWAInstalled);

		// Android에서 설치 프롬프트 감지
		window.addEventListener("beforeinstallprompt", (event) => {
			event.preventDefault();
			setDeferredPrompt(event);
		});
	}, []);

	const installApp = () => {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			deferredPrompt.userChoice.then((choice) => {
				if (choice.outcome === "accepted") {
					console.log("PWA 설치 완료!");
					setIsInstalled(true);
					onInstall();
				}
			});
		}
	};

	return (
		<Box className={styles.container}>
			{/* GreenDay 아이콘 - 모든 환경에서 항상 표시 */}
			<img src={GreendayIcon} alt='GreendayIcon' className={styles.icon} />

			<Typography variant='h5' className={styles.responsiveText}>
				GreenDay를 설치해보세요!
			</Typography>

			{isInstalled ? (
				<Typography variant='h5' className={styles.responsiveText}>
					앱이 설치되었습니다!
				</Typography>
			) : isIOS ? (
				<>
					<Typography variant='h6' className={styles.responsiveText}>
						iOS 및 iPadOS에서는 직접 홈 화면에 추가해야 합니다.
					</Typography>
					<Box display='flex' alignItems='center' justifyContent='center' sx={{mt: 1}} width={400} maxWidth={400}>
						<img
							src={`${process.env.PUBLIC_URL}/img/share_icon.png`}
							alt='공유 버튼'
							style={{width: 20, height: 20, marginRight: 8}}
						/>
						<Typography variant='body1' className={styles.responsiveText}>
							버튼을 눌러 <strong>"홈 화면에 추가"</strong>를 선택하세요.
						</Typography>
					</Box>
				</>
			) : deferredPrompt ? (
				<button className={styles.installButton} onClick={installApp}>
					앱 설치하기
				</button>
			) : (
				<Typography variant='body1' className={styles.responsiveText}>
					이미 설치가 되었거나, 알맞지 않은 환경입니다.
				</Typography>
			)}
		</Box>
	);
};

export default InstallPrompt;
