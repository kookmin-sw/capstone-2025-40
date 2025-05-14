import React, {useState, useEffect, useRef, useCallback} from "react";
import {useDispatch} from "react-redux";
import {logout} from "../../redux/slices/authSlice";
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
	const [editingNickname, setEditingNickname] = useState(false);
	const [profileImage, setProfileImage] = useState(null);
	const [highlightedDays, setHighlightedDays] = useState([2, 4, 5]);
	const [isLoading, setIsLoading] = useState(false);
	const controllerRef = useRef(null);
	const [streak, setStreak] = useState(0);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [realName, setRealName] = useState("");
	const [city, setCity] = useState("");
	const [district, setDistrict] = useState("");
	const [isEditingArea, setIsEditingArea] = useState(false);
	const dispatch = useDispatch();

	// 모달 상태
	const [openPasswordModal, setOpenPasswordModal] = useState(false);
	const [openEmailModal, setOpenEmailModal] = useState(false);

	const [selectedBadge, setSelectedBadge] = useState(
		"https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge100.png?alt=media&token=8f125eb9-814f-4300-809c-1ab75049d7ee"
	);
	const [openBadgeModal, setOpenBadgeModal] = useState(false);
	const [point, setPoint] = useState(0);
	const fetchUserProfile = useCallback(async () => {
		try {
			const res = await axiosInstance.get("/users/profile/my/");
			setNickname(res.data.nickname);
			setRealName(res.data.name);
			setProfileImage(
				res.data.profile_image ||
					"https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/badges%2Fbadge100.png?alt=media&token=8f125eb9-814f-4300-809c-1ab75049d7ee"
			);
			setSelectedBadge(res.data.badge_image || "");
			setPoint(res.data.points ?? 0);
			setCity(res.data.city);
			setDistrict(res.data.district);
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
	const handleNicknameSave = () => {
		const confirmSave = window.confirm("닉네임을 저장하시겠습니까?");
		setEditingNickname(false);
	};

	const handleProfileImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => setProfileImage(event.target.result);
			reader.readAsDataURL(file);
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

	const handlePasswordSave = () => {
		if (password !== confirmPassword) {
			setPasswordError("비밀번호가 일치하지 않습니다.");
			return;
		}
		// 일치할 경우 초기화 및 모달 닫기
		setPasswordError("");
		setPassword("");
		setConfirmPassword("");
		setOpenPasswordModal(false);
	};

	const handleLogout = () => {
		const confirmLogout = window.confirm("로그아웃 하시겠습니까?");
		if (confirmLogout) {
			dispatch(logout());
			navigate("/login");
		}
	};

	return (
		<Box>
			{/* 프로필 */}
			<Box className={styles.profileHeader}>
				<Paper elevation={3} className={styles.profilePaper}>
					<Box className={styles.avatarWrapper}>
						<IconButton component='label' className={styles.avatarButton}>
							<Avatar src={profileImage} className={styles.avatar} sx={{height: "100%", width: "100%"}} />
							<input type='file' hidden accept='image/*' onChange={handleProfileImageChange} />
							<EditIcon className={styles.avatarEditIcon} fontSize='small' />
						</IconButton>
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
								onClick={() => {
									const confirmSave = window.confirm("지역을 저장하시겠습니까?");
									if (confirmSave) {
										setIsEditingArea(false);
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
								green_user_01
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
							type='password'
							label='비밀번호'
							variant='standard'
							color='success'
							fullWidth
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
						<TextField
							type='password'
							label='비밀번호 확인'
							variant='standard'
							color='success'
							fullWidth
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							error={!!passwordError}
							helperText={passwordError}
						/>
						<Button onClick={handlePasswordSave} className={styles.saveButton} fullWidth>
							저장
						</Button>
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
										onClick={() => {
											const confirmChange = window.confirm("뱃지를 변경하시겠습니까?");
											if (confirmChange) {
												setSelectedBadge(badge.url);
												setOpenBadgeModal(false);
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
