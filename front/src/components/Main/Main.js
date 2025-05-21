import React, {useEffect, useState} from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import {MobileDatePicker} from "@mui/x-date-pickers/MobileDatePicker";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {ko} from "date-fns/locale";
import {Box, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction, Paper} from "@mui/material";
import {useNavigate, useLocation, Routes, Route} from "react-router-dom";
import {useDispatch} from "react-redux";
import HomeIcon from "@mui/icons-material/Home";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ForumIcon from "@mui/icons-material/Forum";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PortraitOutlinedIcon from "@mui/icons-material/PortraitOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import styles from "./Main.module.css";
import Home from "../Home/Home";
import Challenge from "../Challenge/Challenge";
import Community from "../Community/Community";
import Profile from "../Profile/Profile";
import FCMSetup from "../../FCMSetup";
import axiosInstance from "../../axiosInstance";
import "../../global.css";
import CircularProgress from "@mui/material/CircularProgress";
import uploadImage from "../../uploadImage";

const Main = () => {
	// 커스텀 챌린지 변경 알림 상태
	const [customChallengeChanged, setCustomChallengeChanged] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();

	const currentPath = location.pathname.replace("/main/", "") || "home";

	const dispatch = useDispatch();

	const navActionStyle = {
		icon: {fontSize: 20}, // 아이콘 사이즈
		label: {fontSize: "11px"}, // 라벨 텍스트
	};

	const [anchorEl, setAnchorEl] = React.useState(null);
	const open = Boolean(anchorEl);

	const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
	const [joinDialogOpen, setJoinDialogOpen] = React.useState(false);
	const [joinCode, setJoinCode] = React.useState("");
	const [joinValidationError, setJoinValidationError] = React.useState("");
	const [joinLoading, setJoinLoading] = React.useState(false);
	const [challengeTitle, setChallengeTitle] = React.useState("");
	const [startDate, setStartDate] = React.useState(() => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow;
	});
	const [endDate, setEndDate] = React.useState(null);
	const [items, setItems] = React.useState([{id: Date.now(), text: "", requirePhoto: false, checked: false}]);
	const [includeBadge, setIncludeBadge] = React.useState(false);
	const [showDeleteCheckbox, setShowDeleteCheckbox] = React.useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
	const [deleteChecked, setDeleteChecked] = React.useState({});
	const [badgeImage, setBadgeImage] = React.useState(null);
	const badgeInputRef = React.useRef();
	const [createLoading, setCreateLoading] = React.useState(false);
	const [validationErrors, setValidationErrors] = React.useState({});
	const [myChallenges, setMyChallenges] = React.useState([]);
	const [deleteLoading, setDeleteLoading] = React.useState(false);

	// Fetch my challenges when deleteDialogOpen changes
	useEffect(() => {
		if (deleteDialogOpen) {
			axiosInstance
				.get("/users/custom-challenge/my/")
				.then((res) => {
					setMyChallenges(res.data.filter((challenge) => challenge.is_leader));
				})
				.catch((err) => {
					console.error("내 챌린지 조회 실패", err);
				});
		}
	}, [deleteDialogOpen]);
	const handleMenuClick = (event) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const renderTitle = () => {
		switch (currentPath) {
			case "home":
				return "GreenDay";
			case "challenge":
				return "챌린지";
			case "community":
				return "커뮤니티";
			case "profile":
				return "프로필";
			default:
				return "";
		}
	};

	const renderRightIcon = () => {
		return (
			<>
				{currentPath === "community" && (
					<PortraitOutlinedIcon sx={{cursor: "pointer"}} onClick={() => navigate("/myposts")} />
				)}
				<DeleteSweepOutlinedIcon sx={{cursor: "pointer"}} onClick={() => navigate("/trashdictionary")} />
				<MoreVertIcon sx={{cursor: "pointer"}} onClick={handleMenuClick} />
				<Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
					<MenuItem
						onClick={() => {
							handleClose();
							setCreateDialogOpen(true);
						}}>
						챌린지 생성
					</MenuItem>
					<MenuItem
						onClick={() => {
							handleClose();
							setJoinCode("");
							setJoinValidationError("");
							setJoinDialogOpen(true);
						}}>
						챌린지 참가
					</MenuItem>
					<MenuItem
						onClick={() => {
							handleClose();
							setDeleteDialogOpen(true);
						}}>
						챌린지 삭제
					</MenuItem>
				</Menu>
			</>
		);
	};

	const handleCloseCreateDialog = () => {
		setChallengeTitle("");
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		setStartDate(tomorrow);
		setEndDate(null);
		setItems([{id: Date.now(), text: "", requirePhoto: false, checked: false}]);
		setIncludeBadge(false);
		setShowDeleteCheckbox(false);
		setCreateDialogOpen(false);
		setBadgeImage(null);
		setValidationErrors({});
	};

	return (
		<Box className={styles.container}>
			{/* 헤더 */}
			<AppBar position='static' className={styles.appBar}>
				<Toolbar>
					<Typography variant='h6' className={styles.title}>
						{renderTitle()}
					</Typography>
					<Box sx={{display: "flex", ml: "auto", alignItems: "center", gap: 1}}>{renderRightIcon()}</Box>
				</Toolbar>
			</AppBar>

			{/* 본문 */}
			<Box className={styles.body}>
				<Routes>
					<Route
						path='home'
						element={
							<Home
								customChallengeChanged={customChallengeChanged}
								setCustomChallengeChanged={setCustomChallengeChanged}
							/>
						}
					/>
					<Route path='challenge' element={<Challenge />} />
					<Route path='community' element={<Community />} />
					<Route path='profile' element={<Profile />} />
				</Routes>
			</Box>

			{/* 하단 네비게이션 */}
			<Box className={styles.bottomNavContainer}>
				<BottomNavigation
					value={currentPath}
					onChange={(event, newValue) => navigate(`/main/${newValue}`)}
					className={styles.bottomNav}
					showLabels>
					<BottomNavigationAction
						label='홈'
						value='home'
						icon={<HomeIcon sx={navActionStyle.icon} />}
						sx={{"& .MuiBottomNavigationAction-label": navActionStyle.label}}
					/>
					<BottomNavigationAction
						label='챌린지'
						value='challenge'
						icon={<EmojiEventsIcon sx={navActionStyle.icon} />}
						sx={{"& .MuiBottomNavigationAction-label": navActionStyle.label}}
					/>
					<BottomNavigationAction
						label='커뮤니티'
						value='community'
						icon={<ForumIcon sx={navActionStyle.icon} />}
						sx={{"& .MuiBottomNavigationAction-label": navActionStyle.label}}
					/>
					<BottomNavigationAction
						label='프로필'
						value='profile'
						icon={<AccountCircleIcon sx={navActionStyle.icon} />}
						sx={{"& .MuiBottomNavigationAction-label": navActionStyle.label}}
					/>
				</BottomNavigation>
			</Box>
			<FCMSetup />
			<Dialog open={createDialogOpen} onClose={handleCloseCreateDialog} fullWidth>
				<DialogTitle sx={{color: "#2e7d32", fontWeight: "bold"}}>챌린지 생성</DialogTitle>
				<DialogContent dividers>
					<TextField
						variant='standard'
						color='success'
						fullWidth
						label='챌린지 제목'
						value={challengeTitle}
						onChange={(e) => setChallengeTitle(e.target.value)}
						margin='dense'
						error={!!validationErrors.title}
						helperText={validationErrors.title}
					/>

					<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
						<Typography mt={2} variant='subtitle1'>
							챌린지 기간
						</Typography>
						<Box display='flex' alignItems='center' gap={1} mt={2}>
							<MobileDatePicker
								value={startDate}
								onChange={(newValue) => setStartDate(newValue)}
								format='yyyy-MM-dd'
								minDate={new Date(Date.now() + 86400000)}
								closeOnSelect
								slotProps={{
									toolbar: {hidden: true},
									actionBar: {actions: []},
									textField: {
										color: "success",
										fullWidth: true,
										variant: "outlined",
										label: "챌린지 시작 날짜",
										error: !!validationErrors.startDate,
										helperText: validationErrors.startDate,
										sx: {
											backgroundColor: "white",
										},
									},
								}}
							/>
							<Typography>~</Typography>
							<MobileDatePicker
								value={endDate}
								onChange={(newValue) => setEndDate(newValue)}
								format='yyyy-MM-dd'
								minDate={startDate}
								closeOnSelect
								slotProps={{
									toolbar: {hidden: true},
									actionBar: {actions: []},
									textField: {
										color: "success",
										fullWidth: true,
										variant: "outlined",
										label: "챌린지 종료 날짜",
										error: !!validationErrors.endDate,
										helperText: validationErrors.endDate,
										sx: {
											backgroundColor: "white",
										},
									},
								}}
							/>
						</Box>
					</LocalizationProvider>

					<Box mt={2}>
						<Typography variant='subtitle1'>챌린지 항목</Typography>
						{showDeleteCheckbox && (
							<FormControlLabel
								control={
									<Checkbox
										checked={items.every((item) => item.checked)}
										onChange={(e) => {
											const checked = e.target.checked;
											setItems((prev) =>
												prev.map((item, index) => ({
													...item,
													checked: index === 0 ? false : checked,
												}))
											);
										}}
										color='error'
									/>
								}
								label='전체 선택'
							/>
						)}
						{items.map((item, index) => (
							<Box key={item.id} display='flex' alignItems='center' gap={1}>
								{showDeleteCheckbox && (
									<Checkbox
										checked={item.checked}
										onChange={(e) =>
											setItems((prev) =>
												prev.map((it) => (it.id === item.id ? {...it, checked: e.target.checked} : it))
											)
										}
										color='error'
									/>
								)}
								<TextField
									variant='outlined'
									color='success'
									size='small'
									fullWidth
									placeholder={`항목 ${index + 1}`}
									value={item.text}
									onChange={(e) =>
										setItems((prev) => prev.map((it) => (it.id === item.id ? {...it, text: e.target.value} : it)))
									}
									error={!!validationErrors.items && !item.text.trim()}
									helperText={!!validationErrors.items && !item.text.trim() ? "챌린지 항목 제목을 입력해주세요." : ""}
								/>
								<FormControlLabel
									sx={{whiteSpace: "nowrap", minWidth: "64px"}}
									labelPlacement='end'
									control={
										<Checkbox
											checked={item.requirePhoto}
											color='success'
											onChange={(e) =>
												setItems((prev) =>
													prev.map((it) => (it.id === item.id ? {...it, requirePhoto: e.target.checked} : it))
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
								setItems((prev) => [...prev, {id: Date.now(), text: "", requirePhoto: false, checked: false}])
							}>
							항목 추가
						</Button>
						{items.length > 1 && (
							<Box display='flex' alignItems='center' gap={1} mt={1}>
								<Button startIcon={<RemoveIcon />} color='error' onClick={() => setShowDeleteCheckbox((prev) => !prev)}>
									항목 삭제
								</Button>
								{showDeleteCheckbox && (
									<Button
										color='error'
										onClick={() =>
											setItems((prev) => {
												const remaining = prev.filter((item) => !item.checked);
												if (remaining.length <= 1) {
													setShowDeleteCheckbox(false);
												}
												return remaining.length === 0 ? prev : remaining;
											})
										}>
										삭제
									</Button>
								)}
							</Box>
						)}
					</Box>

					<FormControlLabel
						control={
							<Checkbox color='success' checked={includeBadge} onChange={(e) => setIncludeBadge(e.target.checked)} />
						}
						label='뱃지 등록'
						sx={{mt: 1}}
					/>
					{includeBadge && (
						<Box mt={1} display='flex' alignItems='center' gap={2}>
							<Button variant='outlined' color='success' onClick={() => badgeInputRef.current?.click()}>
								뱃지 선택
							</Button>
							{badgeImage && (
								<Box
									component='img'
									src={badgeImage}
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
								ref={badgeInputRef}
								type='file'
								accept='image/*'
								hidden
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) {
										setBadgeImage(URL.createObjectURL(file));
									}
								}}
							/>
						</Box>
					)}
				</DialogContent>
				<DialogActions>
					<Button color='success' onClick={handleCloseCreateDialog}>
						취소
					</Button>
					<Button
						variant='contained'
						color='success'
						disabled={createLoading}
						onClick={async () => {
							const newErrors = {};
							if (!challengeTitle.trim()) newErrors.title = "챌린지 제목을 입력해주세요.";
							if (!startDate) newErrors.startDate = "챌린지 시작 날짜를 선택해주세요.";
							if (!endDate) newErrors.endDate = "챌린지 종료 날짜를 선택해주세요.";
							if (items.some((item) => !item.text.trim())) newErrors.items = "모든 챌린지 항목 제목을 입력해주세요.";
							setValidationErrors(newErrors);
							if (Object.keys(newErrors).length > 0) return;
							setCreateLoading(true);
							try {
								let badgeImageUrl = null;
								if (includeBadge && badgeImage) {
									const response = await fetch(badgeImage);
									const blob = await response.blob();
									const file = new File([blob], "badge.png", {type: blob.type});
									const fileName = `badges/badge${Date.now()}.png`;
									badgeImageUrl = await uploadImage(file, fileName);
								}

								const payload = {
									title: challengeTitle,
									description: "",
									start_date: startDate.toISOString().split("T")[0],
									end_date: endDate.toISOString().split("T")[0],
									...(badgeImageUrl && {badge_image: badgeImageUrl}),
									quests: items.map((item) => ({
										title: item.text,
										description: item.text,
										use_camera: item.requirePhoto,
										point: 3,
									})),
								};

								await axiosInstance.post("/users/custom-challenge/", payload);
								alert("커스텀 챌린지가 생성되었습니다.");
								setCustomChallengeChanged((prev) => !prev);
								handleCloseCreateDialog();
							} catch (err) {
								console.error(err);
								alert("커스텀 챌린지를 생성하는데 오류가 발생했습니다.");
							} finally {
								setCreateLoading(false);
							}
						}}>
						{createLoading ? <CircularProgress size={24} color='success' /> : "확인"}
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog open={joinDialogOpen} onClose={() => setJoinDialogOpen(false)} fullWidth>
				<DialogTitle sx={{color: "#2e7d32", fontWeight: "bold"}}>챌린지 참가</DialogTitle>
				<DialogContent dividers>
					<TextField
						variant='standard'
						color='success'
						fullWidth
						label='챌린지 코드'
						value={joinCode}
						onChange={(e) => setJoinCode(e.target.value)}
						margin='dense'
						error={!!joinValidationError}
						helperText={joinValidationError}
					/>
				</DialogContent>
				<DialogActions>
					<Button color='success' onClick={() => setJoinDialogOpen(false)}>
						취소
					</Button>
					<Button
						variant='contained'
						color='success'
						disabled={joinLoading}
						onClick={async () => {
							if (!joinCode.trim()) {
								setJoinValidationError("챌린지 참가 코드를 입력해주세요.");
								return;
							}

							setJoinLoading(true);
							try {
								const response = await axiosInstance.post("/users/custom-challenge/join/", {
									invite_code: joinCode.trim(),
								});
								alert(`${response.data.challenge_title} 챌린지에 참가했습니다!`);
								setCustomChallengeChanged((prev) => !prev);
								setJoinDialogOpen(false);
								setJoinCode("");
								setJoinValidationError("");
							} catch (err) {
								console.error(err);
								const errorMessage = err.response?.data?.detail || "챌린지 참가에 실패했습니다.";
								alert(errorMessage);
							} finally {
								setJoinLoading(false);
							}
						}}>
						{joinLoading ? <CircularProgress size={24} color='success' /> : "확인"}
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				open={deleteDialogOpen}
				onClose={() => {
					setDeleteDialogOpen(false);
					setDeleteChecked({});
				}}
				fullWidth>
				<DialogTitle sx={{color: "#2e7d32", fontWeight: "bold"}}>챌린지 삭제</DialogTitle>
				<DialogContent dividers>
					{myChallenges.map((challenge, index) => (
						<Paper key={challenge.id} sx={{p: 2, mb: 2, borderRadius: "12px"}}>
							<FormControlLabel
								control={
									<Checkbox
										color='success'
										checked={!!deleteChecked[challenge.id]}
										onChange={(e) => setDeleteChecked((prev) => ({...prev, [challenge.id]: e.target.checked}))}
									/>
								}
								label={challenge.title}
							/>
						</Paper>
					))}
				</DialogContent>
				<DialogActions>
					<Button
						color='success'
						onClick={() => {
							setDeleteDialogOpen(false);
							setDeleteChecked({});
						}}>
						취소
					</Button>
					<Button
						variant='contained'
						color='error'
						onClick={async () => {
							const selectedIds = Object.keys(deleteChecked).filter((id) => deleteChecked[id]);
							setDeleteLoading(true);
							try {
								await Promise.all(selectedIds.map((id) => axiosInstance.delete(`/users/custom-challenge/${id}/`)));
								alert("챌린지 삭제가 완료되었습니다.");
								setCustomChallengeChanged((prev) => !prev);
								setDeleteDialogOpen(false);
								setDeleteChecked({});
								setMyChallenges((prev) => prev.filter((c) => !selectedIds.includes(String(c.id))));
							} catch (err) {
								console.error(err);
								alert("챌린지 삭제에 실패했습니다.");
							} finally {
								setDeleteLoading(false);
							}
						}}>
						{deleteLoading ? <CircularProgress size={24} color='inherit' /> : "삭제"}
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};

export default Main;
