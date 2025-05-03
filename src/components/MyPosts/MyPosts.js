import React, {useState, useEffect, useRef} from "react";
import {
	Box,
	Typography,
	TextField,
	InputAdornment,
	List,
	ListItemButton,
	ListItemText,
	Paper,
	Menu,
	MenuItem,
	IconButton,
	Tabs,
	Tab,
} from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SearchIcon from "@mui/icons-material/Search";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {useNavigate} from "react-router-dom";
import styles from "./MyPosts.module.css";
import PullToRefresh from "../PullToRefresh/PullToRefresh";

const tabKeys = ["my", "participated", "scrap"];

const dummyPosts = {
	my: Array.from({length: 10}, (_, i) => {
		const boards = ["캠페인 게시판", "자유 게시판", "정보 게시판"];
		const noticeBoard = boards[i % boards.length];
		const currentParticipants = Math.floor(Math.random() * 10);
		const maxParticipants = currentParticipants + Math.floor(Math.random() * 5) + 1;
		const startDate = new Date(Date.now() + (Math.floor(Math.random() * 7) - 3) * 86400000);
		const endDate = new Date(startDate.getTime() + (Math.floor(Math.random() * 4) + 2) * 86400000);

		return {
			id: i + 1,
			noticeBoard,
			writer: `익명${i + 1}`,
			title: `${noticeBoard} ${i + 1}`,
			content: `내용 테스트`,
			image:
				i % 2 === 0
					? "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=300&h=200"
					: "https://images.unsplash.com/photo-1506765515384-028b60a970df?auto=format&fit=crop&w=300&h=200",
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
};

dummyPosts.participated = dummyPosts.my.filter((p) => p.noticeBoard === "캠페인 게시판");
dummyPosts.scrap = [...dummyPosts.my];

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

const MyPosts = () => {
	const navigate = useNavigate();
	const [posts, setPosts] = useState(dummyPosts);
	const [search, setSearch] = useState("");
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedPostId, setSelectedPostId] = useState(null);
	const [refreshKey, setRefreshKey] = useState(0); // 새로고침 트리거용
	const [tabIndex, setTabIndex] = useState(() => {
		const saved = sessionStorage.getItem("myPostsTabIndex");
		return saved ? Number(saved) : 0;
	});
	const [isVerticalScroll, setIsVerticalScroll] = useState(true);
	const touchStartRef = useRef({x: 0, y: 0});

	useEffect(() => {
		sessionStorage.setItem("myPostsTabIndex", tabIndex);
	}, [tabIndex]);

	const normalize = (str) => str.replace(/\s/g, "").toLowerCase();
	const keyword = normalize(search);

	const handleRefresh = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				setRefreshKey((prev) => prev + 1); // 다시 렌더링
				resolve();
			}, 500);
		});
	};

	const handleOpenMenu = (e, id) => {
		setAnchorEl(e.currentTarget);
		setSelectedPostId(id);
	};

	const handleCloseMenu = () => {
		setAnchorEl(null);
		setSelectedPostId(null);
	};

	const handleDelete = () => {
		setPosts((prev) => {
			const newPosts = {...prev};
			for (const key of ["my", "participated", "scrap"]) {
				newPosts[key] = newPosts[key].filter((p) => p.id !== selectedPostId);
			}
			return newPosts;
		});
		handleCloseMenu();
	};

	const handleEdit = () => {
		let selectedPost = null;
		for (const key of ["my", "participated", "scrap"]) {
			selectedPost = posts[key].find((p) => p.id === selectedPostId);
			if (selectedPost) break;
		}
		const imageArray = selectedPost && selectedPost.image ? [{id: crypto.randomUUID(), url: selectedPost.image}] : [];

		navigate("/post/create", {
			state: {
				post: {
					...selectedPost,
					images: imageArray,
				},
			},
		});
		handleCloseMenu();
	};

	const filteredPosts = {
		my: posts.my.filter((p) => {
			const title = normalize(p.title);
			const content = normalize(p.content);
			return title.includes(keyword) || content.includes(keyword);
		}),
		participated: posts.participated.filter((p) => {
			const title = normalize(p.title);
			const content = normalize(p.content);
			return title.includes(keyword) || content.includes(keyword);
		}),
		scrap: posts.scrap.filter((p) => {
			const title = normalize(p.title);
			const content = normalize(p.content);
			return title.includes(keyword) || content.includes(keyword);
		}),
	};

	const handleTouchHold = (e, postId) => {
		const timeoutId = setTimeout(() => {
			// 진동 지원 여부 확인
			if (navigator.vibrate) {
				navigator.vibrate(50); // 50ms 진동
			}
			handleOpenMenu(e, postId);
		}, 500);

		// 600ms 전에 손 떼면 취소
		const cancel = () => clearTimeout(timeoutId);

		e.target.addEventListener("touchend", cancel, {once: true});
		e.target.addEventListener("touchmove", cancel, {once: true});
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

	return (
		<Box className={styles.container}>
			{/* Header */}
			<Box className={styles.header}>
				<IconButton onClick={() => navigate(-1)} sx={{padding: "0px"}}>
					<ArrowBackIosNewIcon />
				</IconButton>
				<Typography className={styles.boardTitle}>내 게시글</Typography>
			</Box>

			<Tabs
				value={tabIndex}
				onChange={(e, newValue) => {
					setTabIndex(newValue);
					setSearch("");
				}}
				variant='fullWidth'
				indicatorColor='primary'
				textColor='inherit'
				sx={{marginTop: 2}}>
				<Tab label='내 게시글' />
				<Tab label='참여 캠페인' />
				<Tab label='스크랩' />
			</Tabs>
			<Box sx={{marginTop: "20px"}}>
				<TextField
					fullWidth
					size='small'
					placeholder='제목 또는 내용을 검색하세요'
					color='success'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
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
						onChangeIndex={setTabIndex}
						enableMouseEvents
						resistance
						disableLazyLoading
						disableDiscovery
						hysteresis={0.3}
						style={{flex: 1}}
						animateHeight>
						{tabKeys.map((key) => (
							<Box key={key} className={styles.scrollWrapper}>
								<List className={styles.list}>
									{filteredPosts[key].map((post) => (
										<Paper key={post.id} elevation={3} className={styles.paperItem}>
											<Box
												onClick={() =>
													navigate(`/post/${post.id}`, {
														state: {
															post,
															fromMyPosts: true,
														},
													})
												}
												onContextMenu={(e) => {
													e.preventDefault();
													handleOpenMenu(e, post.id);
												}}
												onTouchStart={(e) => handleTouchHold(e, post.id)}>
												<ListItemButton onClick={(e) => handleOpenMenu(e, post.id)}>
													<Box display='flex' justifyContent='space-between' width='100%' alignItems='center'>
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
														{post.image && (
															<Box
																component='img'
																src={post.image}
																alt='post thumbnail'
																sx={{
																	width: 80,
																	height: 60,
																	objectFit: "cover",
																	borderRadius: "8px",
																	marginLeft: 1,
																}}
															/>
														)}
													</Box>
												</ListItemButton>
											</Box>
										</Paper>
									))}
								</List>
							</Box>
						))}
					</SwipeableViews>
				</Box>
			</PullToRefresh>

			{/* Context Menu */}
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleCloseMenu}
				anchorOrigin={{vertical: "bottom", horizontal: "right"}}
				transformOrigin={{vertical: "top", horizontal: "right"}}>
				<MenuItem onClick={handleEdit}>수정</MenuItem>
				<MenuItem onClick={handleDelete}>삭제</MenuItem>
			</Menu>
		</Box>
	);
};

export default MyPosts;
