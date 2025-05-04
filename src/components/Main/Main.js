import React from "react";
import {Box, AppBar, Toolbar, Typography, BottomNavigation, BottomNavigationAction} from "@mui/material";
import {useNavigate, useLocation, Routes, Route} from "react-router-dom";
import {useDispatch} from "react-redux";
import HomeIcon from "@mui/icons-material/Home";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ForumIcon from "@mui/icons-material/Forum";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PortraitOutlinedIcon from "@mui/icons-material/PortraitOutlined";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import styles from "./Main.module.css";
import Home from "../Home/Home";
import Challenge from "../Challenge/Challenge";
import Community from "../Community/Community";
import Profile from "../Profile/Profile";
import "../../global.css";

const Main = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const currentPath = location.pathname.replace("/main/", "") || "home";

	const dispatch = useDispatch();

	const navActionStyle = {
		icon: {fontSize: 20}, // 아이콘 사이즈
		label: {fontSize: "11px"}, // 라벨 텍스트
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
			</>
		);
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
					<Route path='home' element={<Home />} />
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
		</Box>
	);
};

export default Main;
