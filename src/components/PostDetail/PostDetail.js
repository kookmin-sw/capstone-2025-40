import React, {useState, useRef, useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Box, Typography, IconButton, TextField, Button, Menu, MenuItem} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpAltIcon from "@mui/icons-material/ThumbUpAlt";
import ChatIcon from "@mui/icons-material/Chat";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import styles from "./PostDetail.module.css";
import PullToRefresh from "../PullToRefresh/PullToRefresh";

const formatTime = (createdAt) => {
	const now = new Date();
	const date = new Date(createdAt);

	const year = date.getFullYear();
	const isThisYear = year === now.getFullYear();

	const twoDigit = (n) => n.toString().padStart(2, "0");
	const month = twoDigit(date.getMonth() + 1);
	const day = twoDigit(date.getDate());
	const time = `${twoDigit(date.getHours())}:${twoDigit(date.getMinutes())}`;

	if (isThisYear) {
		return `${month}/${day} ${time}`;
	} else {
		return `${String(year).slice(2)}/${month}/${day} ${time}`;
	}
};

const formatDateOnly = (date) => {
	const d = new Date(date);
	const yyyy = d.getFullYear();
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const dd = String(d.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
};

const PostDetail = () => {
	const navigate = useNavigate();
	const {state} = useLocation();
	const post = state?.post;
	const isInitialMount = useRef(true);
	const [hasNewComment, setHasNewComment] = useState(false);
	const scrollableContentRef = useRef(null);
	const [refreshKey, setRefreshKey] = useState(0); // 새로고침 트리거

	const [comments, setComments] = useState([
		{
			id: 1,
			nickname: "익명1",
			likes: 3,
			text: "제가 참여하겠습니다!",
			timestamp: new Date(),
			replies: [
				{
					id: 11,
					nickname: "익명 (글쓴이)",
					likes: 3,
					text: "감사합니다!",
					timestamp: new Date(),
				},
			],
		},
		{
			id: 2,
			nickname: "익명2",
			likes: 2,
			text: "저도 참여할래요!!",
			timestamp: new Date(),
			replies: [],
		},
		{
			id: 3,
			nickname: "익명2",
			likes: 0,
			text: "저도 참여할래요!!",
			timestamp: new Date(),
			replies: [],
		},
		{
			id: 4,
			nickname: "익명2",
			likes: 0,
			text: "저도 참여할래요!!",
			timestamp: new Date(),
			replies: [],
		},
		{
			id: 5,
			nickname: "익명2",
			likes: 5,
			text: "저도 참여할래요!!",
			timestamp: new Date(),
			replies: [],
		},
	]);

	const [inputValue, setInputValue] = useState("");
	const [replyTargetId, setReplyTargetId] = useState(null);
	const [likes, setLikes] = useState(post?.likes || 0);
	const [scrap, setScrap] = useState(post?.scrap || 0);
	const [liked, setLiked] = useState(false);
	const [scrapped, setScrapped] = useState(false);
	const bottomRef = useRef(null);
	// 메뉴 anchor
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const isMenuOpen = Boolean(menuAnchorEl);
	const [commentLikes, setCommentLikes] = useState({});
	const commentRefs = useRef({});
	const textAreaDomRef = useRef(null);
	const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
	const isReplyingRef = useRef(false);
	const [isParticipated, setIsParticipated] = useState(false);
	const [currentParticipants, setCurrentParticipants] = useState(post?.currentParticipants ?? 6);
	const maxParticipants = post?.maxParticipants ?? 11;
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const isMyPost = state?.fromMyPosts === true;

	useEffect(() => {
		if (replyTargetId !== null) {
			const el = textAreaDomRef.current;
			if (el) {
				el.focus();
				const len = el.value.length;
				el.setSelectionRange(len, len);
			}
		}
	}, [replyTargetId]);

	const handleReply = (id) => {
		setReplyTargetId(id);
		isReplyingRef.current = true;
	};

	useEffect(() => {
		if (isInitialMount.current) {
			scrollableContentRef.current?.scrollTo(0, 0);
			isInitialMount.current = false;
			return;
		}

		if (hasNewComment && !isReplyingRef.current) {
			const lastCommentId = comments[comments.length - 1]?.id;
			commentRefs.current[lastCommentId]?.scrollIntoView({behavior: "smooth", block: "center"});
		}

		setHasNewComment(false);
	}, [comments, hasNewComment]);

	useEffect(() => {
		const el = textAreaDomRef.current;

		if (!el) return;

		const handleFocus = () => setIsKeyboardOpen(true);
		const handleBlur = () => setIsKeyboardOpen(false);

		el.addEventListener("focus", handleFocus);
		el.addEventListener("blur", handleBlur);

		return () => {
			el.removeEventListener("focus", handleFocus);
			el.removeEventListener("blur", handleBlur);
		};
	}, [textAreaDomRef.current]);

	if (!post) return <Typography>게시글 정보를 찾을 수 없습니다.</Typography>;

	const handleRefresh = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				setRefreshKey((prev) => prev + 1); // 다시 렌더링
				resolve();
			}, 1000);
		});
	};

	const handleSubmit = () => {
		if (!inputValue.trim()) return;

		textAreaDomRef.current?.blur();

		const newEntry = {
			id: Date.now(),
			nickname: "익명",
			text: inputValue,
			timestamp: new Date(),
			likes: 0,
		};

		if (replyTargetId) {
			setComments((prev) => prev.map((c) => (c.id === replyTargetId ? {...c, replies: [...c.replies, newEntry]} : c)));
			setReplyTargetId(null);
		} else {
			setComments((prev) => [...prev, {...newEntry, replies: []}]);
		}

		setHasNewComment(true);
		setInputValue("");

		// 🔥 마지막에 리셋
		setTimeout(() => {
			isReplyingRef.current = false;
		}, 0);
	};

	const handleLike = () => {
		if (liked) return;

		const confirmed = window.confirm("이 글에 공감하시겠습니까?");
		if (confirmed) {
			setLikes((prev) => prev + 1);
			setLiked(true);
		}
	};

	const handleScrap = () => {
		if (scrapped) return;

		const confirmed = window.confirm("이 글을 저장하시겠습니까?");
		if (confirmed) {
			setScrapped(true);
			setScrap((prev) => prev + 1);
		}
	};

	// 메뉴 열기
	const handleMenuOpen = (event) => {
		setMenuAnchorEl(event.currentTarget);
	};

	// 메뉴 닫기
	const handleMenuClose = () => {
		setMenuAnchorEl(null);
	};

	// 신고하기 클릭 시
	const handleReport = () => {
		handleMenuClose();
		const confirmed = window.confirm("이 게시글을 신고하시겠습니까?");
		if (confirmed) {
			alert("신고가 접수되었습니다.");
		}
	};

	// URL 복사 클릭 시
	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setSnackbarOpen(true);
		} catch (err) {
			alert("URL 복사에 실패했습니다.");
		}
		setMenuAnchorEl(null); // 메뉴 닫기
	};

	const handleCommentLike = (id) => {
		if (commentLikes[id]) return; // 이미 공감함

		const confirmed = window.confirm("이 댓글을 공감하시겠습니까?");
		if (!confirmed) return;

		setComments((prev) => prev.map((c) => (c.id === id ? {...c, likes: (c.likes ?? 0) + 1} : c)));
		setCommentLikes((prev) => ({...prev, [id]: true}));
	};

	// 댓글 공감 및 신고 핸들러
	const handleCommentReport = (id) => {
		const confirmed = window.confirm("이 댓글을 신고하시겠습니까?");
		if (confirmed) {
			alert("신고가 접수되었습니다.");
		}
	};

	// 대댓글 공감 핸들러
	const handleReplyLike = (commentId, replyId) => {
		if (commentLikes[replyId]) return;
		const confirmed = window.confirm("이 대댓글을 공감하시겠습니까?");
		if (!confirmed) return;

		setComments((prev) =>
			prev.map((c) =>
				c.id === commentId
					? {
							...c,
							replies: c.replies.map((r) => (r.id === replyId ? {...r, likes: (r.likes || 0) + 1} : r)),
					  }
					: c
			)
		);
		setCommentLikes((prev) => ({...prev, [replyId]: true}));
	};

	// 대댓글 신고 핸들러
	const handleReplyReport = (replyId) => {
		const confirmed = window.confirm("이 대댓글을 신고하시겠습니까?");
		if (confirmed) alert("신고가 접수되었습니다.");
	};

	const handleParticipate = () => {
		if (isParticipated) return;

		if (currentParticipants >= maxParticipants) {
			alert("모집이 완료된 캠페인입니다.");
			return;
		}

		const confirmed = window.confirm("이 캠페인에 참여하시겠습니까?");
		if (confirmed) {
			setIsParticipated(true);
			setCurrentParticipants((prev) => prev + 1);
		}
	};

	// 수정 핸들러
	const handleEditPost = () => {
		handleMenuClose();

		const imageArray = post.image ? [{id: crypto.randomUUID(), url: post.image}] : [];

		navigate("/post/create", {
			state: {
				post: {
					...post,
					images: imageArray,
				},
			},
		});
	};

	return (
		<Box className={styles.container}>
			<Menu
				anchorEl={menuAnchorEl}
				open={isMenuOpen}
				onClose={handleMenuClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}>
				<MenuItem onClick={handleReport}>신고하기</MenuItem>
				<MenuItem onClick={handleCopyUrl}>URL 복사</MenuItem>
				{isMyPost && <MenuItem onClick={handleEditPost}>수정</MenuItem>}
			</Menu>

			<Box className={styles.header}>
				<IconButton onClick={() => navigate(-1)} sx={{padding: "0px"}}>
					<ArrowBackIosNewIcon />
				</IconButton>
				<Typography className={styles.boardTitle}>{post.noticeBoard}</Typography>
				<MoreVertIcon className={styles.moreButton} onClick={handleMenuOpen} sx={{cursor: "pointer"}} />
			</Box>
			<PullToRefresh onRefresh={handleRefresh}>
				<Box className={styles.scrollableContent} ref={scrollableContentRef}>
					<Box className={styles.content}>
						<Box display='flex' alignItems='center' gap={1} mb={1}>
							<img
								src='/default-profile.png'
								alt='작성자 프로필'
								style={{
									width: 32,
									height: 32,
									borderRadius: "50%",
									objectFit: "cover",
								}}
							/>
							<Box>
								<Typography className={styles.nickname}>{post.writer}</Typography>
								<Typography className={styles.time}>{formatTime(post.createdAt)}</Typography>
							</Box>
						</Box>
						{/* <Typography className={styles.nickname}>{post.writer}</Typography>
						<Typography className={styles.time}>{formatTime(post.createdAt)}</Typography> */}
						{post.noticeBoard === "캠페인 게시판" && (
							<Box>
								<Box display='flex' alignItems='center' gap={1}>
									<CalendarMonthIcon className={styles.time} sx={{margin: "0px"}} />
									<Typography className={styles.time}>
										{formatDateOnly(post.startDate)} ~ {formatDateOnly(post.endDate)}
									</Typography>
								</Box>
								<Box display='flex' alignItems='center' gap={1}>
									<LocationOnIcon className={styles.time} sx={{margin: "0px"}} />
									<Typography className={styles.time}>{post.location}</Typography>
								</Box>
							</Box>
						)}
						<Typography className={styles.title}>{post.title}</Typography>
						<Typography className={styles.text}>{post.content}</Typography>

						{post.image && (
							<Box className={styles.imageWrapper}>
								<img
									src={post.image}
									alt='본문 이미지'
									style={{
										width: "100%",
										height: "auto",
										marginTop: "12px",
										borderRadius: "12px",
									}}
								/>
							</Box>
						)}

						{post.noticeBoard === "캠페인 게시판" && (
							<Box mt={2} textAlign='center'>
								<IconButton
									onClick={handleParticipate}
									sx={{
										borderRadius: "12px",
										padding: "12px",
										boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
										color: isParticipated ? "#4caf50" : "#999",
									}}>
									<WavingHandIcon fontSize='medium' />
								</IconButton>
								<Typography variant='body2' color='#999' mt={1}>
									{currentParticipants} / {maxParticipants}
								</Typography>
							</Box>
						)}
					</Box>

					<Box className={styles.interaction}>
						<Box
							className={styles.iconBox}
							onClick={handleLike}
							sx={{color: liked ? "#f28b82 !important" : "#999", cursor: "pointer"}}>
							{liked ? <ThumbUpAltIcon /> : <ThumbUpAltOutlinedIcon />}
							<Typography className={styles.iconText}>{(likes ?? 0) > 0 ? ` ${likes}` : ""}</Typography>
						</Box>

						<Box
							className={styles.iconBox}
							onClick={() => {
								const el = textAreaDomRef.current;
								if (el) {
									el.focus();
									const len = el.value.length;
									el.setSelectionRange(len, len);
								}
							}}
							sx={{cursor: "pointer"}}>
							<ChatIcon />
							<Typography className={styles.iconText}>
								{(comments.length ?? 0) > 0 ? ` ${comments.length}` : ""}
							</Typography>
						</Box>

						<Box
							className={styles.iconBox}
							onClick={handleScrap}
							sx={{color: scrapped ? "#fbc02d !important" : "#999", cursor: "pointer"}}>
							<TaskOutlinedIcon />
							<Typography className={styles.iconText}>{(scrap ?? 0) > 0 ? ` ${scrap}` : ""}</Typography>
						</Box>
					</Box>

					<Box className={styles.commentSection}>
						{comments.map((comment) => (
							<Box key={comment.id} ref={(el) => (commentRefs.current[comment.id] = el)} className={styles.commentItem}>
								{/* 공감, 신고 아이콘 영역 */}
								<Box className={styles.commentActions}>
									<Box
										className={styles.commentActionButton}
										onClick={() => handleCommentLike(comment.id)}
										style={{color: commentLikes[comment.id] ? "#f28b82" : "#999"}}>
										{commentLikes[comment.id] ? (
											<ThumbUpAltIcon fontSize='small' />
										) : (
											<ThumbUpAltOutlinedIcon fontSize='small' />
										)}
										<Typography variant='caption'>{comment.likes > 0 ? ` ${comment.likes}` : ""}</Typography>
									</Box>
									<Box
										className={styles.commentActionButton}
										onClick={() => handleCommentReport(comment.id)}
										style={{color: "#999"}}>
										<FlagOutlinedIcon fontSize='small' />
										<Typography variant='caption'></Typography>
									</Box>
								</Box>

								{/* 댓글 내용 */}
								<Box display='flex' alignItems='center' gap={1}>
									<img
										src='/default-profile.png'
										alt='댓글 프로필'
										style={{
											width: 20,
											height: 20,
											borderRadius: "50%",
											objectFit: "cover",
										}}
									/>
									<Box>
										<Typography className={styles.commentNickname}>{comment.nickname}</Typography>
									</Box>
								</Box>

								<Typography className={styles.commentText}>{comment.text}</Typography>
								<Typography className={styles.commentTime}>{formatTime(comment.timestamp)}</Typography>

								<Button
									size='small'
									onClick={() => handleReply(comment.id)}
									sx={{padding: 0, color: "#4caf50", fontSize: "12px", justifyContent: "start"}}>
									답글쓰기
								</Button>

								{comment.replies?.length > 0 && (
									<Box className={styles.replyList}>
										{comment.replies.map((reply) => (
											<Box key={reply.id} className={styles.replyItem}>
												{/* 대댓글 공감/신고 영역 */}
												<Box className={styles.replyActions}>
													<Box
														className={styles.commentActionButton}
														onClick={() => handleReplyLike(comment.id, reply.id)}
														style={{color: commentLikes[reply.id] ? "#f28b82" : "#999"}}>
														{commentLikes[reply.id] ? (
															<ThumbUpAltIcon fontSize='small' />
														) : (
															<ThumbUpAltOutlinedIcon fontSize='small' />
														)}
														<Typography variant='caption'>{reply.likes > 0 ? `${reply.likes}` : ""}</Typography>
													</Box>
													<Box
														className={styles.commentActionButton}
														onClick={() => handleReplyReport(reply.id)}
														style={{color: "#999"}}>
														<FlagOutlinedIcon fontSize='small' />
														<Typography variant='caption'></Typography>
													</Box>
												</Box>
												<Box display='flex' alignItems='center' gap={1}>
													<img
														src='/default-profile.png'
														alt='대댓글 프로필'
														style={{
															width: 20,
															height: 20,
															borderRadius: "50%",
															objectFit: "cover",
														}}
													/>
													<Box>
														<Typography className={styles.replyNickname}>{reply.nickname}</Typography>
													</Box>
												</Box>
												<Typography className={styles.replyText}>{reply.text}</Typography>
												<Typography className={styles.replyTime}>{formatTime(reply.timestamp)}</Typography>
											</Box>
										))}
									</Box>
								)}
							</Box>
						))}
						<div ref={bottomRef} />
					</Box>
				</Box>
			</PullToRefresh>

			<Box className={`${styles.commentInputWrapper} ${isKeyboardOpen ? styles.keyboardOpen : ""}`}>
				<TextField
					fullWidth
					multiline
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					size='small'
					placeholder={replyTargetId ? "답글을 입력하세요." : "댓글을 입력하세요."}
					variant='outlined'
					color='success'
					inputProps={{
						ref: (ref) => {
							if (ref) textAreaDomRef.current = ref;
						},
					}}
				/>
				<Button
					className={styles.commentButton}
					onMouseDown={(e) => e.preventDefault()}
					onClick={handleSubmit}
					sx={{ml: 1}}>
					등록
				</Button>
				{replyTargetId && (
					<Button
						className={styles.commentButton}
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => {
							textAreaDomRef.current?.blur(); // 키보드 내리기
							setReplyTargetId(null);
						}}>
						취소
					</Button>
				)}
			</Box>

			<Snackbar
				open={snackbarOpen}
				autoHideDuration={2000}
				onClose={() => setSnackbarOpen(false)}
				message='클립보드에 복사되었습니다.'
				anchorOrigin={{vertical: "top", horizontal: "center"}}
				sx={{top: "70px"}}
			/>
		</Box>
	);
};

export default PostDetail;
