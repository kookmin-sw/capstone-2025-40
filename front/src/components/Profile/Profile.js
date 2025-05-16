import React, {useState, useEffect, useRef, useCallback} from "react";
import {useDispatch} from "react-redux";
import {logout} from "../../redux/slices/authSlice";
import imageCompression from "browser-image-compression";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";
import {storage} from "../../firebase";
import {
	Box,
	Typography,
	Avatar,
	IconButton,
	TextField,
	Button,
	Divider,
	List,
	ListItem,
	ListItemButton,
	Badge,
	Paper,
	Modal,
	MenuItem,
	Dialog,
	DialogTitle,
	DialogContent,
	Grid,
	CircularProgress,
	Menu,
} from "@mui/material";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {DateCalendar} from "@mui/x-date-pickers/DateCalendar";
import {PickersDay} from "@mui/x-date-pickers/PickersDay";
import {DayCalendarSkeleton} from "@mui/x-date-pickers/DayCalendarSkeleton";
import isSameDay from "date-fns/isSameDay";
import subDays from "date-fns/subDays";
import {ko} from "date-fns/locale";
import axiosInstance from "../../axiosInstance";
import styles from "./Profile.module.css";
import {useNavigate} from "react-router-dom";
import EditIcon from "@mui/icons-material/Edit";
import {area} from "../../area";

const initialDate = new Date();

const CustomDay = (props) => {
	const {highlightedDays = [], day, outsideCurrentMonth, ...other} = props;
	const isHighlighted = !outsideCurrentMonth && highlightedDays.includes(day.getDate());

	return (
		<Badge
			overlap='circular'
			badgeContent={isHighlighted ? "🌱" : undefined}
			anchorOrigin={{vertical: "bottom", horizontal: "right"}}>
			<PickersDay {...other} day={day} outsideCurrentMonth={outsideCurrentMonth} />
		</Badge>
	);
};

const Profile = () => {
	const navigate = useNavigate();
	const [nickname, setNickname] = useState("");
	const [username, setUsername] = useState("");
	const [editingNickname, setEditingNickname] = useState(false);
	const [profileImage, setProfileImage] = useState(null);
	const [highlightedDays, setHighlightedDays] = useState([2, 4, 5]);
	const [isLoading, setIsLoading] = useState(false);
	const controllerRef = useRef(null);
	const [streak, setStreak] = useState(0);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	// Password reset states
	const [step, setStep] = useState("request");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [timer, setTimer] = useState(600);
	const [resultMessage, setResultMessage] = useState("");
	const [email, setEmail] = useState("");
	const [realName, setRealName] = useState("");
	const [city, setCity] = useState("");
	const [district, setDistrict] = useState("");
	const [isEditingArea, setIsEditingArea] = useState(false);
	const dispatch = useDispatch();
	// Profile image menu state
	const [anchorEl, setAnchorEl] = useState(null);
	const openMenu = Boolean(anchorEl);

	// 모달 상태
	const [openPasswordModal, setOpenPasswordModal] = useState(false);
	const [openEmailModal, setOpenEmailModal] = useState(false);

	const [selectedBadge, setSelectedBadge] = useState();
	const [openBadgeModal, setOpenBadgeModal] = useState(false);
	const [point, setPoint] = useState(0);
	const fetchUserProfile = useCallback(async () => {
		try {
			const res = await axiosInstance.get("/users/profile/my/");
			setNickname(res.data.nickname);
			setRealName(res.data.name);
			setProfileImage(
				res.data.profile_image ||
					"https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/profile-images%2FGreenDayProfile.png?alt=media&token=dc457190-a5f4-4ea9-be09-39a31aafef7c"
			);
			setSelectedBadge(res.data.badge_image || "");
			setPoint(res.data.points ?? 0);
			setCity(res.data.city);
			setDistrict(res.data.district);
			setUsername(res.data.username);
		} catch (error) {
			console.error("프로필 정보 불러오기 실패:", error);
		}
	}, []);
	const badgeList = [
		{
			point: 0,
			name: "없음",
			url: "",
		},
		{
			point: 100,
			name: "100 포인트 달성 뱃지",
			url: "https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge100.png?alt=media&token=8f125eb9-814f-4300-809c-1ab75049d7ee",
		},
		{
			point: 300,
			name: "300 포인트 달성 뱃지",
			url: "https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge300.png?alt=media&token=6ee0120a-00b2-460a-9953-735bed462802",
		},
		{
			point: 500,
			name: "500 포인트 달성 뱃지",
			url: "https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge500.png?alt=media&token=d176caa3-6c0f-4211-9412-9e32fe5e9e20",
		},
		{
			point: 1000,
			name: "1000 포인트 달성 뱃지",
			url: "https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge1000.png?alt=media&token=cd87944a-89dc-4096-8612-44c6cd2e54db",
		},
		{
			point: 1500,
			name: "1500 포인트 달성 뱃지",
			url: "https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge1500.png?alt=media&token=bc6033e2-c2cc-482d-85b5-6913917c16f3",
		},
		{
			point: 2000,
			name: "2000 포인트 달성 뱃지",
			url: "https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge2000.png?alt=media&token=1b0f6886-285e-4667-833d-238bf2d9dafb",
		},
		{
			point: 2500,
			name: "2500 포인트 달성 뱃지",
			url: "https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge2500.png?alt=media&token=37c2c220-dad1-4d63-9fa5-37e05da9d9e3",
		},
		{
			point: 3000,
			name: "3000 포인트 달성 뱃지",
			url: "https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge3000.png?alt=media&token=572d21f5-0d26-456d-bde3-28cdfdd85a30",
		},
	];

	const handleNicknameClick = () => {
		setEditingNickname(true);
	};

	const handleNicknameChange = (e) => setNickname(e.target.value);
	const handleNicknameSave = async () => {
		const confirmSave = window.confirm("닉네임을 저장하시겠습니까?");
		if (!confirmSave) return;

		setIsLoading(true);
		try {
			await axiosInstance.patch("/users/profile/my/", {
				nickname: nickname,
			});
		} catch (error) {
			console.error("닉네임 저장 실패:", error);
		} finally {
			setEditingNickname(false);
			setIsLoading(false);
		}
	};

	const handleProfileImageChange = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setIsLoading(true);
		try {
			const {user_id, username} = JSON.parse(localStorage.getItem("user"));
			const filename = `${user_id}-${username}-profileimage-${Date.now()}`;
			const fileRef = ref(storage, `profile-images/${filename}`);
			const options = {
				maxSizeMB: 0.5,
				maxWidthOrHeight: 1024,
				useWebWorker: true,
			};

			const compressedFile = await imageCompression(file, options);
			await uploadBytes(fileRef, compressedFile);
			const downloadURL = await getDownloadURL(fileRef);
			setProfileImage(downloadURL);

			await axiosInstance.patch("/users/profile/my/", {
				profile_image: downloadURL,
			});
		} catch (error) {
			console.error("프로필 이미지 업로드 실패:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchChallengeDates = async (date) => {
		const year = date.getFullYear();
		const month = date.getMonth() + 1;
		try {
			setIsLoading(true);
			const res = await axiosInstance.get(`/users/my-quests/success-days/?year=${year}&month=${month}`);
			const days = res.data.success_dates.map((d) => new Date(d).getDate());
			setHighlightedDays(days);
			setStreak(calculateStreak(days, date));
		} catch (error) {
			console.error("챌린지 날짜 불러오기 실패:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const calculateStreak = (dayList, date) => {
		const year = date.getFullYear();
		const month = date.getMonth();
		const achievedDates = dayList.map((d) => new Date(year, month, d));

		let count = 0;
		let current = new Date();

		while (true) {
			const matched = achievedDates.find((d) => isSameDay(d, current));
			if (matched) {
				count++;
				current = subDays(current, 1);
			} else {
				break;
			}
		}
		return count;
	};

	useEffect(() => {
		fetchChallengeDates(initialDate);
		fetchUserProfile();
	}, [fetchUserProfile]);

	const handleMonthChange = (date) => {
		setHighlightedDays([]);
		fetchChallengeDates(date);
	};

	// Password reset logic
	useEffect(() => {
		let interval;
		if (step === "reset" && timer > 0) {
			interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [step, timer]);

	const handlePasswordSave = async () => {
		if (step === "request") {
			if (!email) {
				setResultMessage("이메일을 입력해주세요.");
				return;
			}
			setIsLoading(true);
			try {
				const res = await axiosInstance.post("/users/auth/password/reset/code/", {email});
				setResultMessage(res.data.detail || "인증번호를 전송했습니다.");
				setStep("reset");
				setTimer(600);
			} catch (err) {
				setResultMessage("인증번호 요청에 실패했습니다.");
			} finally {
				setIsLoading(false);
			}
		} else {
			if (!code || !newPassword) {
				setResultMessage("모든 필드를 입력해주세요.");
				return;
			}
			setIsLoading(true);
			try {
				const res = await axiosInstance.post("/users/auth/password/reset/confirm-code/", {
					email,
					code,
					new_password: newPassword,
				});
				alert("비밀번호가 변경되었습니다.");
				setOpenPasswordModal(false);
			} catch (err) {
				const msg = err.response?.data?.detail || "비밀번호 재설정 실패";
				setResultMessage(msg);
			} finally {
				setIsLoading(false);
			}
		}
	};

	const handleLogout = async () => {
		const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
		if (confirmLogout) {
			const fcmToken = localStorage.getItem("fcmToken");
			if (fcmToken) {
				try {
					await axiosInstance.delete("/users/fcm/devices/", {
						data: {registration_token: fcmToken},
					});
					console.log("FCM 토큰 삭제 완료");
				} catch (error) {
					console.error("FCM 토큰 삭제 실패:", error);
				}
			}
			dispatch(logout());
			navigate("/login");
		}
	};

	return (
		<Box>
			{isLoading && (
				<Box
					sx={{
						position: "fixed",
						top: "33vh",
						left: "50%",
						transform: "translate(-50%, -50%)",
						zIndex: 2000,
					}}>
					<CircularProgress color='success' />
				</Box>
			)}
			{/* 프로필 */}
			<Box className={styles.profileHeader}>
				<Paper elevation={3} className={styles.profilePaper}>
					<Box className={styles.avatarWrapper}>
						<IconButton className={styles.avatarButton} onClick={(e) => setAnchorEl(e.currentTarget)}>
							<Avatar src={profileImage} className={styles.avatar} sx={{height: "100%", width: "100%"}} />
							<EditIcon className={styles.avatarEditIcon} fontSize='small' />
						</IconButton>
						{/* Hidden file input for profile image upload */}
						<input type='file' hidden accept='image/*' id='profile-upload' onChange={handleProfileImageChange} />
						{/* Profile image context menu */}
						<Menu anchorEl={anchorEl} open={openMenu} onClose={() => setAnchorEl(null)}>
							<MenuItem
								onClick={async () => {
									setAnchorEl(null);
									const confirmReset = window.confirm("기본 이미지로 변경하시겠습니까?");
									if (!confirmReset) return;
									try {
										await axiosInstance.patch("/users/profile/my/", {
											profile_image: null,
										});
										setProfileImage(
											"https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/profile-images%2FGreenDayProfile.png?alt=media&token=dc457190-a5f4-4ea9-be09-39a31aafef7c"
										);
									} catch (error) {
										console.error("기본 이미지 변경 실패:", error);
									}
								}}>
								기본 이미지로 변경
							</MenuItem>
							<MenuItem
								onClick={() => {
									setAnchorEl(null);
									document.getElementById("profile-upload").click();
								}}>
								앨범에서 선택
							</MenuItem>
						</Menu>
					</Box>
					{editingNickname ? (
						<Box className={styles.nicknameEdit}>
							<TextField variant='standard' value={nickname} onChange={handleNicknameChange} color='success' />
							<Button onClick={handleNicknameSave} size='small' color='success'>
								저장
							</Button>
						</Box>
					) : (
						<Box className={styles.nicknameDisplay} onClick={handleNicknameClick}>
							<Typography className={styles.nickname}>{nickname}</Typography>
						</Box>
					)}
				</Paper>
			</Box>

			{/* 포인트 */}
			<Box className={styles.pointSection}>
				<Typography variant='subtitle1' fontWeight='bold'>
					내 포인트
				</Typography>
				<Typography variant='h6' color='success.main'>
					{point.toLocaleString()}점
				</Typography>
			</Box>

			<Box className={styles.pointSection}>
				<Typography variant='subtitle1' fontWeight='bold'>
					내 뱃지
				</Typography>
				<IconButton onClick={() => setOpenBadgeModal(true)}>
					{selectedBadge ? (
						<Avatar src={selectedBadge} sx={{width: 80, height: 80}} />
					) : (
						<Box
							sx={{
								width: 80,
								height: 80,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								borderRadius: "50%",
								bgcolor: "#bdbdbd",
								color: "#fff",
								fontWeight: "bold",
							}}>
							없음
						</Box>
					)}
				</IconButton>
			</Box>

			{/* 챌린지 */}
			<Box className={styles.challengeSection}>
				<Typography variant='subtitle1' fontWeight='bold'>
					챌린지 현황
				</Typography>
				{streak > 0 && <Typography className={styles.streakText}>{streak}일 연속 달성 중이에요!</Typography>}
				<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
					<DateCalendar
						defaultValue={initialDate}
						loading={isLoading}
						onMonthChange={handleMonthChange}
						renderLoading={() => <DayCalendarSkeleton />}
						slots={{day: CustomDay}}
						slotProps={{day: {highlightedDays}}}
					/>
				</LocalizationProvider>
			</Box>

			<Box className={styles.settingSection}>
				<Typography className={styles.settingTitle} variant='subtitle1' fontWeight='bold'>
					개인정보
				</Typography>
				<Box className={styles.privacyContent}>
					<List>
						<ListItem sx={{padding: "10px 0"}}>
							<Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
								<Typography variant='body1'>이름</Typography>
								<Typography variant='body2' color='text.secondary'>
									{realName}
								</Typography>
							</Box>
						</ListItem>
						<Divider />
					</List>
					<Box display='flex' gap={1} alignItems='flex-end'>
						<TextField
							select
							fullWidth
							color='success'
							value={city}
							onChange={(e) => {
								setCity(e.target.value);
								setDistrict("");
							}}
							label='시'
							variant='standard'
							disabled={!isEditingArea}
							SelectProps={{
								MenuProps: {
									PaperProps: {
										style: {
											maxHeight: 200,
										},
									},
								},
							}}>
							{area.map((a) => (
								<MenuItem key={a.name} value={a.name}>
									{a.name}
								</MenuItem>
							))}
						</TextField>

						<TextField
							select
							fullWidth
							color='success'
							value={district}
							onChange={(e) => setDistrict(e.target.value)}
							label='군/구'
							variant='standard'
							disabled={!isEditingArea || !city}
							SelectProps={{
								MenuProps: {
									PaperProps: {
										style: {
											maxHeight: 200,
										},
									},
								},
							}}>
							{(area.find((a) => a.name === city)?.subArea || []).map((sub) => (
								<MenuItem key={sub} value={sub}>
									{sub}
								</MenuItem>
							))}
						</TextField>

						{isEditingArea ? (
							<Button
								onClick={async () => {
									const confirmSave = window.confirm("지역을 저장하시겠습니까?");
									if (confirmSave) {
										try {
											await axiosInstance.patch("/users/profile/my/", {
												city,
												district,
											});
											setIsEditingArea(false);
										} catch (error) {
											console.error("지역 저장 실패:", error);
										}
									}
								}}
								variant='text'
								size='small'
								sx={{minWidth: "50px", color: "#388e3c", fontWeight: "bold"}}>
								저장
							</Button>
						) : (
							<IconButton onClick={() => setIsEditingArea(true)} size='small' sx={{color: "#4caf50"}}>
								<EditIcon fontSize='small' />
							</IconButton>
						)}
					</Box>
				</Box>
			</Box>

			{/* 계정 정보 */}
			<Box className={styles.settingSection}>
				<Typography className={styles.settingTitle} variant='subtitle1' fontWeight='bold'>
					계정
				</Typography>
				<List>
					<ListItem sx={{padding: "10px 0"}}>
						<Box display='flex' justifyContent='space-between' alignItems='center' width='100%'>
							<Typography variant='body1'>아이디</Typography>
							<Typography variant='body2' color='text.secondary'>
								{username}
							</Typography>
						</Box>
					</ListItem>
					<Divider />
					<ListItemButton sx={{padding: "10px 0"}} onClick={() => setOpenPasswordModal(true)}>
						비밀번호 설정
					</ListItemButton>
					<Divider />
					{/*
					<ListItemButton sx={{padding: "10px 0"}} onClick={() => setOpenEmailModal(true)}>
						이메일 설정
					</ListItemButton>
					<Divider />
					*/}
					<ListItemButton sx={{padding: "10px 0"}} onClick={handleLogout}>
						로그아웃
					</ListItemButton>
				</List>
			</Box>

			{/* 비밀번호 설정 모달 */}
			<Modal open={openPasswordModal} onClose={() => setOpenPasswordModal(false)}>
				<Box className={styles.modalWrapper}>
					<Typography className={styles.modalTitle}>비밀번호 설정</Typography>
					<Box className={styles.modalContent}>
						<TextField
							type='email'
							label='이메일'
							variant='standard'
							color='success'
							fullWidth
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							sx={{mb: 1}}
						/>
						{step === "reset" && (
							<>
								<TextField
									label='인증번호'
									variant='standard'
									fullWidth
									color='success'
									margin='normal'
									value={code}
									onChange={(e) => setCode(e.target.value)}
								/>
								<TextField
									label='새 비밀번호'
									type='password'
									variant='standard'
									fullWidth
									color='success'
									margin='normal'
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
								/>
								<Typography variant='body2' color='textSecondary'>
									남은 시간: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
								</Typography>
							</>
						)}
						<Button onClick={handlePasswordSave} className={styles.saveButton} fullWidth disabled={isLoading}>
							{isLoading ? (
								<CircularProgress size={24} color='success' />
							) : step === "request" ? (
								"인증번호 요청"
							) : (
								"비밀번호 재설정"
							)}
						</Button>
						{resultMessage && (
							<Typography color='textSecondary' marginTop={2}>
								{resultMessage}
							</Typography>
						)}
					</Box>
				</Box>
			</Modal>

			{/* 이메일 설정 모달 */}
			<Modal open={openEmailModal} onClose={() => setOpenEmailModal(false)}>
				<Box className={styles.modalWrapper}>
					<Typography className={styles.modalTitle}>이메일 설정</Typography>
					<Box className={styles.modalContent}>
						<TextField type='email' label='이메일' variant='standard' color='success' fullWidth />
						<Button onClick={() => setOpenEmailModal(false)} className={styles.saveButton} fullWidth>
							저장
						</Button>
					</Box>
				</Box>
			</Modal>
			<Dialog open={openBadgeModal} onClose={() => setOpenBadgeModal(false)} maxWidth='xs' fullWidth>
				<DialogTitle>뱃지 변경</DialogTitle>
				<DialogContent>
					<Grid container spacing={2}>
						{badgeList
							.filter((b) => b.point <= point)
							.map((badge) => (
								<Grid item xs={4} key={badge.point} sx={{display: "flex", justifyContent: "center"}}>
									<IconButton
										onClick={async () => {
											const confirmChange = window.confirm("뱃지를 변경하시겠습니까?");
											if (confirmChange) {
												const badgeValue = badge.url || null;
												setIsLoading(true);
												try {
													await axiosInstance.patch("/users/profile/my/", {
														badge_image: badgeValue,
													});
													setSelectedBadge(badgeValue);
													setOpenBadgeModal(false);
												} catch (error) {
													console.error("뱃지 변경 실패:", error);
												} finally {
													setIsLoading(false);
												}
											}
										}}
										sx={{flexDirection: "column"}}>
										<Avatar src={badge.url || undefined} sx={{width: 56, height: 56}}>
											{!badge.url && <Typography variant='caption'>없음</Typography>}
										</Avatar>
										<Typography variant='caption' align='center' sx={{whiteSpace: "pre-line"}}>
											{badge.name.replace("포인트", "포인트\n")}
										</Typography>
									</IconButton>
								</Grid>
							))}
					</Grid>
				</DialogContent>
			</Dialog>
		</Box>
	);
};

export default Profile;
