import React, {useState} from "react";
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
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import SearchIcon from "@mui/icons-material/Search";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ChatIcon from "@mui/icons-material/Chat";
import GroupsIcon from "@mui/icons-material/Groups";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {useNavigate} from "react-router-dom";
import styles from "./MyPosts.module.css";
import PullToRefresh from "../PullToRefresh/PullToRefresh";

const dummyPosts = {
	my: Array.from({length: 10}, (_, i) => {
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
			content: `참여만 해도 상품이 제공됩니다.\n참여하실 분은 댓글 남겨주세요.`,
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
	const [posts, setPosts] = useState(dummyPosts.my);
	const [search, setSearch] = useState("");
	const [anchorEl, setAnchorEl] = useState(null);
	const [selectedPostId, setSelectedPostId] = useState(null);
	const [refreshKey, setRefreshKey] = useState(0); // 새로고침 트리거용

	const normalize = (str) => str.replace(/\s/g, "").toLowerCase();
	const keyword = normalize(search);

	const handleRefresh = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				setRefreshKey((prev) => prev + 1); // 다시 렌더링
				resolve();
			}, 1000);
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
		setPosts((prev) => prev.filter((p) => p.id !== selectedPostId));
		handleCloseMenu();
	};

	const handleEdit = () => {
		const selectedPost = posts.find((p) => p.id === selectedPostId);
		const imageArray = selectedPost.image ? [{id: crypto.randomUUID(), url: selectedPost.image}] : [];

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

	const filtered = posts.filter((p) => {
		const title = normalize(p.title);
		const content = normalize(p.content);
		return title.includes(keyword) || content.includes(keyword);
	});

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

	return (
		<Box className={styles.container}>
			{/* Header */}
			<Box className={styles.header}>
				<IconButton onClick={() => navigate(-1)} sx={{padding: "0px"}}>
					<ArrowBackIosNewIcon />
				</IconButton>
				<Typography className={styles.boardTitle}>내 게시글</Typography>
			</Box>

			{/* Search */}
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

			{/* Post List - Scrollable Section */}
			<PullToRefresh onRefresh={handleRefresh}>
				<Box className={styles.scrollWrapper}>
					<List className={styles.list}>
						{filtered.map((post) => (
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
