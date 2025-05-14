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
	CircularProgress,
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
import axiosInstance from "../../axiosInstance";

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

const tabKeys = ["campaign", "free", "info"];

const Community = () => {
	const navigate = useNavigate();
	const [tabIndex, setTabIndex] = useState(() => {
		const saved = sessionStorage.getItem("communityTabIndex");
		return saved ? Number(saved) : 0;
	});
	const [searchKeyword, setSearchKeyword] = useState("");
	const [refreshKey, setRefreshKey] = useState(0); // 새로고침용 키

	const [initialLoading, setInitialLoading] = useState(false);

	const normalize = (str) => str.replace(/\s/g, "").toLowerCase();
	const keyword = normalize(searchKeyword);
	const [isVerticalScroll, setIsVerticalScroll] = useState(true);
	const touchStartRef = useRef({x: 0, y: 0});
	const swipeWrapperRef = useRef(null);
	const scrollTimeoutRef = useRef(null);
	const isFetchingRef = useRef(false);

	const [postData, setPostData] = useState({campaign: [], free: [], info: []});
	const [nextPageUrl, setNextPageUrl] = useState({campaign: null, free: null, info: null});
	const [loadingMore, setLoadingMore] = useState(false);

	useEffect(() => {
		const fetchPosts = async () => {
			const post_type = tabKeys[tabIndex];
			try {
				setInitialLoading(true);
				const res = await axiosInstance.get(`/users/community/posts/?post_type=${post_type}&page=1`);
				setPostData((prev) => ({...prev, [post_type]: res.data.results}));
				setNextPageUrl((prev) => ({...prev, [post_type]: res.data.next}));
			} catch (err) {
				console.error(err);
			} finally {
				setInitialLoading(false);
			}
		};
		fetchPosts();
	}, [tabIndex]);

	useEffect(() => {
		const handleScroll = async (e) => {
			const el = e.target;

			if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

			if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
				const post_type = tabKeys[tabIndex];
				const nextUrl = nextPageUrl[post_type];
				if (nextUrl && !loadingMore && !isFetchingRef.current) {
					isFetchingRef.current = true;
					setLoadingMore(true);
					const start = Date.now();
					axiosInstance
						.get(nextUrl)
						.then((res) => {
							const elapsed = Date.now() - start;
							const delay = Math.max(0, 800 - elapsed);
							setTimeout(() => {
								setPostData((prev) => ({
									...prev,
									[post_type]: [...prev[post_type], ...res.data.results],
								}));
								setNextPageUrl((prev) => ({...prev, [post_type]: res.data.next}));
								setLoadingMore(false);
								isFetchingRef.current = false;
							}, delay);
						})
						.catch((err) => {
							console.error(err);
							setLoadingMore(false);
							isFetchingRef.current = false;
						});
				}
			}
		};

		const currentListWrapper = document.querySelectorAll(`.${styles.listWrapper}`)[tabIndex];
		if (currentListWrapper) {
			currentListWrapper.addEventListener("scroll", handleScroll);
			return () => currentListWrapper.removeEventListener("scroll", handleScroll);
		}
	}, [tabIndex, nextPageUrl, loadingMore]);

	const filteredPosts = {
		campaign: postData.campaign.filter((p) => {
			const title = normalize(p.title || "");
			const content = normalize(p.content || p.excerpt || "");
			return title.includes(keyword) || content.includes(keyword);
		}),
		free: postData.free.filter((p) => {
			const title = normalize(p.title || "");
			const content = normalize(p.content || p.excerpt || "");
			return title.includes(keyword) || content.includes(keyword);
		}),
		info: postData.info.filter((p) => {
			const title = normalize(p.title || "");
			const content = normalize(p.content || p.excerpt || "");
			return title.includes(keyword) || content.includes(keyword);
		}),
	};

	const handleRefresh = async () => {
		const post_type = tabKeys[tabIndex];
		try {
			const res = await axiosInstance.get(`/users/community/posts/?post_type=${post_type}&page=1`);
			await new Promise((resolve) => setTimeout(resolve, 500)); // 0.5초 대기
			setPostData((prev) => ({...prev, [post_type]: res.data.results}));
			setNextPageUrl((prev) => ({...prev, [post_type]: res.data.next}));
		} catch (err) {
			console.error(err);
		}
	};

	const handleChange = (event, newValue) => {
		setTabIndex(newValue);
		setSearchKeyword("");
		sessionStorage.setItem("communityTabIndex", newValue);
		if (swipeWrapperRef.current) {
			swipeWrapperRef.current.scrollTo({top: 0});
		}
	};

	const handleSwipe = (index) => {
		setTabIndex(index);
		setSearchKeyword("");
		sessionStorage.setItem("communityTabIndex", index);
		if (swipeWrapperRef.current) {
			swipeWrapperRef.current.scrollTo({top: 0});
		}
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
				<Box
					className={styles.swipeWrapper}
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					ref={swipeWrapperRef}>
					<SwipeableViews
						className={styles.swipeWrapper}
						index={tabIndex}
						onChangeIndex={handleSwipe}
						enableMouseEvents
						resistance
						disableLazyLoading
						disableDiscovery
						hysteresis={0.3}
						autoHeight
						animateHeight>
						{tabKeys.map((key) => (
							<Box key={key} className={styles.listWrapper}>
								<List className={styles.list}>
									{initialLoading ? (
										<Box textAlign='center' py={5}>
											<CircularProgress color='success' />
										</Box>
									) : postData[key].length === 0 ? null : (
										<>
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
																		{post.content || post.excerpt || ""}
																	</Typography>

																	{/* 캠페인 게시판일 때 */}
																	{post.post_type === "campaign" ? (
																		<>
																			<Box display='flex' gap={2} mt={1} alignItems='center'>
																				<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#4caf50"}}>
																					<GroupsIcon fontSize='small' />
																					<Typography variant='caption'>
																						{post.current_participant_count || 0} / {post.participant_limit || 0}
																					</Typography>
																				</Box>
																				<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#f28b82"}}>
																					<ThumbUpOffAltIcon fontSize='small' />
																					<Typography variant='caption'>{post.like_count || 0}</Typography>
																				</Box>
																				<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#64b5f6"}}>
																					<ChatIcon fontSize='small' />
																					<Typography variant='caption'>{post.comment_count || 0}</Typography>
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
																				<Typography variant='caption'>{post.like_count || 0}</Typography>
																			</Box>
																			<Box display='flex' alignItems='center' gap={0.5} sx={{color: "#64b5f6"}}>
																				<ChatIcon fontSize='small' />
																				<Typography variant='caption'>{post.comment_count || 0}</Typography>
																			</Box>
																		</Box>
																	)}
																</>
															}
														/>

														{/* 썸네일 이미지 */}
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

			<Fab
				variant='extended'
				color='success'
				aria-label='글쓰기'
				className={styles.fab}
				onClick={() => {
					const boardNameMap = {
						campaign: "캠페인 게시판",
						free: "자유 게시판",
						info: "정보 게시판",
					};
					navigate("/post/create", {
						state: {noticeBoard: boardNameMap[tabKeys[tabIndex]]},
					});
				}}>
				<EditIcon sx={{mr: 1}} />
				글쓰기
			</Fab>
		</Box>
	);
};

export default Community;
