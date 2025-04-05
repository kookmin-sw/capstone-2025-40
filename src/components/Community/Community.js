import React, {useState, useEffect, useRef} from "react";
import {
	Box,
	Tabs,
	Tab,
	Typography,
	List,
	ListItemButton,
	ListItemText,
	Fab,
	Paper,
	TextField,
	InputAdornment,
} from "@mui/material";
import PullToRefresh from "../PullToRefresh/PullToRefresh";
import EditIcon from "@mui/icons-material/Edit";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import SwipeableViews from "react-swipeable-views";
import SearchIcon from "@mui/icons-material/Search";
import styles from "./Community.module.css";
import {useNavigate} from "react-router-dom";

const campaignImages = [
	"https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=300&h=200",
	"https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=300&h=200",
	"https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?auto=format&fit=crop&w=300&h=200",
];

const freeImages = [
	"https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=300&h=200",
	"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=300&h=200",
	"https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=300&h=200",
];

const infoImages = [
	"https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=300&h=200",
	"https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=300&h=200",
	"https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=300&h=200",
];

const posts = {
	campaign: Array.from({length: 10}, (_, i) => {
		const currentParticipants = Math.floor(Math.random() * 10); // 0~10
		const maxParticipants = currentParticipants + Math.floor(Math.random() * 5) + 1;

		// 캠페인 시작일: 오늘부터 -3일 ~ +3일 사이
		const startDate = new Date(Date.now() + (Math.floor(Math.random() * 7) - 3) * 24 * 60 * 60 * 1000);
		// 캠페인 종료일: 시작일 + 2~5일 사이
		const endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 4) + 2) * 24 * 60 * 60 * 1000);

		return {
			id: i + 1,
			noticeBoard: "캠페인 게시판",
			writer: `익명${i + 1}`,
			title: `그린 캠페인 ${i + 1}차 모집`,
			content: `참여만 해도 상품이 제공됩니다. \n참여하실 분은 댓글 남겨주세요.`,
			image: campaignImages[Math.floor(Math.random() * campaignImages.length)],
			createdAt: new Date(Date.now() - 1000 * 60 * 5 * i),
			likes: Math.floor(Math.random() * 20),
			comments: Math.floor(Math.random() * 10),
			scrap: Math.floor(Math.random() * 10),
			currentParticipants,
			maxParticipants,
			startDate,
			endDate,
			location: "서울시 성북구",
		};
	}),

	free: Array.from({length: 10}, (_, i) => ({
		id: i + 101,
		noticeBoard: "자유 게시판",
		writer: `익명${i + 1}`,
		title: `자유 게시글 ${i + 1}`,
		content: `오늘은 이런저런 일이 있었어요. #자유글${i + 1}`,
		image: freeImages[Math.floor(Math.random() * freeImages.length)],
		createdAt: new Date(Date.now() - 1000 * 60 * 10 * i),
		likes: Math.floor(Math.random() * 10),
		comments: Math.floor(Math.random() * 5),
		scrap: Math.floor(Math.random() * 10),
	})),

	info: Array.from({length: 10}, (_, i) => ({
		id: i + 201,
		noticeBoard: "정보 게시판",
		writer: `익명${i + 1}`,
		title: `환경 정보 ${i + 1}탄`,
		content: `환경을 지키는 ${i + 1}가지 방법을 알아보세요.`,
		image: infoImages[Math.floor(Math.random() * infoImages.length)],
		createdAt: new Date(Date.now() - 1000 * 60 * 3 * i),
		likes: Math.floor(Math.random() * 15),
		comments: Math.floor(Math.random() * 8),
		scrap: Math.floor(Math.random() * 10),
	})),
};

const formatTime = (createdAt) => {
	const now = new Date();
	const diff = now - createdAt;

	const minute = 60 * 1000;
	const hour = 60 * minute;

	if (diff < minute) return "방금";
	if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
	if (createdAt.toDateString() === now.toDateString()) return createdAt.toTimeString().slice(0, 5);
	return createdAt.toLocaleDateString("ko-KR", {year: "2-digit", month: "2-digit", day: "2-digit"});
};

const tabKeys = ["campaign", "free", "info"];

const Community = () => {
	const navigate = useNavigate();
	const [tabIndex, setTabIndex] = useState(() => {
		const saved = sessionStorage.getItem("communityTabIndex");
		return saved ? Number(saved) : 0;
	});
	const [searchKeyword, setSearchKeyword] = useState("");
	const [refreshKey, setRefreshKey] = useState(0); // 새로고침용 키

	const normalize = (str) => str.replace(/\s/g, "").toLowerCase();
	const keyword = normalize(searchKeyword);
	const [isVerticalScroll, setIsVerticalScroll] = useState(true);
	const touchStartRef = useRef({x: 0, y: 0});

	const filteredPosts = {
		campaign: posts.campaign.filter((p) => {
			const title = normalize(p.title);
			const content = normalize(p.content);
			return title.includes(keyword) || content.includes(keyword);
		}),
		free: posts.free.filter((p) => {
			const title = normalize(p.title);
			const content = normalize(p.content);
			return title.includes(keyword) || content.includes(keyword);
		}),
		info: posts.info.filter((p) => {
			const title = normalize(p.title);
			const content = normalize(p.content);
			return title.includes(keyword) || content.includes(keyword);
		}),
	};

	const handleRefresh = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				setRefreshKey((prev) => prev + 1); // 새로고침 트리거
				resolve();
			}, 1000); // 1초 후 리프레시 완료
		});
	};

	const handleChange = (event, newValue) => {
		setTabIndex(newValue);
		setSearchKeyword(""); // 탭 전환 시 검색어 초기화
		sessionStorage.setItem("communityTabIndex", newValue);
	};

	const handleSwipe = (index) => {
		setTabIndex(index);
		setSearchKeyword(""); // 스와이프 시 검색어 초기화
		sessionStorage.setItem("communityTabIndex", index);
	};

	const handleTouchStart = (e) => {
		const touch = e.touches[0];
		touchStartRef.current = {x: touch.clientX, y: touch.clientY};
	};

	const handleTouchMove = (e) => {
		const touch = e.touches[0];
		const dx = Math.abs(touch.clientX - touchStartRef.current.x);
		const dy = Math.abs(touch.clientY - touchStartRef.current.y);
		setIsVerticalScroll(dy > dx);
	};

	const handlePostClick = (post) => {
		navigate(`/post/${post.id}`, {state: {post}});
	};

	return (
		<Box className={styles.container}>
			<Box className={styles.tabHeader}>
				<Tabs value={tabIndex} onChange={handleChange} variant='fullWidth' indicatorColor='primary' textColor='inherit'>
					<Tab label='캠페인' sx={{fontWeight: "bold", color: "#388e3c"}} />
					<Tab label='자유 게시판' sx={{fontWeight: "bold", color: "#388e3c"}} />
					<Tab label='정보 게시판' sx={{fontWeight: "bold", color: "#388e3c"}} />
				</Tabs>
			</Box>

			<Box sx={{marginTop: "20px"}}>
				<TextField
					fullWidth
					size='small'
					placeholder='제목 또는 내용을 검색하세요'
					color='success'
					value={searchKeyword}
					onChange={(e) => setSearchKeyword(e.target.value)}
					InputProps={{
						startAdornment: (
							<InputAdornment position='start'>
								<SearchIcon color='action' />
							</InputAdornment>
						),
					}}
					variant='outlined'
				/>
			</Box>
			<PullToRefresh onRefresh={handleRefresh} disabled={!isVerticalScroll}>
				<Box className={styles.swipeWrapper} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
					<SwipeableViews
						index={tabIndex}
						onChangeIndex={handleSwipe}
						enableMouseEvents
						resistance
						disableLazyLoading
						disableDiscovery
						hysteresis={0.3}
						style={{flex: 1}}>
						{tabKeys.map((key) => (
							<Box key={key} className={styles.listWrapper}>
								<List className={styles.list}>
									{filteredPosts[key].map((post) => (
										<Paper key={post.id} elevation={3} className={styles.paperItem}>
											<ListItemButton
												onClick={() => handlePostClick(post)}
												sx={{display: "flex", justifyContent: "space-between"}}>
												<ListItemText
													className={styles.textWrapper}
													primary={
														<Typography
															variant='subtitle1'
															className={styles.ellipsis}
															sx={{color: "#388e3c", fontWeight: "bold"}}>
															{post.title}
														</Typography>
													}
													secondary={
														<>
															<Typography variant='body2' color='text.secondary' className={styles.ellipsis}>
																{post.content}
															</Typography>

															{/* 캠페인 게시판일 때 */}
															{post.noticeBoard === "캠페인 게시판" ? (
																<>
																	<Box display='flex' gap={2} mt={1} alignItems='center'>
																		<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#4caf50"}}>
																			<GroupsIcon fontSize='small' />
																			<Typography variant='caption'>
																				{post.currentParticipants} / {post.maxParticipants}
																			</Typography>
																		</Box>
																		<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#f28b82"}}>
																			<ThumbUpOffAltIcon fontSize='small' />
																			<Typography variant='caption'>{post.likes}</Typography>
																		</Box>
																		<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#64b5f6"}}>
																			<ChatIcon fontSize='small' />
																			<Typography variant='caption'>{post.comments}</Typography>
																		</Box>
																	</Box>
																	<Box>
																		<Typography variant='caption' color='text.secondary'>
																			{formatTime(new Date(post.createdAt))}
																		</Typography>
																	</Box>
																</>
															) : (
																<Box display='flex' gap={2} mt={1} alignItems='center'>
																	<Typography variant='caption' color='text.secondary'>
																		{formatTime(new Date(post.createdAt))}
																	</Typography>
																	<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#f28b82"}}>
																		<ThumbUpOffAltIcon fontSize='small' />
																		<Typography variant='caption'>{post.likes}</Typography>
																	</Box>
																	<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#64b5f6"}}>
																		<ChatIcon fontSize='small' />
																		<Typography variant='caption'>{post.comments}</Typography>
																	</Box>
																</Box>
															)}
														</>
													}
												/>

												{/* ✅ 썸네일 이미지 */}
												{post.image && (
													<Box sx={{minWidth: 80, minHeight: 60, ml: 1}}>
														<img
															src={post.image}
															alt='썸네일'
															style={{
																width: 80,
																height: 60,
																objectFit: "cover",
																borderRadius: "8px",
															}}
														/>
													</Box>
												)}
											</ListItemButton>
										</Paper>
									))}
								</List>
							</Box>
						))}
					</SwipeableViews>
				</Box>
			</PullToRefresh>

			<Fab
				variant='extended'
				color='success'
				aria-label='글쓰기'
				className={styles.fab}
				onClick={() =>
					navigate("/post/create", {
						state: {noticeBoard: tabKeys[tabIndex] === "campaign" ? "캠페인 게시판" : undefined},
					})
				}>
				<EditIcon sx={{mr: 1}} />
				글쓰기
			</Fab>
		</Box>
	);
};

export default Community;
