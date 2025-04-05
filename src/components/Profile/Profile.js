import React, {useState, useEffect, useRef} from "react";
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
} from "@mui/material";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {DateCalendar} from "@mui/x-date-pickers/DateCalendar";
import {PickersDay} from "@mui/x-date-pickers/PickersDay";
import {DayCalendarSkeleton} from "@mui/x-date-pickers/DayCalendarSkeleton";
import isSameDay from "date-fns/isSameDay";
import subDays from "date-fns/subDays";
import {ko} from "date-fns/locale";
import defaultProfile from "../../assets/default-profile.png";
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
	const [nickname, setNickname] = useState("그린유저");
	const [editingNickname, setEditingNickname] = useState(false);
	const [profileImage, setProfileImage] = useState(defaultProfile);
	const [highlightedDays, setHighlightedDays] = useState([2, 4, 5]);
	const [isLoading, setIsLoading] = useState(false);
	const controllerRef = useRef(null);
	const [streak, setStreak] = useState(0);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState("");
	const [realName, setRealName] = useState("");
	const [city, setCity] = useState("서울");
	const [district, setDistrict] = useState("성북구");
	const [isEditingArea, setIsEditingArea] = useState(false);

	// 모달 상태
	const [openPasswordModal, setOpenPasswordModal] = useState(false);
	const [openEmailModal, setOpenEmailModal] = useState(false);

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

	const fetchChallengeDates = (date) => {
		const controller = new AbortController();
		setIsLoading(true);

		setTimeout(() => {
			const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
			const fakeData = [2, 4, 5].filter((d) => d <= daysInMonth);
			setHighlightedDays(fakeData);
			setIsLoading(false);
			setStreak(calculateStreak(fakeData, date));
		}, 500);

		controllerRef.current = controller;
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
		return () => controllerRef.current?.abort();
	}, []);

	const handleMonthChange = (date) => {
		controllerRef.current?.abort();
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
					1,500점
				</Typography>
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
									홍길동
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
					<ListItemButton sx={{padding: "10px 0"}} onClick={() => setOpenEmailModal(true)}>
						이메일 설정
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
		</Box>
	);
};

export default Profile;
