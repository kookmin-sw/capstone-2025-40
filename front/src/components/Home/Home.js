import React, {useEffect, useState, useRef} from "react";
import {motion, AnimatePresence} from "framer-motion";
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
import Snackbar from "@mui/material/Snackbar";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
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
import PullToRefresh from "../PullToRefresh/PullToRefresh";

const Home = ({customChallengeChanged, setCustomChallengeChanged}) => {
	const navigate = useNavigate();
	const [todayChallenges, setTodayChallenges] = useState([]);
	const [customChallengeGroups, setCustomChallengeGroups] = useState([]);
	// State for snackbar
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const [snackbarMessage, setSnackbarMessage] = useState("");
	const [completed, setCompleted] = useState([]);
	const [tip, setTip] = useState("");
	const [todayProgress, setTodayProgress] = useState(0);
	const [customProgress, setCustomProgress] = useState(0);
	const [loadingChallengeId, setLoadingChallengeId] = useState(null);
	const [challengeLoading, setChallengeLoading] = useState(true);
	const [isTodayChallengeOpen, setIsTodayChallengeOpen] = useState(true);
	const [openCustomGroups, setOpenCustomGroups] = useState({});
	// const [isCustomChallengeDeleted, setIsCustomChallengeDeleted] = useState(false);

	const [showAiModal, setShowAiModal] = useState(false);
	const [aiImage, setAiImage] = useState(null);
	const [aiStatus, setAiStatus] = useState("loading"); // "loading" | "success"

	const [editDialogGroupId, setEditDialogGroupId] = useState(null);
	const [menuAnchorEls, setMenuAnchorEls] = useState({});
	const [participantAnchorEls, setParticipantAnchorEls] = useState({});
	const [selectedParticipants, setSelectedParticipants] = useState({});

	// const [badgeImage, setBadgeImage] = useState(null);

	const [openDetailModal, setOpenDetailModal] = useState(false);
	const [selectedChallenge, setSelectedChallenge] = useState(null);
	const [previewImage, setPreviewImage] = useState(null);
	const [challengeResults, setChallengeResults] = useState([]);
	const handleOpenDetailModal = async (challenge, challengeGroupId) => {
		setSelectedChallenge(challenge);
		setOpenDetailModal(true);
		try {
			const res = await axiosInstance.get(
				`/users/custom-challenge/${challengeGroupId}/quests/${challenge.id}/results/`
			);
			setChallengeResults(res.data);
		} catch (err) {
			console.error("챌린지 결과 불러오기 실패:", err);
		}
	};

	// challengeDetails removed

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
	const [editTitle, setEditTitle] = useState("");
	const [editChallenges, setEditChallenges] = useState([]);

	const [editBadgeImage, setEditBadgeImage] = useState(null);
	const editBadgeInputRef = useRef();
	const [editIncludeBadge, setEditIncludeBadge] = useState(false);
	// 항목 삭제 체크박스 및 선택 상태 관리
	const [editDeleteChecked, setEditDeleteChecked] = useState({});
	const [showDeleteCheckbox, setShowDeleteCheckbox] = useState(false);

	const didInitRef = useRef(false);
	const initialRenderRef = useRef(true);

	const handleMenuClick = (event, groupId) => {
		setMenuAnchorEls((prev) => ({...prev, [groupId]: event.currentTarget}));
	};
	const handleCloseMenu = (groupId) => {
		setMenuAnchorEls((prev) => ({...prev, [groupId]: null}));
	};

	const fetchAllData = async () => {
		try {
			setChallengeLoading(true);
			const challengePromise = axiosInstance.get("/users/my-quests/today/");
			const [tipRes, progressRes, customRes] = await Promise.all([
				axiosInstance.get("/users/tips/random/"),
				axiosInstance.get("/users/my-quests/today/summary/"),
				axiosInstance.get("/users/custom-challenge/my/"),
			]);

			const challengesRes = await challengePromise;

			const challengeData = challengesRes.data.results;
			setTodayChallenges(challengeData);
			const completedIds = challengeData.filter((c) => c.is_completed).map((c) => c.id);
			setCompleted(completedIds);
			customRes.data.forEach((group) => {
				group.assignments.forEach((a) => {
					if (a.is_completed) completedIds.push(a.quest.id);
				});
			});
			setCompleted(completedIds);

			setTip(tipRes.data.tip);

			const {completed, total} = progressRes.data;
			setTodayProgress(total > 0 ? (completed / total) * 100 : 0);

			const customGroups = customRes.data.map((group) => {
				const progress =
					group.total_assignment_count > 0
						? (group.completed_assignment_count / group.total_assignment_count) * 100
						: 0;
				return {
					id: group.id,
					title: group.title,
					startDate: group.start_date,
					endDate: group.end_date,
					badgeImage: group.badge_image,
					participants: group.participants.map((p) => `${p.nickname}${p.is_me ? " (나)" : ""}`),
					challenges: group.assignments.map((a) => ({
						id: a.quest.id,
						text: a.quest.title,
						useCamera: a.quest.use_camera,
						is_completed: a.is_completed,
					})),
					completedCount: group.completed_assignment_count,
					totalCount: group.total_assignment_count,
					inviteCode: group.invite_code,
					is_leader: group.is_leader,
					progress,
				};
			});
			setCustomChallengeGroups(customGroups);
			const initialOpenStates = {};
			customGroups.forEach((group) => {
				initialOpenStates[group.id] = true;
			});
			setOpenCustomGroups(initialOpenStates);

			if (customGroups.length > 0) {
				const {completedCount, totalCount} = customGroups[0];
				setCustomProgress(totalCount > 0 ? (completedCount / totalCount) * 100 : 0);
			} else {
				setCustomProgress(0);
			}
		} catch (err) {
			console.error("데이터를 불러오지 못했습니다.", err);
		} finally {
			setChallengeLoading(false);
		}
	};

	useEffect(() => {
		if (!didInitRef.current) {
			fetchAllData();
			didInitRef.current = true;
		}
	}, []);

	useEffect(() => {
		if (initialRenderRef.current) {
			initialRenderRef.current = false;
			return;
		}
		fetchAllData();
	}, [customChallengeChanged]);

	useEffect(() => {
		if (editDialogGroupId !== null) {
			const selected = customChallengeGroups.find((g) => g.id === editDialogGroupId);
			if (selected) {
				setEditTitle(selected.title);
				setEditChallenges(selected.challenges);
				if (selected.badgeImage) {
					setEditBadgeImage(selected.badgeImage);
					setEditIncludeBadge(true);
				} else {
					setEditBadgeImage(null);
					setEditIncludeBadge(false);
				}
			}
			setEditDeleteChecked({});
			setShowDeleteCheckbox(false);
		}
	}, [editDialogGroupId, customChallengeGroups]);

	const handleChallenge = async (id, useCamera, isCustomChallenge = false) => {
		setLoadingChallengeId(id);
		const completeQuest = async (photoUrl = null) => {
			try {
				const payload = photoUrl ? {photo_url: photoUrl} : {};
				const endpoint = isCustomChallenge
					? `/users/custom-challenge/${
							customChallengeGroups.find((group) => group.challenges.some((c) => c.id === id))?.id
					  }/quests/${id}/complete/`
					: `/users/my-quests/${id}/complete/`;
				await axiosInstance.post(endpoint, payload);
				setCompleted((prev) => [...prev, id]);
				if (isCustomChallenge) {
					const newCompletedCount =
						completed.filter((id) => customChallengeGroups[0].challenges.some((c) => c.id === id)).length + 1;
					const totalCount = customChallengeGroups[0].challenges.length;
					setCustomProgress(totalCount > 0 ? (newCompletedCount / totalCount) * 100 : 0);
				} else {
					const newCompletedCount = completed.filter((id) => todayChallenges.some((c) => c.id === id)).length + 1;
					const totalCount = todayChallenges.length;
					setTodayProgress(totalCount > 0 ? (newCompletedCount / totalCount) * 100 : 0);
				}
				// 포인트 적립 알림 (성공 후에만 호출)
				if (isCustomChallenge) {
					alert("3포인트 적립되었습니다!");
				} else {
					alert("5 포인트 적립되었습니다!");
				}
				if (isCustomChallenge) {
					setCustomChallengeChanged((prev) => !prev);
				}
			} catch (err) {
				const detail = err.response?.data?.detail;
				const reason = err.response?.data?.reason;
				if (detail && reason) {
					alert(`${detail}\n\n사유: ${reason}`);
				} else {
					alert("퀘스트 인증에 실패했습니다.");
				}
				console.error(err);
			} finally {
				setLoadingChallengeId(null);
			}
		};

		if (useCamera) {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = "image/*";
			// input.capture = "environment";
			input.onclick = () => {
				input.value = null; // Allow reselecting same image
			};
			input.onchange = () => {
				setTimeout(async () => {
					try {
						if (!input.files || input.files.length === 0) throw new Error("사진을 선택하지 않았습니다.");
						const file = input.files[0];
						if (!file || file.size === 0) throw new Error("사진 파일을 불러오지 못했습니다.");

						setAiImage(URL.createObjectURL(file));
						setShowAiModal(true);
						setAiStatus("loading");

						const startTime = Date.now();
						const fileName = `quest-photos/${Date.now()}_${file.name}`;

						// 업로드 타임아웃 처리
						const photoUrl = await Promise.race([
							uploadImage(file, fileName),
							new Promise((_, reject) => setTimeout(() => reject(new Error("이미지 업로드 타임아웃")), 10000)),
						]);

						await completeQuest(photoUrl);

						const elapsed = Date.now() - startTime;
						const remaining = 5000 - elapsed;

						setAiStatus("success");
						setTimeout(
							() => {
								setShowAiModal(false);
								setAiStatus("loading");
								setAiImage(null);
							},
							remaining > 0 ? remaining : 0
						);
					} catch (err) {
						alert(err.message || "인증 처리 중 문제가 발생했습니다.");
						console.error(err);
						setShowAiModal(false);
						setAiStatus("loading");
						setAiImage(null);
					} finally {
						setLoadingChallengeId(null);
					}
				}, 150);
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

	const handleRefresh = () => {
		return new Promise((resolve) => {
			fetchAllData().then(() => {
				setTimeout(resolve, 500);
			});
		});
	};

	return (
		<>
			<AnimatePresence>
				{showAiModal && (
					<Dialog open={true} fullWidth maxWidth='xs' PaperProps={{sx: {overflow: "hidden", borderRadius: 2}}}>
						<DialogTitle sx={{textAlign: "center", fontWeight: "bold", fontSize: "18px"}}>
							{aiStatus === "loading" ? "🤖 AI 인증 중..." : "✅ AI 인증 완료!"}
						</DialogTitle>
						<DialogContent sx={{position: "relative", textAlign: "center", p: 0}}>
							{aiImage && (
								<Box sx={{position: "relative", width: "100%"}}>
									<img src={aiImage} alt='업로드 이미지' style={{width: "100%", borderRadius: 0}} />
									{aiStatus === "loading" && (
										<motion.div
											initial={{y: "-100%"}}
											animate={{y: "100%"}}
											transition={{repeat: Infinity, duration: 2, ease: "linear"}}
											style={{
												position: "absolute",
												top: 0,
												left: 0,
												width: "100%",
												height: "100%",
												background:
													"linear-gradient(to bottom, rgba(0,255,0,0.1), rgba(0,255,0,0.5), rgba(0,255,0,0.1))",
												pointerEvents: "none",
											}}
										/>
									)}
								</Box>
							)}
						</DialogContent>
					</Dialog>
				)}
			</AnimatePresence>
			<PullToRefresh onRefresh={handleRefresh}>
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

					{customChallengeGroups.map((group) => {
						const menuOpen = !!menuAnchorEls[group.id];
						const participantOpen = !!participantAnchorEls[group.id];
						return (
							<React.Fragment key={group.id}>
								<Box className={styles.titleBox}>
									<IconButton
										onClick={() =>
											setOpenCustomGroups((prev) => ({
												...prev,
												[group.id]: !prev[group.id],
											}))
										}>
										{openCustomGroups[group.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
									</IconButton>
									<Typography variant='h6' className={styles.sectionTitle}>
										{group.title}
									</Typography>
									<IconButton onClick={(e) => handleMenuClick(e, group.id)}>
										<MoreVertIcon />
									</IconButton>
									<Menu anchorEl={menuAnchorEls[group.id]} open={menuOpen} onClose={() => handleCloseMenu(group.id)}>
										<MenuItem
											onClick={() => {
												handleCloseMenu(group.id);
												const inviteCode = customChallengeGroups.find((g) => g.id === group.id)?.inviteCode;
												if (inviteCode) {
													navigator.clipboard.writeText(inviteCode).then(() => {
														setSnackbarMessage(`참여코드 "${inviteCode}"가 클립보드에 복사되었습니다.`);
														setSnackbarOpen(true);
													});
												}
											}}>
											참여코드 복사
										</MenuItem>
										{group.is_leader ? (
											<>
												<MenuItem
													onClick={() => {
														handleCloseMenu(group.id);
														setEditDialogGroupId(group.id);
													}}>
													챌린지 수정
												</MenuItem>
												<MenuItem
													onClick={async () => {
														handleCloseMenu(group.id);
														const confirmed = window.confirm("챌린지를 삭제하시겠습니까?");
														if (confirmed) {
															try {
																await axiosInstance.delete(`/users/custom-challenge/${group.id}/`);
																setCustomChallengeChanged((prev) => !prev);
																fetchAllData();
															} catch (err) {
																console.error("챌린지 삭제 실패:", err);
																alert("챌린지 삭제 중 오류가 발생했습니다.");
															}
														}
													}}>
													챌린지 삭제
												</MenuItem>
												<MenuItem
													onClick={() => {
														handleCloseMenu(group.id);
														const input = document.createElement("input");
														input.type = "file";
														input.accept = "image/*";
														input.onchange = async (e) => {
															const file = e.target.files[0];
															if (file) {
																const reader = new FileReader();
																reader.onload = async () => {
																	const base64 = reader.result;
																	try {
																		await axiosInstance.patch(`/users/custom-challenge/${group.id}/`, {
																			badge_image: base64,
																		});
																		setCustomChallengeChanged((prev) => !prev);
																		fetchAllData();
																	} catch (err) {
																		console.error("뱃지 등록 실패:", err);
																		alert("뱃지 등록 중 오류가 발생했습니다.");
																	}
																};
																reader.readAsDataURL(file);
															}
														};
														input.click();
													}}>
													뱃지 등록
												</MenuItem>
												<MenuItem
													onClick={async () => {
														handleCloseMenu(group.id);
														const confirmed = window.confirm("챌린지를 수동 종료하시겠습니까?");
														if (confirmed) {
															try {
																await axiosInstance.post(`/users/custom-challenge/${group.id}/close/`);
																setCustomChallengeChanged((prev) => !prev);
																fetchAllData();
															} catch (err) {
																console.error("챌린지 종료 실패:", err);
																alert("챌린지 종료 중 오류가 발생했습니다.");
															}
														}
													}}>
													챌린지 수동 종료
												</MenuItem>
											</>
										) : (
											<MenuItem
												onClick={async () => {
													handleCloseMenu(group.id);
													const confirmed = window.confirm("챌린지에서 탈퇴하시겠습니까?");
													if (confirmed) {
														try {
															await axiosInstance.delete(`/users/custom-challenge/${group.id}/leave/`);
															setCustomChallengeChanged((prev) => !prev);
															fetchAllData();
														} catch (err) {
															console.error("챌린지 탈퇴 실패:", err);
															alert("챌린지 탈퇴 중 오류가 발생했습니다.");
														}
													}
												}}>
												챌린지 탈퇴
											</MenuItem>
										)}
									</Menu>
								</Box>
								<Box display='flex' justifyContent='center' alignItems='center' gap={3} mb={1}>
									<Box display='flex' alignItems='center' gap={0.5}>
										<CalendarMonthIcon sx={{color: "#4caf50", fontSize: "18px"}} />
										<Typography sx={{color: "#4caf50", fontSize: "14px"}}>
											{group.startDate} ~ {group.endDate}
										</Typography>
									</Box>
									<Box
										display='flex'
										alignItems='center'
										gap={0.5}
										onClick={(e) => {
											const target = e.currentTarget;
											setSelectedParticipants((prev) => ({
												...prev,
												[group.id]: [...group.participants],
											}));
											setTimeout(() => {
												setParticipantAnchorEls((prev) => ({
													...prev,
													[group.id]: target,
												}));
											}, 0);
										}}
										sx={{cursor: "pointer"}}>
										<GroupsIcon sx={{color: "#4caf50", fontSize: "18px"}} />
										<Typography sx={{color: "#4caf50", fontSize: "14px"}}>{group.participants.length}</Typography>
									</Box>
								</Box>
								<Menu
									anchorEl={participantAnchorEls[group.id]}
									open={participantOpen}
									onClose={() =>
										setParticipantAnchorEls((prev) => ({
											...prev,
											[group.id]: null,
										}))
									}
									anchorOrigin={{vertical: "bottom", horizontal: "center"}}
									transformOrigin={{vertical: "top", horizontal: "center"}}>
									{(selectedParticipants[group.id] || []).map((name) => (
										<MenuItem key={name} sx={{fontSize: "14px", color: "#555"}}>
											{name}
										</MenuItem>
									))}
								</Menu>
								{group.badgeImage && (
									<Box display='flex' alignItems='center' justifyContent='center' gap={1} mt={1}>
										<Typography sx={{color: "#4caf50", fontSize: "14px"}}>달성 뱃지:</Typography>
										<Box onClick={() => setPreviewImage(group.badgeImage)} sx={{cursor: "pointer"}}>
											<Avatar src={group.badgeImage} sx={{width: 30, height: 30}} />
										</Box>
									</Box>
								)}
								<Box className={styles.progressBox}>
									<LinearProgress variant='determinate' value={group.progress} className={styles.progressBar} />
									<Typography className={styles.progressText}>
										{Number.isInteger(group.progress) ? group.progress : group.progress.toFixed(1)}%
									</Typography>
								</Box>
								{openCustomGroups[group.id] ? (
									challengeLoading ? (
										<Box display='flex' justifyContent='center' alignItems='center'>
											<CircularProgress color='success' />
										</Box>
									) : (
										<List className={styles.challengeList}>
											{group.challenges.map((challenge) => (
												<Paper elevation={2} className={styles.challengeCard} key={challenge.id}>
													<ListItem
														className={styles.challengeItem}
														onClick={() => handleOpenDetailModal(challenge, group.id)}
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
									)
								) : null}
							</React.Fragment>
						);
					})}

					<div className={styles.tipContainer}>
						<Typography variant='subtitle1' className={styles.tipTitle}>
							환경보호 Tip 🌱
						</Typography>
						<Typography className={styles.tipText}>{tip}</Typography>
					</div>

					<Dialog open={editDialogGroupId !== null} onClose={() => setEditDialogGroupId(null)} fullWidth>
						<DialogTitle sx={{color: "#2e7d32", fontWeight: "bold"}}>챌린지 수정</DialogTitle>
						<DialogContent dividers>
							<TextField
								variant='standard'
								color='success'
								fullWidth
								label='챌린지 제목'
								value={editTitle}
								onChange={(e) => setEditTitle(e.target.value)}
								margin='dense'
							/>
							<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
								<Typography mt={2} variant='subtitle1'>
									챌린지 기간
								</Typography>
								<Box display='flex' alignItems='center' gap={1} mt={2}>
									<MobileDatePicker
										value={
											customChallengeGroups.find((g) => g.id === editDialogGroupId)
												? new Date(customChallengeGroups.find((g) => g.id === editDialogGroupId).startDate)
												: new Date()
										}
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
										value={editEndDate}
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
								{editChallenges.slice(0, 6).map((item, index) => (
									<Box key={item.id} display='flex' alignItems='center' gap={1}>
										{showDeleteCheckbox && (
											<Checkbox
												color='error'
												checked={!!editDeleteChecked[item.id]}
												onChange={(e) =>
													setEditDeleteChecked((prev) => ({
														...prev,
														[item.id]: e.target.checked,
													}))
												}
											/>
										)}
										<TextField
											variant='outlined'
											color='success'
											size='small'
											fullWidth
											value={item.text}
											onChange={(e) =>
												setEditChallenges((prev) =>
													prev.map((it) => (it.id === item.id ? {...it, text: e.target.value} : it))
												)
											}
										/>
										<FormControlLabel
											sx={{whiteSpace: "nowrap", minWidth: "64px"}}
											labelPlacement='end'
											control={
												<Checkbox
													checked={item.useCamera}
													color='success'
													onChange={(e) =>
														setEditChallenges((prev) =>
															prev.map((it) => (it.id === item.id ? {...it, useCamera: e.target.checked} : it))
														)
													}
												/>
											}
											label='인증'
										/>
									</Box>
								))}
								<Button
									startIcon={<AddIcon />}
									sx={{mt: 1}}
									color='success'
									onClick={() =>
										setEditChallenges((prev) => [
											...prev,
											{
												id: `temp-${Date.now()}-${Math.random()}`,
												text: "",
												useCamera: false,
											},
										])
									}>
									항목 추가
								</Button>
								{editChallenges.length > 1 && (
									<Box display='flex' alignItems='center' gap={1} mt={1}>
										<Button
											startIcon={<RemoveIcon />}
											color='error'
											onClick={() => setShowDeleteCheckbox((prev) => !prev)}>
											항목 삭제
										</Button>
										{showDeleteCheckbox && (
											<Button
												color='error'
												onClick={() => {
													const remaining = editChallenges.filter((item) => !editDeleteChecked[item.id]);
													setEditChallenges(remaining.length > 0 ? remaining : editChallenges);
													setEditDeleteChecked({});
													if (remaining.length <= 1) setShowDeleteCheckbox(false);
												}}>
												삭제
											</Button>
										)}
									</Box>
								)}
							</Box>
							<FormControlLabel
								control={
									<Checkbox
										color='success'
										checked={editIncludeBadge}
										onChange={(e) => {
											setEditIncludeBadge(e.target.checked);
											if (!e.target.checked) {
												setEditBadgeImage(null);
											}
										}}
									/>
								}
								label='뱃지 등록'
								sx={{mt: 1}}
							/>
							{editIncludeBadge && (
								<Box mt={1} display='flex' alignItems='center' gap={2}>
									<Button variant='outlined' color='success' onClick={() => editBadgeInputRef.current?.click()}>
										뱃지 선택
									</Button>
									{editBadgeImage && (
										<Box
											component='img'
											src={editBadgeImage}
											alt='뱃지 미리보기'
											sx={{
												width: 40,
												height: 40,
												borderRadius: "50%",
												objectFit: "cover",
											}}
										/>
									)}
									<input
										ref={editBadgeInputRef}
										type='file'
										accept='image/*'
										hidden
										onChange={(e) => {
											const file = e.target.files?.[0];
											if (file) {
												setEditBadgeImage(URL.createObjectURL(file));
											}
										}}
									/>
								</Box>
							)}
						</DialogContent>
						<DialogActions>
							<Button color='inherit' onClick={() => setEditDialogGroupId(null)}>
								취소
							</Button>
							<Button
								variant='contained'
								color='success'
								onClick={async () => {
									const original = customChallengeGroups.find((g) => g.id === editDialogGroupId);
									if (!original) return;

									const data = {};
									if (editTitle !== original.title) data.title = editTitle;
									// Compare end date as yyyy-MM-dd string
									const origEndDateStr = original.endDate;
									const editEndDateStr = editEndDate.toISOString().split("T")[0];
									if (editEndDateStr !== origEndDateStr) {
										data.end_date = editEndDateStr;
									}
									if (editIncludeBadge && editBadgeImage && editBadgeImage !== original.badgeImage) {
										try {
											const fileUrl = await uploadImage(
												await fetch(editBadgeImage).then((res) => res.blob()),
												`badges/${Date.now()}_badge.png`
											);
											data.badge_image = fileUrl;
										} catch (err) {
											console.error("뱃지 이미지 업로드 실패:", err);
											alert("뱃지 이미지 업로드 중 오류가 발생했습니다.");
											return;
										}
									}

									// Build quests array with id for existing quests, omit id for new ones
									const transformedQuests = editChallenges.map((c) => {
										const quest = {
											title: c.text,
											use_camera: c.useCamera,
											point: 3,
											description: "",
										};
										if (!String(c.id).startsWith("temp-")) {
											quest.id = c.id;
										}
										return quest;
									});
									// Only include quests if changed (by id or title)
									const hasQuestChanged = () => {
										if (original.challenges.length !== editChallenges.length) return true;
										for (let i = 0; i < editChallenges.length; i++) {
											const orig = original.challenges[i];
											const edited = editChallenges[i];
											if (String(edited.id).startsWith("temp-")) return true;
											if (orig.id !== edited.id || orig.text !== edited.text || orig.useCamera !== edited.useCamera)
												return true;
										}
										return false;
									};

									if (hasQuestChanged()) {
										data.quests = transformedQuests;
									}

									try {
										await axiosInstance.patch(`/users/custom-challenge/${editDialogGroupId}/`, data);
										alert("챌린지가 수정되었습니다.");
										setCustomChallengeChanged((prev) => !prev);
										setEditDialogGroupId(null);
										fetchAllData();
									} catch (err) {
										console.error("챌린지 수정 실패:", err);
										alert("챌린지 수정 중 오류가 발생했습니다.");
									}
								}}>
								확인
							</Button>
						</DialogActions>
					</Dialog>
					<Dialog
						open={openDetailModal}
						onClose={() => {
							setOpenDetailModal(false);
							setChallengeResults([]);
							setSelectedChallenge(null);
						}}
						fullWidth
						maxWidth='sm'>
						<DialogTitle sx={{color: "#2e7d32", fontWeight: "bold"}}>
							{selectedChallenge?.text &&
								(selectedChallenge.text.length > 15
									? selectedChallenge.text.slice(0, 15) + "..."
									: selectedChallenge.text)}
						</DialogTitle>
						<DialogContent dividers sx={{maxHeight: 400}}>
							{challengeResults.map((result) => (
								<Paper
									key={result.id}
									sx={{
										p: 1.5,
										mb: 1,
										display: "flex",
										justifyContent: "space-between",
										alignItems: "center",
										borderRadius: "12px",
									}}>
									<Box display='flex' alignItems='center' gap={1}>
										<Avatar
											src={
												result.user.profile_image ??
												"https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/profile-images%2FGreenDayProfile.png?alt=media&token=dc457190-a5f4-4ea9-be09-39a31aafef7c"
											}
											sx={{width: 32, height: 32, cursor: "pointer"}}
											onClick={() =>
												setPreviewImage(
													result.user.profile_image ??
														"https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/profile-images%2FGreenDayProfile.png?alt=media&token=dc457190-a5f4-4ea9-be09-39a31aafef7c"
												)
											}
										/>
										<Typography sx={{fontSize: "14px", color: "#2e7d32"}}>{result.user.nickname}</Typography>
										{result.user.badge_image && (
											<Avatar
												src={result.user.badge_image}
												sx={{width: 32, height: 32, cursor: "pointer"}}
												variant='rounded'
												onClick={() => setPreviewImage(result.user.badge_image)}
											/>
										)}
									</Box>
									{result.photo_url && (
										<Box
											component='img'
											src={result.photo_url}
											alt='인증 이미지'
											sx={{width: 48, height: 48, borderRadius: 1, objectFit: "cover", cursor: "pointer"}}
											onClick={() => setPreviewImage(result.photo_url)}
										/>
									)}
								</Paper>
							))}
						</DialogContent>
						<DialogActions>
							<Button
								color='success'
								onClick={() => {
									setOpenDetailModal(false);
									setChallengeResults([]);
									setSelectedChallenge(null);
								}}>
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
			</PullToRefresh>
			<Snackbar
				open={snackbarOpen}
				autoHideDuration={3000}
				onClose={() => setSnackbarOpen(false)}
				message={snackbarMessage}
				anchorOrigin={{vertical: "top", horizontal: "center"}}
				ContentProps={{
					sx: {
						mt: 6,
					},
				}}
			/>
		</>
	);
};

export default Home;
