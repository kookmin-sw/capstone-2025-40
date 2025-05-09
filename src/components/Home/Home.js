import React, {useEffect, useState} from "react";
import trash1 from "../../assets/certification/trash1.png";
import trash2 from "../../assets/certification/trash2.png";
import ecoback1 from "../../assets/certification/ecoback1.png";
import ecoback2 from "../../assets/certification/ecoback2.png";
import challengeImg from "../../assets/certification/challenge.png";
import Avatar from "@mui/material/Avatar";
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
	Dialog,
	DialogTitle,
	DialogContent,
	TextField,
	DialogActions,
	FormControlLabel,
	Checkbox,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import CloseIcon from "@mui/icons-material/Close";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import styles from "./Home.module.css";
import axiosInstance from "../../axiosInstance";
import uploadImage from "../../uploadImage";
import {useNavigate} from "react-router-dom";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import ko from "date-fns/locale/ko";
import {MobileDatePicker} from "@mui/x-date-pickers/MobileDatePicker";

const CHALLENGE_LIST = [
	{id: 1, text: "일회용품 사용하지 않기", useCamera: false},
	{id: 2, text: "대중교통 타고 다니기", useCamera: false},
	{id: 3, text: "쓰레기 줍기", useCamera: true},
	{id: 4, text: "에코백 사용하기", useCamera: true},
	{id: 5, text: "분리수거 잘 하기", useCamera: false},
	{id: 6, text: "개인챌린지 모두 달성하기", useCamera: true},
];

const Home = () => {
	const navigate = useNavigate();
	const [todayChallenges, setTodayChallenges] = useState([]);
	const [customChallenges, setCustomChallenges] = useState([]);
	const [completed, setCompleted] = useState([]);
	const [tip, setTip] = useState("");
	const [todayProgress, setTodayProgress] = useState(0);
	const [customProgress, setCustomProgress] = useState(0);
	const [loadingChallengeId, setLoadingChallengeId] = useState(null);
	const [challengeLoading, setChallengeLoading] = useState(true);
	const [isTodayChallengeOpen, setIsTodayChallengeOpen] = useState(true);
	const [isCustomChallengeOpen, setIsCustomChallengeOpen] = useState(true);
	const [isCustomChallengeDeleted, setIsCustomChallengeDeleted] = useState(false);

	const [anchorEl, setAnchorEl] = useState(null);
	const [showCustomEditDialog, setShowCustomEditDialog] = useState(false);
	const open = Boolean(anchorEl);
	const [participantAnchorEl, setParticipantAnchorEl] = useState(null);
	const participantOpen = Boolean(participantAnchorEl);

	const [badgeImage, setBadgeImage] = useState(null);

	const [openDetailModal, setOpenDetailModal] = useState(false);
	const [selectedChallenge, setSelectedChallenge] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const handleOpenDetailModal = (challenge) => {
		setSelectedChallenge(challenge);
		setOpenDetailModal(true);
	};

	const challengeDetails = {
		"일회용품 사용하지 않기": ["박상엄", "성창민", "정하람", "채주원"],
		"대중교통 타고 다니기": ["박상엄", "성창민", "정하람"],
		"쓰레기 줍기": [
			{name: "성창민", image: trash1},
			{name: "채주원", image: trash2},
		],
		"에코백 사용하기": [
			{name: "박상엄", image: ecoback1},
			{name: "정하람", image: ecoback2},
		],
		"분리수거 잘 하기": ["박상엄", "성창민", "정하람", "채주원"],
		"개인챌린지 모두 달성하기": [
			{name: "박상엄", image: challengeImg},
			{name: "성창민", image: challengeImg},
			{name: "정하람", image: challengeImg},
			{name: "채주원", image: challengeImg},
		],
	};

	const [editStartDate, setEditStartDate] = useState(() => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow;
	});
	const [editEndDate, setEditEndDate] = useState(() => {
		const end = new Date();
		end.setDate(end.getDate() + 2);
		return end;
	});

	const handleMenuClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleCloseMenu = () => {
		setAnchorEl(null);
	};

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
				setTodayProgress(total > 0 ? (completed / total) * 100 : 0);

				setCustomChallenges(CHALLENGE_LIST.slice(0, 6));

				const fixedCompleted = {
					"일회용품 사용하지 않기": ["박상엄", "성창민", "정하람", "채주원"],
					"대중교통 타고 다니기": ["박상엄", "성창민", "정하람"],
					"쓰레기 줍기": ["성창민", "채주원"],
					"에코백 사용하기": ["박상엄", "정하람"],
					"분리수거 잘 하기": ["박상엄", "성창민", "정하람", "채주원"],
					"개인챌린지 모두 달성하기": ["박상엄", "성창민", "정하람", "채주원"],
				};
				const username = "채주원";
				const completedCount = CHALLENGE_LIST.filter((item) => fixedCompleted[item.text]?.includes(username)).length;
				const totalCount = CHALLENGE_LIST.length;
				setCustomProgress(totalCount > 0 ? (completedCount / totalCount) * 100 : 0);
			} catch (err) {
				console.error("데이터를 불러오지 못했습니다.", err);
			} finally {
				setChallengeLoading(false);
			}
		};

		fetchAllData();
	}, []);

	const handleChallenge = async (id, useCamera, isCustomChallenge = false) => {
		setLoadingChallengeId(id);
		const completeQuest = async (photoUrl = null) => {
			try {
				const payload = photoUrl ? {photo_url: photoUrl} : {};
				await axiosInstance.post(`/users/my-quests/${id}/complete/`, payload);
				setCompleted((prev) => [...prev, id]);
				if (isCustomChallenge) {
					const newCompletedCount = completed.filter((id) => customChallenges.some((c) => c.id === id)).length + 1;
					const totalCount = customChallenges.length;
					setCustomProgress(totalCount > 0 ? (newCompletedCount / totalCount) * 100 : 0);
				} else {
					const newCompletedCount = completed.filter((id) => todayChallenges.some((c) => c.id === id)).length + 1;
					const totalCount = todayChallenges.length;
					setTodayProgress(totalCount > 0 ? (newCompletedCount / totalCount) * 100 : 0);
				}
			} catch (err) {
				alert("퀘스트 인증에 실패했습니다.");
				console.error(err);
			} finally {
				setLoadingChallengeId(null);
			}
		};

		if (isCustomChallenge) {
			setCompleted((prev) => [...prev, id]);
			if (isCustomChallenge) {
				const newCompletedCount = completed.filter((id) => customChallenges.some((c) => c.id === id)).length + 1;
				const totalCount = customChallenges.length;
				setCustomProgress(totalCount > 0 ? (newCompletedCount / totalCount) * 100 : 0);
			} else {
				const newCompletedCount = completed.filter((id) => todayChallenges.some((c) => c.id === id)).length + 1;
				const totalCount = todayChallenges.length;
				setTodayProgress(totalCount > 0 ? (newCompletedCount / totalCount) * 100 : 0);
			}
			setLoadingChallengeId(null);
			return;
		}

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
				} else {
					setLoadingChallengeId(null);
				}
			};
			input.oncancel = () => {
				setLoadingChallengeId(null);
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
			<Box className={styles.titleBox}>
				<IconButton onClick={() => setIsTodayChallengeOpen((prev) => !prev)}>
					{isTodayChallengeOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
				</IconButton>
				<Typography variant='h6' className={styles.sectionTitle}>
					오늘의 챌린지 현황 🔥
				</Typography>
				<Box style={{width: 40}} /> {/* Placeholder for symmetry */}
			</Box>
			<Box className={styles.progressBox}>
				<LinearProgress variant='determinate' value={todayProgress} className={styles.progressBar} />
				<Typography className={styles.progressText}>
					{Number.isInteger(todayProgress) ? todayProgress : todayProgress.toFixed(1)}%
				</Typography>
			</Box>

			{isTodayChallengeOpen &&
				(challengeLoading ? (
					<Box display='flex' justifyContent='center' alignItems='center'>
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
				))}

			{!isCustomChallengeDeleted && (
				<>
					<Box className={styles.titleBox}>
						<IconButton onClick={() => setIsCustomChallengeOpen((prev) => !prev)}>
							{isCustomChallengeOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
						</IconButton>
						<Typography variant='h6' className={styles.sectionTitle}>
							캡스톤 팀 40 커스텀 챌린지 🍀
						</Typography>
						<IconButton onClick={handleMenuClick}>
							<MoreVertIcon />
						</IconButton>
						<Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
							<MenuItem
								onClick={() => {
									handleCloseMenu();
									setShowCustomEditDialog(true);
								}}>
								챌린지 수정
							</MenuItem>
							<MenuItem
								onClick={() => {
									handleCloseMenu();
									const confirmed = window.confirm("챌린지를 삭제하시겠습니까?");
									if (confirmed) {
										setCustomChallenges([]);
										setCustomProgress(0);
										setIsCustomChallengeDeleted(true);
										setCompleted((prev) => prev.filter((id) => !customChallenges.some((c) => c.id === id)));
									}
								}}>
								챌린지 삭제
							</MenuItem>
							<MenuItem
								onClick={() => {
									handleCloseMenu();
									const input = document.createElement("input");
									input.type = "file";
									input.accept = "image/*";
									input.onchange = (e) => {
										const file = e.target.files[0];
										if (file) {
											const reader = new FileReader();
											reader.onload = () => {
												setBadgeImage(reader.result);
											};
											reader.readAsDataURL(file);
										}
									};
									input.click();
								}}>
								뱃지 등록
							</MenuItem>
						</Menu>
					</Box>

					<Box display='flex' justifyContent='center' alignItems='center' gap={3} mb={1}>
						<Box display='flex' alignItems='center' gap={0.5}>
							<CalendarMonthIcon sx={{color: "#4caf50", fontSize: "18px"}} />
							<Typography sx={{color: "#4caf50", fontSize: "14px"}}>2025-05-08 ~ 2025-05-30</Typography>
						</Box>
						<Box
							display='flex'
							alignItems='center'
							gap={0.5}
							onClick={(e) => setParticipantAnchorEl(e.currentTarget)}
							sx={{cursor: "pointer"}}>
							<GroupsIcon sx={{color: "#4caf50", fontSize: "18px"}} />
							<Typography sx={{color: "#4caf50", fontSize: "14px"}}>4</Typography>
						</Box>
					</Box>
					<Menu
						anchorEl={participantAnchorEl}
						open={participantOpen}
						onClose={() => setParticipantAnchorEl(null)}
						anchorOrigin={{vertical: "bottom", horizontal: "center"}}
						transformOrigin={{vertical: "top", horizontal: "center"}}>
						{["성창민 (방장)", "박상엄", "정하람", "채주원 (나)"].map((name) => (
							<MenuItem key={name} sx={{fontSize: "14px", color: "#555"}}>
								{name}
							</MenuItem>
						))}
					</Menu>
					{badgeImage && (
						<Box display='flex' alignItems='center' justifyContent='center' gap={1} mt={1}>
							<Typography sx={{color: "#4caf50", fontSize: "14px"}}>달성 뱃지:</Typography>
							<Avatar src={badgeImage} sx={{width: 30, height: 30}} />
						</Box>
					)}
					<Box className={styles.progressBox}>
						<LinearProgress variant='determinate' value={customProgress} className={styles.progressBar} />
						<Typography className={styles.progressText}>
							{Number.isInteger(customProgress) ? customProgress : customProgress.toFixed(1)}%
						</Typography>
					</Box>

					{isCustomChallengeOpen &&
						(challengeLoading ? (
							<Box display='flex' justifyContent='center' alignItems='center'>
								<CircularProgress color='success' />
							</Box>
						) : (
							<List className={styles.challengeList}>
								{customChallenges.map((challenge) => (
									<Paper elevation={2} className={styles.challengeCard} key={challenge.id}>
										<ListItem
											className={styles.challengeItem}
											onClick={() => handleOpenDetailModal(challenge)}
											sx={{cursor: "pointer"}}>
											<ListItemText primary={challenge.text} />
											{completed.includes(challenge.id) ? (
												<CheckCircleIcon color='success' />
											) : loadingChallengeId === challenge.id ? (
												<CircularProgress size={24} color='success' />
											) : (
												<Button
													variant='outlined'
													className={styles.challengeButton}
													onClick={(e) => {
														e.stopPropagation();
														handleChallenge(challenge.id, challenge.useCamera, true);
													}}>
													{challenge.useCamera ? <CameraAltIcon fontSize='small' /> : "도전"}
												</Button>
											)}
										</ListItem>
									</Paper>
								))}
							</List>
						))}
				</>
			)}

			<div className={styles.tipContainer}>
				<Typography variant='subtitle1' className={styles.tipTitle}>
					환경보호 Tip 🌱
				</Typography>
				<Typography className={styles.tipText}>{tip}</Typography>
			</div>

			<Dialog open={showCustomEditDialog} onClose={() => setShowCustomEditDialog(false)} fullWidth>
				<DialogTitle sx={{color: "#2e7d32", fontWeight: "bold"}}>챌린지 수정</DialogTitle>
				<DialogContent dividers>
					<TextField
						variant='standard'
						color='success'
						fullWidth
						label='챌린지 제목'
						value={"캡스톤 팀 40 커스텀 챌린지 🍀"}
						margin='dense'
					/>
					<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
						<Typography mt={2} variant='subtitle1'>
							챌린지 기간
						</Typography>
						<Box display='flex' alignItems='center' gap={1} mt={2}>
							<MobileDatePicker
								value={new Date("2025-05-08")}
								format='yyyy-MM-dd'
								closeOnSelect
								slotProps={{
									toolbar: {hidden: true},
									actionBar: {actions: []},
									textField: {
										color: "success",
										fullWidth: true,
										variant: "outlined",
										label: "챌린지 시작 날짜",
										sx: {backgroundColor: "white"},
										disabled: true,
									},
								}}
							/>
							<Typography>~</Typography>
							<MobileDatePicker
								value={new Date("2025-05-30")}
								onChange={(newValue) => {
									if (newValue) {
										setEditEndDate(newValue);
									}
								}}
								format='yyyy-MM-dd'
								closeOnSelect
								minDate={editStartDate}
								slotProps={{
									toolbar: {hidden: true},
									actionBar: {actions: []},
									textField: {
										color: "success",
										fullWidth: true,
										variant: "outlined",
										label: "챌린지 종료 날짜",
										sx: {backgroundColor: "white"},
									},
								}}
							/>
						</Box>
					</LocalizationProvider>
					<Box mt={2}>
						<Typography variant='subtitle1'>챌린지 항목</Typography>
						{customChallenges.slice(0, 6).map((item, index) => (
							<Box key={item.id} display='flex' alignItems='center' gap={1}>
								<TextField variant='outlined' color='success' size='small' fullWidth value={item.text} />
								<FormControlLabel
									sx={{whiteSpace: "nowrap", minWidth: "64px"}}
									labelPlacement='end'
									control={<Checkbox checked={item.useCamera} color='success' />}
									label='인증'
								/>
							</Box>
						))}
					</Box>
					<FormControlLabel control={<Checkbox color='success' checked />} label='뱃지 등록' sx={{mt: 1}} />
				</DialogContent>
				<DialogActions>
					<Button color='inherit' onClick={() => setShowCustomEditDialog(false)}>
						취소
					</Button>
					<Button variant='contained' color='success' onClick={() => setShowCustomEditDialog(false)}>
						확인
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={openDetailModal} onClose={() => setOpenDetailModal(false)} fullWidth maxWidth='sm'>
				<DialogTitle sx={{color: "#2e7d32", fontWeight: "bold"}}>
					{selectedChallenge?.text &&
						(selectedChallenge.text.length > 15 ? selectedChallenge.text.slice(0, 15) + "..." : selectedChallenge.text)}
				</DialogTitle>
				<DialogContent dividers sx={{maxHeight: 400}}>
					{Array.isArray(challengeDetails[selectedChallenge?.text]) &&
						challengeDetails[selectedChallenge?.text].map((item, idx) => (
							<Paper
								key={idx}
								sx={{
									p: 1.5,
									mb: 1,
									display: "flex",
									justifyContent: "space-between",
									alignItems: "center",
									borderRadius: "12px",
								}}>
								<Typography sx={{fontSize: "14px", color: "#2e7d32"}}>
									{typeof item === "string" ? item : item.name}
								</Typography>
								{selectedChallenge?.useCamera && typeof item === "object" && (
									<img
										src={item.image}
										alt='cert'
										style={{width: 40, height: 40, borderRadius: 8, objectFit: "cover", cursor: "pointer"}}
										onClick={() => setPreviewImage(item.image)}
									/>
								)}
							</Paper>
						))}
				</DialogContent>
				<DialogActions>
					<Button color='success' onClick={() => setOpenDetailModal(false)}>
						닫기
					</Button>
				</DialogActions>
			</Dialog>
			{previewImage && (
				<Dialog open={true} onClose={() => setPreviewImage(null)}>
					<Box display='flex' justifyContent='flex-end' p={1}>
						<IconButton onClick={() => setPreviewImage(null)} size='small'>
							<CloseIcon />
						</IconButton>
					</Box>
					<DialogContent>
						<img src={previewImage} alt='미리보기' style={{width: "100%", height: "auto"}} />
					</DialogContent>
				</Dialog>
			)}
		</Box>
	);
};

export default Home;
