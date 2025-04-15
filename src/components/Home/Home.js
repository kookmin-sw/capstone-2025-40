import React, {useEffect, useState} from "react";
import {
	Box,
	Typography,
	Button,
	LinearProgress,
	List,
	ListItem,
	ListItemText,
	IconButton,
	Paper,
	CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import styles from "./Home.module.css";
import axiosInstance from "../../axiosInstance";
import uploadImage from "../../uploadImage";
import {useNavigate} from "react-router-dom";

const Home = () => {
	const navigate = useNavigate();
	const [todayChallenges, setTodayChallenges] = useState([]);
	const [completed, setCompleted] = useState([]);
	const [tip, setTip] = useState("");
	const [progress, setProgress] = useState(0);
	const [loadingChallengeId, setLoadingChallengeId] = useState(null);
	const [challengeLoading, setChallengeLoading] = useState(true);

	useEffect(() => {
		const fetchAllData = async () => {
			try {
				setChallengeLoading(true);
				const challengePromise = axiosInstance.get("/users/my-quests/today/");
				const [tipRes, progressRes] = await Promise.all([
					axiosInstance.get("/users/tips/random/"),
					axiosInstance.get("/users/my-quests/today/summary/"),
				]);

				const challengesRes = await challengePromise;

				const challengeData = challengesRes.data;
				setTodayChallenges(challengeData);
				const completedIds = challengeData.filter((c) => c.is_completed).map((c) => c.id);
				setCompleted(completedIds);

				setTip(tipRes.data.tip);

				const {completed, total} = progressRes.data;
				setProgress(total > 0 ? (completed / total) * 100 : 0);
			} catch (err) {
				console.error("데이터를 불러오지 못했습니다.", err);
			} finally {
				setChallengeLoading(false);
			}
		};

		fetchAllData();
	}, []);

	const handleChallenge = async (id, useCamera) => {
		setLoadingChallengeId(id);
		const completeQuest = async (photoUrl = null) => {
			try {
				const payload = photoUrl ? {photo_url: photoUrl} : {};
				await axiosInstance.post(`/users/my-quests/${id}/complete/`, payload);
				setCompleted((prev) => [...prev, id]);
				setProgress((prevProgress) => {
					const newCompletedCount = completed.length + 1;
					const totalCount = todayChallenges.length;
					return totalCount > 0 ? (newCompletedCount / totalCount) * 100 : 0;
				});
			} catch (err) {
				alert("퀘스트 인증에 실패했습니다.");
				console.error(err);
			} finally {
				setLoadingChallengeId(null);
			}
		};

		if (useCamera) {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "image/*";
			input.capture = "environment";

			input.onchange = async () => {
				if (input.files && input.files.length > 0) {
					try {
						const file = input.files[0];
						const photoUrl = await uploadImage(file); // Firebase 업로드
						await completeQuest(photoUrl); // 서버에 photo_url 전달
					} catch (err) {
						alert("이미지 업로드에 실패했습니다.");
						console.error(err);
					} finally {
						setLoadingChallengeId(null);
					}
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
			await completeQuest();
		}
	};

	return (
		<Box className={styles.container}>
			<Typography variant='h6' className={styles.sectionTitle}>
				오늘의 챌린지 현황 🔥
			</Typography>
			<Box className={styles.progressBox}>
				<LinearProgress variant='determinate' value={progress} className={styles.progressBar} />
				<Typography className={styles.progressText}>{Math.round(progress)}%</Typography>
			</Box>

			{challengeLoading ? (
				<Box display='flex' justifyContent='center'>
					<CircularProgress color='success' />
				</Box>
			) : (
				<List className={styles.challengeList}>
					{todayChallenges.map((challenge) => (
						<Paper elevation={2} className={styles.challengeCard} key={challenge.id}>
							<ListItem className={styles.challengeItem}>
								<ListItemText primary={challenge.quest_title} />
								{completed.includes(challenge.id) ? (
									<CheckCircleIcon color='success' />
								) : loadingChallengeId === challenge.id ? (
									<CircularProgress size={24} color='success' />
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
			)}

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
