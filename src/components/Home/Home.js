import React, {useEffect, useState} from "react";
import {Box, Typography, Button, LinearProgress, List, ListItem, ListItemText, IconButton, Paper} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import styles from "./Home.module.css";

// 오늘의 챌린지 데이터셋 (예시)
const CHALLENGE_LIST = [
	{id: 1, text: "비닐봉투 대신 장바구니 사용하기", useCamera: true},
	{id: 2, text: "텀블러로 음료 구매 인증", useCamera: true},
	{id: 3, text: "사용하지 않는 콘센트 뽑기", useCamera: true},
	{id: 4, text: "플라스틱 분리수거 사진 찍기", useCamera: true},
	{id: 5, text: "길거리 쓰레기 1개 주우기", useCamera: true},
	{id: 6, text: "종이 영수증 대신 전자 영수증 받기", useCamera: false},
	{id: 7, text: "에코백 사용 인증하기", useCamera: true},
	{id: 8, text: "일회용 수저 대신 개인 수저 사용하기", useCamera: true},
	{id: 9, text: "재활용 마크 확인하고 분리배출하기", useCamera: false},
	{id: 10, text: "엘리베이터 대신 계단으로 이동하기", useCamera: false},
	{id: 11, text: "세탁물 모아서 한 번에 하기", useCamera: false},
	{id: 12, text: "유리용기에 음식 담아보기", useCamera: true},
	{id: 13, text: "화분에 물 주기", useCamera: true},
	{id: 14, text: "냅킨 대신 개인 손수건 사용하기", useCamera: true},
	{id: 15, text: "샤워 시간 1분 줄이기", useCamera: false},
	{id: 16, text: "페트병 라벨 제거 후 분리배출하기", useCamera: true},
	{id: 17, text: "채식 한 끼 실천하기", useCamera: true},
	{id: 18, text: "고체 비누 사용 인증", useCamera: true},
	{id: 19, text: "친환경 라벨 제품 구매하기", useCamera: true},
	{id: 20, text: "양치할 때 컵 사용하기", useCamera: false},
	{id: 21, text: "대중교통 이용하기", useCamera: true},
	{id: 22, text: "택배 상자 테이프 제거 후 배출하기", useCamera: true},
	{id: 23, text: "이메일 정리하여 서버 에너지 절약하기", useCamera: false},
	{id: 24, text: "음식물 쓰레기 줄이기 위해 적정량 덜어먹기", useCamera: false},
	{id: 25, text: "공유 자전거/킥보드 이용하기", useCamera: true},
	{id: 26, text: "실내 온도 1℃ 조절하기", useCamera: false},
	{id: 27, text: "햇빛에 빨래 말리기", useCamera: false},
];

const TIPS = [
	"종이류를 버릴 때 물기에 젖지 않도록 하고, 반듯하게 펴서 묶어 배출하면 재활용이 더 쉬워집니다.",
	"종이팩과 일반 종이류는 재활용 공정이 달라 따로 분리 배출해야 합니다.",
	"종이팩을 깨끗이 헹구고 말려 배출하면 화장지, 미용티슈 등으로 재활용할 수 있습니다.",
	"금속 캔은 내용물을 비우고 물로 헹군 후 배출하면 재활용 효율이 높아집니다.",
	"부탄가스나 살충제 용기는 가스를 완전히 제거한 후 배출해야 합니다.",
	"유리병은 색상과 관계없이 배출할 수 있지만, 깨지지 않도록 주의해야 합니다.",
	"소주, 맥주병은 빈용기보증금 환급 대상이므로 반납하면 보증금을 돌려받을 수 있습니다.",
	"페트병은 내용물을 비우고 라벨을 제거한 후 찌그러뜨려 배출하면 재활용이 용이합니다.",
	"비닐류는 이물질을 제거한 후 흩날리지 않도록 묶어서 배출해야 합니다.",
	"스티로폼 완충재는 내용물을 비우고 부착상표를 제거한 후 배출해야 합니다.",
	"택배 상자는 테이프를 제거하고 평평하게 접어 배출하면 재활용하기 좋습니다.",
	"음식물 쓰레기는 물기를 최대한 제거한 후 배출하면 처리 과정에서 에너지 절약 효과가 있습니다.",
	"폐건전지는 일반 쓰레기로 버리지 말고, 전용 수거함에 배출해야 환경 오염을 줄일 수 있습니다.",
	"깨진 유리는 신문지 등에 감싸 종량제 봉투에 배출해야 안전합니다.",
	"플라스틱 용기는 세척 후 라벨을 제거하여 분리배출하면 품질 높은 재활용이 가능합니다.",
	"일반 비닐과 랩 필름은 재질이 다를 수 있으니 분리하여 배출하는 것이 중요합니다.",
	"고철류(못, 철사, 캔 등)는 이물질이 섞이지 않도록 한 후 배출해야 합니다.",
	"의류 및 원단류는 폐의류 전용수거함에 배출하면 재사용될 가능성이 높아집니다.",
	"전자제품은 무상 방문 수거 서비스를 이용하면 보다 효율적으로 재활용할 수 있습니다.",
	"플라스틱 용기에 붙은 라벨과 뚜껑을 제거하면 재활용 공정을 더욱 원활하게 할 수 있습니다.",
	"우유팩과 종이팩을 따로 모아 배출하면 재활용률을 크게 높일 수 있습니다.",
	"유해 폐기물(폐형광등, 폐의약품 등)은 전용 수거함을 이용하여 배출해야 안전합니다.",
	"1회용 컵이나 빨대 대신 개인 컵과 다회용 빨대를 사용하면 플라스틱 쓰레기를 줄일 수 있습니다.",
	"알약 포장재(플라스틱+알루미늄)는 분리배출이 어렵기 때문에 일반 쓰레기로 버려야 합니다.",
	"깨끗한 종이컵은 종이류로 배출할 수 있지만, 오염된 종이컵은 종량제 봉투에 버려야 합니다.",
	"플라스틱 빨대, 수저, 포크 등은 재활용이 어렵기 때문에 가급적 사용을 줄이는 것이 좋습니다.",
	"음식물 쓰레기로 착각하기 쉬운 조개껍데기, 닭뼈, 과일 씨앗 등은 일반 쓰레기로 배출해야 합니다.",
];

const Home = () => {
	const [todayChallenges, setTodayChallenges] = useState([]);
	const [completed, setCompleted] = useState([]);
	const [tip, setTip] = useState("");

	useEffect(() => {
		// 랜덤 5개 챌린지 선택
		const shuffled = [...CHALLENGE_LIST].sort(() => 0.5 - Math.random());
		setTodayChallenges(shuffled.slice(0, 5));
		// 랜덤 Tip 선택
		const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];
		setTip(randomTip);
	}, []);

	const handleChallenge = (id, useCamera) => {
		if (useCamera) {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "image/*";
			input.capture = "environment";

			input.onchange = () => {
				if (input.files && input.files.length > 0) {
					setCompleted((prev) => [...prev, id]);
				}
			};

			input.onerror = () => {
				alert("사진을 불러오는 데 실패했습니다.");
			};

			if ("mediaDevices" in navigator && navigator.mediaDevices.getUserMedia) {
				input.click();
			} else {
				alert("카메라를 사용할 수 있는 기기로 인증해주세요.");
			}
		} else {
			setCompleted((prev) => [...prev, id]);
		}
	};

	const progress = (completed.length / todayChallenges.length) * 100;

	return (
		<Box className={styles.container}>
			<Typography variant='h6' className={styles.sectionTitle}>
				오늘의 챌린지 현황 🔥
			</Typography>
			<Box className={styles.progressBox}>
				<LinearProgress variant='determinate' value={progress} className={styles.progressBar} />
				<Typography className={styles.progressText}>{Math.round(progress)}%</Typography>
			</Box>

			<List className={styles.challengeList}>
				{todayChallenges.map((challenge) => (
					<Paper elevation={2} className={styles.challengeCard} key={challenge.id}>
						<ListItem className={styles.challengeItem}>
							<ListItemText primary={challenge.text} />
							{completed.includes(challenge.id) ? (
								<CheckCircleIcon color='success' />
							) : (
								<Button
									variant='outlined'
									className={styles.challengeButton}
									onClick={() => handleChallenge(challenge.id, challenge.useCamera)}>
									{challenge.useCamera ? <CameraAltIcon fontSize='small' /> : "도전"}
								</Button>
							)}
						</ListItem>
					</Paper>
				))}
			</List>

			<div className={styles.tipContainer}>
				<Typography variant='subtitle1' className={styles.tipTitle}>
					환경보호 Tip 🌱
				</Typography>
				<Typography className={styles.tipText}>{tip}</Typography>
			</div>
		</Box>
	);
};

export default Home;
