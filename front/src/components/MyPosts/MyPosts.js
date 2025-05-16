import React, {useState, useEffect, useRef} from "react";
import axiosInstance from "../../axiosInstance";
import {
	Box,
	Typography,
	TextField,
	InputAdornment,
	List,
	ListItemButton,
	ListItemText,
	Paper,
	IconButton,
	Tabs,
	Tab,
	CircularProgress,
} from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SearchIcon from "@mui/icons-material/Search";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import {useNavigate} from "react-router-dom";
import styles from "./MyPosts.module.css";
import PullToRefresh from "../PullToRefresh/PullToRefresh";

const tabKeys = ["my", "participated", "scrap"];

const dummyPosts = {my: [], participated: [], scrap: []};

const formatTime = (createdAt) => {
	const now = new Date();
	const diff = now - createdAt;

	const minute = 60 * 1000;
	const hour = 60 * minute;

	if (diff < minute) return "방금";
	if (diff < hour) return `${Math.floor(diff / minute)}분 전`;
	if (createdAt.toDateString() === now.toDateString()) return createdAt.toTimeString().slice(0, 5);

	const isSameYear = createdAt.getFullYear() === now.getFullYear();

	if (isSameYear) {
		// 같은 해면 MM/DD
		const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
		const dd = String(createdAt.getDate()).padStart(2, "0");
		return `${mm}/${dd}`;
	} else {
		// 작년 이전이면 YY/MM/DD
		const yy = String(createdAt.getFullYear()).slice(2);
		const mm = String(createdAt.getMonth() + 1).padStart(2, "0");
		const dd = String(createdAt.getDate()).padStart(2, "0");
		return `${yy}/${mm}/${dd}`;
	}
};

const MyPosts = () => {
	const navigate = useNavigate();
	const [posts, setPosts] = useState({my: [], participated: [], scrap: []});
	const [search, setSearch] = useState("");
	const [refreshKey, setRefreshKey] = useState(0); // 새로고침 트리거용
	const [tabIndex, setTabIndex] = useState(() => {
		const saved = sessionStorage.getItem("myPostsTabIndex");
		return saved ? Number(saved) : 0;
	});
	const [isVerticalScroll, setIsVerticalScroll] = useState(true);
	const touchStartRef = useRef({x: 0, y: 0});
	const [nextPageUrl, setNextPageUrl] = useState({my: null, participated: null, scrap: null});
	const [loadingMore, setLoadingMore] = useState(false);
	const [initialLoading, setInitialLoading] = useState(false);

	const scrollRef = useRef(null);

	useEffect(() => {
		const fetchMyPosts = async () => {
			try {
				setInitialLoading(true);
				const res = await axiosInstance.get("/users/community/posts/?&mine=true&page=1");
				setPosts((prev) => ({...prev, my: res.data.results}));
				setNextPageUrl((prev) => ({...prev, my: res.data.next}));
			} catch (err) {
				console.error(err);
			} finally {
				setInitialLoading(false);
			}
		};
		const fetchParticipatedPosts = async () => {
			try {
				const res = await axiosInstance.get("/users/community/posts/campaigns_joined/");
				setPosts((prev) => ({...prev, participated: res.data.results}));
				setNextPageUrl((prev) => ({...prev, participated: res.data.next}));
			} catch (err) {
				console.error(err);
			}
		};
		const fetchScrappedPosts = async () => {
			try {
				const res = await axiosInstance.get("/users/community/posts/scrapped/");
				setPosts((prev) => ({...prev, scrap: res.data.results}));
				setNextPageUrl((prev) => ({...prev, scrap: res.data.next}));
			} catch (err) {
				console.error(err);
			}
		};
		fetchMyPosts();
		fetchParticipatedPosts();
		fetchScrappedPosts();
	}, []);

	useEffect(() => {
		sessionStorage.setItem("myPostsTabIndex", tabIndex);
	}, [tabIndex]);

	const normalize = (str) => (str || "").replace(/\s/g, "").toLowerCase();
	const keyword = normalize(search);

	const handleRefresh = async () => {
		const key = tabKeys[tabIndex];
		try {
			if (key === "my") {
				const res = await axiosInstance.get("/users/community/posts/?&mine=true&page=1");
				await new Promise((resolve) => setTimeout(resolve, 500));
				setPosts((prev) => ({...prev, my: res.data.results}));
				setNextPageUrl((prev) => ({...prev, my: res.data.next}));
			} else if (key === "scrap") {
				const res = await axiosInstance.get("/users/community/posts/scrapped/");
				await new Promise((resolve) => setTimeout(resolve, 500));
				setPosts((prev) => ({...prev, scrap: res.data.results}));
				setNextPageUrl((prev) => ({...prev, scrap: res.data.next}));
			} else {
				const res = await axiosInstance.get(`/users/community/posts/campaigns_joined/`);
				await new Promise((resolve) => setTimeout(resolve, 500));
				setPosts((prev) => ({...prev, participated: res.data.results}));
				setNextPageUrl((prev) => ({...prev, participated: res.data.next}));
			}
		} catch (err) {
			console.error(err);
		}
	};

	const filteredPosts = {
		my: posts.my.filter((p) => {
			const title = normalize(p.title);
			const content = normalize(p.excerpt || p.content);
			return title.includes(keyword) || content.includes(keyword);
		}),
		participated: posts.participated.filter((p) => {
			const title = normalize(p.title);
			const content = normalize(p.excerpt || p.content);
			return title.includes(keyword) || content.includes(keyword);
		}),
		scrap: posts.scrap.filter((p) => {
			const title = normalize(p.title);
			const content = normalize(p.excerpt || p.content);
			return title.includes(keyword) || content.includes(keyword);
		}),
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

	useEffect(() => {
		const currentListWrapper = document.querySelectorAll(`.${styles.listWrapper}`)[tabIndex];
		if (!currentListWrapper) return;

		let isFetching = false;

		const handleScroll = () => {
			if (currentListWrapper.scrollTop + currentListWrapper.clientHeight >= currentListWrapper.scrollHeight - 100) {
				const key = tabKeys[tabIndex];
				const nextUrl = nextPageUrl[key];
				if (nextUrl && !loadingMore && !isFetching) {
					isFetching = true;
					setLoadingMore(true);
					const start = Date.now();
					axiosInstance
						.get(nextUrl)
						.then((res) => {
							const elapsed = Date.now() - start;
							const delay = Math.max(0, 800 - elapsed);
							setTimeout(() => {
								setPosts((prev) => ({
									...prev,
									[key]: [...prev[key], ...res.data.results],
								}));
								setNextPageUrl((prev) => ({...prev, [key]: res.data.next}));
								setLoadingMore(false);
								isFetching = false;
							}, delay);
						})
						.catch((err) => {
							console.error(err);
							setLoadingMore(false);
							isFetching = false;
						});
				}
			}
		};

		currentListWrapper.addEventListener("scroll", handleScroll);
		return () => currentListWrapper.removeEventListener("scroll", handleScroll);
	}, [tabIndex, nextPageUrl, loadingMore]);

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
				<Box
					className={styles.swipeWrapper}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					ref={scrollRef}>
					<SwipeableViews
						className={styles.swipeWrapper}
						index={tabIndex}
						onChangeIndex={setTabIndex}
						enableMouseEvents
						resistance
						disableLazyLoading
						disableDiscovery
						hysteresis={0.3}
						style={{flex: 1}}
						autoHeight
						animateHeight>
						{tabKeys.map((key) => (
							<Box key={key} className={styles.listWrapper}>
								<List className={styles.list}>
									{initialLoading ? (
										<Box textAlign='center' py={5}>
											<CircularProgress color='success' />
										</Box>
									) : (
										<>
											{filteredPosts[key].map((post) => {
												let thumbnailUrl;
												try {
													if (typeof post.thumbnail_image === "string") {
														const parsed = JSON.parse(post.thumbnail_image.replace(/'/g, '"'));
														thumbnailUrl = parsed.image_url;
													} else if (typeof post.thumbnail_image === "object" && post.thumbnail_image?.image_url) {
														thumbnailUrl = post.thumbnail_image.image_url;
													}
												} catch (e) {
													console.error("썸네일 파싱 오류:", e);
												}
												return (
													<Paper key={post.id} elevation={3} className={styles.paperItem}>
														<Box
															onClick={() =>
																navigate(`/post/${post.id}`, {
																	state: {
																		post,
																		fromMyPosts: true,
																	},
																})
															}>
															<ListItemButton>
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
																					{post.excerpt || post.content}
																				</Typography>

																				{/* 캠페인 게시판일 때 */}
																				{post.post_type === "campaign" ? (
																					<>
																						<Box display='flex' gap={2} mt={1} alignItems='center'>
																							<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#4caf50"}}>
																								<GroupsIcon fontSize='small' />
																								<Typography variant='caption'>
																									{post.current_participant_count} / {post.participant_limit}
																								</Typography>
																							</Box>
																							<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#f28b82"}}>
																								<ThumbUpOffAltIcon fontSize='small' />
																								<Typography variant='caption'>{post.like_count}</Typography>
																							</Box>
																							<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#64b5f6"}}>
																								<ChatIcon fontSize='small' />
																								<Typography variant='caption'>{post.comment_count}</Typography>
																							</Box>
																						</Box>
																						<Box>
																							<Typography variant='caption' color='text.secondary'>
																								{formatTime(new Date(post.created_at))}
																							</Typography>
																						</Box>
																					</>
																				) : (
																					<Box display='flex' gap={2} mt={1} alignItems='center'>
																						<Typography variant='caption' color='text.secondary'>
																							{formatTime(new Date(post.created_at))}
																						</Typography>
																						<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#f28b82"}}>
																							<ThumbUpOffAltIcon fontSize='small' />
																							<Typography variant='caption'>{post.like_count}</Typography>
																						</Box>
																						<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#64b5f6"}}>
																							<ChatIcon fontSize='small' />
																							<Typography variant='caption'>{post.comment_count}</Typography>
																						</Box>
																					</Box>
																				)}
																			</>
																		}
																	/>
																	{thumbnailUrl && (
																		<Box
																			component='img'
																			src={thumbnailUrl}
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
												);
											})}
											{loadingMore && (
												<Box textAlign='center' py={2}>
													<CircularProgress color='success' />
												</Box>
											)}
										</>
									)}
								</List>
							</Box>
						))}
					</SwipeableViews>
				</Box>
			</PullToRefresh>
		</Box>
	);
};

export default MyPosts;
