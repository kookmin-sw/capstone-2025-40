import React, {useState, useRef, useEffect, useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {useParams, useLocation} from "react-router-dom";
import axiosInstance from "../../axiosInstance";
import {Box, Typography, IconButton, TextField, Button, Menu, MenuItem, Paper} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
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

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";

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
	// Swiping detection for horizontal gestures (generalized, disables pull-to-refresh)
	const isSwipingImagesRef = useRef(false);
	const touchStartRef = useRef({x: 0, y: 0});
	const [editCommentId, setEditCommentId] = useState(null);
	const [reportType, setReportType] = useState("post");
	const [commentMenuAnchorEl, setCommentMenuAnchorEl] = useState(null);
	const [selectedCommentId, setSelectedCommentId] = useState(null);
	const [isEditingComment, setIsEditingComment] = useState(false);
	const [isEditingReply, setIsEditingReply] = useState(false);

	const handleCommentMenuOpen = (event, commentId, isReply = false) => {
		setCommentMenuAnchorEl(event.currentTarget);
		setSelectedCommentId(commentId);
		setIsEditingReply(isReply);
	};

	const handleCommentMenuClose = () => {
		setCommentMenuAnchorEl(null);
		setSelectedCommentId(null);
	};

	const handleCommentEdit = () => {
		let comment = null;
		if (isEditingReply) {
			for (const c of comments) {
				const found = c.replies?.find((r) => r.id === selectedCommentId);
				if (found) {
					comment = found;
					setReplyTargetId(c.id);
					break;
				}
			}
		} else {
			comment = comments.find((c) => c.id === selectedCommentId);
		}

		if (comment) {
			setInputValue(comment.text);
			setIsEditingComment(true);
			setEditCommentId(comment.id);
			textAreaDomRef.current?.focus();
		}
		handleCommentMenuClose();
	};

	const handleCommentDelete = async () => {
		const confirmed = window.confirm("이 댓글을 삭제하시겠습니까?");
		if (!confirmed) return;
		try {
			const url = `/users/community/posts/${id}/comments/${selectedCommentId}/`;
			await axiosInstance.delete(url);
			setComments((prev) => prev.filter((c) => c.id !== selectedCommentId));
			await fetchComments();
		} catch (error) {
			console.error("댓글 삭제 실패:", error);
			alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
		}
		handleCommentMenuClose();
	};
	const navigate = useNavigate();
	const {id} = useParams();
	const {state} = useLocation();
	const [post, setPost] = useState(null);
	const [currentParticipants, setCurrentParticipants] = useState(null);

	const [nextUrl, setNextUrl] = useState(null);
	const [isLoadingMore, setIsLoadingMore] = useState(false);

	const [loading, setLoading] = useState(true);
	// 게시글 데이터 불러오기
	const fetchPostData = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get(`users/community/posts/${id}/`);
			const data = response.data;

			const mappedPost = {
				id: data.id,
				writer: data.post_type === "campaign" ? data.user.name : data.user.nickname,
				title: data.title,
				content: data.content,
				createdAt: data.created_at,
				likes: data.like_count,
				scrap: data.scrap_count,
				noticeBoard:
					data.post_type === "campaign"
						? "캠페인 게시판"
						: data.post_type === "free"
						? "자유 게시판"
						: data.post_type === "info"
						? "정보게시판"
						: "기타",
				startDate: data.campaign?.start_date,
				endDate: data.campaign?.end_date,
				location: data.campaign ? `${data.campaign.city} ${data.campaign.district}` : null,
				maxParticipants: data.campaign?.participant_limit,
				profileImage:
					data.user.profile_image ||
					"https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/profile-images%2FGreenDayProfile.png?alt=media&token=dc457190-a5f4-4ea9-be09-39a31aafef7c",
				badgeImage: data.user.badge_image,
				images:
					data.images
						?.map((img) => {
							try {
								const parsed = JSON.parse(img.image_url.replace(/'/g, '"'));
								return parsed.image_url;
							} catch {
								return null;
							}
						})
						.filter(Boolean) || [],
				isOwner: data.is_owner,
				liked: data.has_liked,
				scrapped: data.has_scrapped,
				commentCount: data.comment_count,
				scrap: data.scrap_count,
				currentParticipants: data.campaign?.current_participant_count,
				participated: data.has_participated,
			};

			setPost(mappedPost);
			setLiked(data.has_liked);
			setScrapped(data.has_scrapped);
			setLikes(data.like_count);
			setScrap(data.scrap_count);
			// setCurrentParticipants(data.current_participant_count ?? 0);
			setIsParticipated(data.has_participated);
		} catch (error) {
			console.error("Failed to fetch post data:", error);
		} finally {
			setLoading(false);
		}
	};

	// 댓글 불러오기
	const fetchComments = async (url = `/users/community/posts/${id}/comments/`, append = false) => {
		try {
			const res = await axiosInstance.get(url);
			const commentData = res.data.results.map((comment) => ({
				id: comment.id,
				nickname: post?.noticeBoard === "캠페인 게시판" ? comment.user.name : comment.user.nickname,
				profileImage: comment.user.profile_image || "/default-profile.png",
				badgeImage: comment.user.badge_image,
				text: comment.content,
				timestamp: new Date(comment.created_at),
				likes: comment.like_count,
				isMyComment: comment.is_my_comment,
				hasLiked: comment.has_liked_comment,
				replies: (comment.replies || []).map((reply) => ({
					id: reply.id,
					nickname: post?.noticeBoard === "캠페인 게시판" ? reply.user.name : reply.user.nickname,
					profileImage: reply.user.profile_image || "/default-profile.png",
					badgeImage: reply.user.badge_image,
					text: reply.content,
					timestamp: new Date(reply.created_at),
					likes: reply.like_count,
					isMyReply: reply.is_my_reply,
					hasLiked: reply.has_liked_comment,
				})),
			}));
			setComments((prev) => (append ? [...prev, ...commentData] : commentData));
			setNextUrl(res.data.next);
		} catch (error) {
			console.error("댓글 불러오기 실패:", error);
		}
	};

	useEffect(() => {
		if (!nextUrl || isLoadingMore) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setIsLoadingMore(true);
					setTimeout(() => {
						fetchComments(nextUrl, true).finally(() => setIsLoadingMore(false));
					}, 500);
				}
			},
			{
				threshold: 1.0,
			}
		);

		const target = bottomRef.current;
		if (target) observer.observe(target);

		return () => {
			if (target) observer.unobserve(target);
		};
	}, [nextUrl, isLoadingMore]);

	useEffect(() => {
		fetchPostData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	useEffect(() => {
		if (post) {
			fetchComments();
		}
	}, [post]);

	// 댓글/대댓글별 뱃지 매핑 state
	const isInitialMount = useRef(true);
	const [hasNewComment, setHasNewComment] = useState(false);
	const scrollableContentRef = useRef(null);
	const [refreshKey, setRefreshKey] = useState(0); // 새로고침 트리거
	const hasJustAddedCommentRef = useRef(false);

	const [comments, setComments] = useState([]);

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
	// 신고 메뉴 및 다이얼로그 상태
	const [reportAnchorEl, setReportAnchorEl] = useState(null);
	const [reportCategory, setReportCategory] = useState("");
	const [reportReason, setReportReason] = useState("");
	const [reportDialogOpen, setReportDialogOpen] = useState(false);
	const maxParticipants = post?.maxParticipants ?? 0;

	// 참여자 목록 메뉴 state
	const [participantAnchorEl, setParticipantAnchorEl] = useState(null);
	const [participants, setParticipants] = useState([]);
	// 참여자 목록 불러오기 핸들러
	const handleParticipantClick = async (event) => {
		setParticipantAnchorEl(event.currentTarget);
		try {
			const response = await axiosInstance.get(`/users/community/posts/${id}/participant/`);
			const currentUsername = JSON.parse(localStorage.getItem("user"))?.username;

			const formatted = response.data.map((p) => ({
				...p,
				user: {
					...p.user,
					displayName: p.user.username === currentUsername ? `${p.user.name} (나)` : p.user.name,
				},
			}));

			setParticipants(formatted);
		} catch (error) {
			console.error("참여자 목록 불러오기 실패:", error);
		}
	};
	const [snackbarOpen, setSnackbarOpen] = useState(false);
	const isMyPost = post?.isOwner === true;

	// 이미지 미리보기 모달 상태
	const [previewOpen, setPreviewOpen] = useState(false);
	const [previewImage, setPreviewImage] = useState("");

	const handlePreview = (imgUrl) => {
		setPreviewImage(imgUrl);
		setPreviewOpen(true);
	};

	const handleClosePreview = () => {
		setPreviewOpen(false);
		setPreviewImage("");
	};

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
			const firstCommentId = comments[0]?.id;
			const el = commentRefs.current[firstCommentId];
			el?.scrollIntoView({behavior: "smooth", block: "start"});
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

	if (!post && loading) {
		return (
			<Box className={styles.container}>
				<Box className={styles.header}>
					<IconButton onClick={() => navigate(-1)} sx={{padding: "0px"}}>
						<ArrowBackIosNewIcon />
					</IconButton>
					<Typography className={styles.boardTitle}></Typography>
				</Box>
				<Box textAlign='center' py={5}>
					<CircularProgress color='success' />
				</Box>
			</Box>
		);
	}

	const handleRefresh = () => {
		return new Promise((resolve) => {
			fetchPostData().then(() => {
				setTimeout(resolve, 500);
			});
			fetchComments().then(() => {
				setTimeout(resolve, 500);
			});
		});
	};

	const handleSubmit = async () => {
		if (!inputValue.trim()) return;

		textAreaDomRef.current?.blur();

		if (isEditingComment) {
			const confirmed = window.confirm("이 댓글을 수정하시겠습니까?");
			if (!confirmed) return;
			try {
				const url = `/users/community/posts/${id}/comments/${editCommentId}/`;

				await axiosInstance.patch(url, {
					content: inputValue,
				});
				setComments((prev) => prev.map((c) => (c.id === editCommentId ? {...c, text: inputValue} : c)));
			} catch (error) {
				console.error("댓글 수정 실패:", error);
				alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
			}
			setInputValue("");
			setIsEditingComment(false);
			setEditCommentId(null);
			setSelectedCommentId(null);
			setIsEditingReply(false);
			await fetchComments();
			return;
		}

		try {
			let response;
			if (replyTargetId) {
				response = await axiosInstance.post(`/users/community/posts/${id}/comments/${replyTargetId}/replies/`, {
					content: inputValue,
				});
				await fetchComments();
			} else {
				response = await axiosInstance.post(`/users/community/posts/${id}/comments/`, {
					content: inputValue,
				});
				hasJustAddedCommentRef.current = true;
				setHasNewComment(true);
				await fetchComments();
			}
			setReplyTargetId(null);
		} catch (error) {
			console.error("댓글 등록 실패:", error);
			alert("댓글 등록에 실패했습니다. 다시 시도해주세요.");
		}

		setInputValue("");
		setIsEditingComment(false);
		setTimeout(() => {
			isReplyingRef.current = false;
			setReplyTargetId(null);
		}, 0);
	};

	// 게시글 좋아요 핸들러
	const handleLike = async () => {
		try {
			await axiosInstance.post(`/users/community/posts/${id}/like/`);
			setLiked((prev) => !prev);
			setLikes((prev) => (liked ? prev - 1 : prev + 1));
			await fetchPostData();
		} catch (error) {
			console.error("게시글 좋아요 실패:", error);
			alert("게시글 좋아요 처리 중 문제가 발생했습니다.");
		}
	};

	// 게시글 스크랩 핸들러
	const handleScrap = async () => {
		try {
			await axiosInstance.post(`/users/community/posts/${id}/scrap/`);
			setScrapped((prev) => !prev);
			setScrap((prev) => (scrapped ? prev - 1 : prev + 1));
			await fetchPostData();
		} catch (error) {
			console.error("스크랩 실패:", error);
			alert("스크랩 처리 중 문제가 발생했습니다.");
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

	// 신고 관련 핸들러
	const handleReportClick = (event) => {
		setReportAnchorEl(event.currentTarget);
	};

	const handleReportCategorySelect = (category) => {
		setReportCategory(category);
		setReportDialogOpen(true);
		setReportAnchorEl(null);
	};

	const handleReportDialogClose = () => {
		setReportDialogOpen(false);
		setReportReason("");
		setReportCategory("");
	};

	// Generalized 신고 핸들러
	const handleReport = (event, type = "post", commentId = null, parentCommentId = null) => {
		setReportType(type);
		if (type === "comment" || type === "reply") {
			setSelectedCommentId(commentId);
		}
		if (type === "reply") {
			setReplyTargetId(parentCommentId);
			setIsEditingReply(true);
		}
		handleMenuClose();
		handleReportClick(event);
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

	// 댓글 공감 핸들러
	const handleCommentLike = async (id) => {
		try {
			const res = await axiosInstance.post(`/users/community/posts/${post.id}/comments/${id}/like/`);
			const {liked, like_count} = res.data;
			setComments((prev) => prev.map((c) => (c.id === id ? {...c, hasLiked: liked, likes: like_count} : c)));
		} catch (error) {
			console.error("댓글 좋아요 실패:", error);
			alert("댓글 좋아요 처리 중 문제가 발생했습니다.");
		}
	};

	// 대댓글 공감 핸들러
	const handleReplyLike = async (commentId, replyId) => {
		try {
			const res = await axiosInstance.post(`/users/community/posts/${post.id}/comments/${replyId}/like/`);
			const {liked, like_count} = res.data;
			setComments((prev) =>
				prev.map((c) =>
					c.id === commentId
						? {
								...c,
								replies: c.replies.map((r) => (r.id === replyId ? {...r, hasLiked: liked, likes: like_count} : r)),
						  }
						: c
				)
			);
		} catch (error) {
			console.error("대댓글 좋아요 실패:", error);
			alert("대댓글 좋아요 처리 중 문제가 발생했습니다.");
		}
	};

	// 캠페인 참여 핸들러
	const handleParticipate = async () => {
		try {
			const response = await axiosInstance.post(`/users/community/posts/${id}/participant/`);
			const {participated, current_participant_count} = response.data;
			setIsParticipated(participated);
			setCurrentParticipants(current_participant_count);
			await fetchPostData();
		} catch (error) {
			console.error("캠페인 참여 실패:", error);
			alert("캠페인 참여 처리 중 문제가 발생했습니다.");
		}
	};

	// 수정 핸들러
	const handleEditPost = () => {
		handleMenuClose();

		const imageArray =
			Array.isArray(post.images) && post.images.length > 0
				? post.images.map((url) => ({
						id: crypto.randomUUID(),
						url,
				  }))
				: [];

		navigate("/post/create", {
			state: {
				post: {
					...post,
					images: imageArray,
				},
			},
		});
	};

	// 게시글 삭제 핸들러
	const handleDeletePost = async () => {
		handleMenuClose();
		const confirmed = window.confirm("게시글을 삭제하시겠습니까?");
		if (!confirmed) return;

		try {
			await axiosInstance.delete(`/users/community/posts/${id}/`);
			alert("게시글이 삭제되었습니다.");
			navigate(-1);
		} catch (error) {
			console.error("게시글 삭제 실패:", error);
			alert("삭제에 실패했습니다. 다시 시도해주세요.");
		}
	};

	return (
		<Box className={styles.container}>
			<Menu
				anchorEl={commentMenuAnchorEl}
				open={Boolean(commentMenuAnchorEl)}
				onClose={handleCommentMenuClose}
				anchorOrigin={{vertical: "top", horizontal: "right"}}
				transformOrigin={{vertical: "top", horizontal: "right"}}>
				<MenuItem onClick={handleCommentEdit}>수정</MenuItem>
				<MenuItem onClick={handleCommentDelete}>삭제</MenuItem>
			</Menu>
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
				<MenuItem onClick={(e) => handleReport(e, "post")}>신고하기</MenuItem>
				<MenuItem onClick={handleCopyUrl}>URL 복사</MenuItem>
				{isMyPost && <MenuItem onClick={handleEditPost}>수정</MenuItem>}
				{isMyPost && <MenuItem onClick={handleDeletePost}>삭제</MenuItem>}
			</Menu>
			{/* 신고 카테고리 선택 메뉴 */}
			<Menu
				anchorEl={reportAnchorEl}
				open={Boolean(reportAnchorEl)}
				onClose={() => setReportAnchorEl(null)}
				anchorOrigin={{vertical: "top", horizontal: "right"}}
				transformOrigin={{vertical: "top", horizontal: "right"}}>
				{["스팸", "욕설/비방", "기타"].map((option) => (
					<MenuItem key={option} onClick={() => handleReportCategorySelect(option)}>
						{option}
					</MenuItem>
				))}
			</Menu>
			{/* 신고 사유 입력 다이얼로그 */}
			<Dialog open={reportDialogOpen} onClose={handleReportDialogClose} maxWidth='sm' fullWidth>
				<DialogTitle>{reportCategory}</DialogTitle>
				<DialogContent>
					<TextField
						autoFocus
						color='success'
						margin='dense'
						fullWidth
						multiline
						rows={4}
						placeholder='신고 사유를 입력해주세요.'
						value={reportReason}
						onChange={(e) => setReportReason(e.target.value)}
						variant='outlined'
					/>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleReportDialogClose} color='success'>
						취소
					</Button>
					<Button
						onClick={async () => {
							try {
								if (!reportReason.trim()) {
									alert("신고 사유를 입력해주세요.");
									return;
								}
								let url = "";
								if (reportType === "post") {
									url = `/users/community/posts/${id}/report/`;
								} else {
									url = `/users/community/posts/${id}/comments/${selectedCommentId}/report/`;
								}

								await axiosInstance.post(url, {
									reason: reportCategory === "스팸" ? "spam" : reportCategory === "욕설/비방" ? "abuse" : "other",
									details: reportReason,
								});
								alert("신고가 접수되었습니다.");

								setIsEditingComment(false);
								setEditCommentId(null);
								setSelectedCommentId(null);
								setIsEditingReply(false);
								setReplyTargetId(null);
								setReportType("post");
							} catch (error) {
								if (error.response?.data?.detail === "이미 신고하셨습니다.") {
									alert(error.response.data.detail);
								} else {
									console.error("댓글 신고 실패:", error);
									alert("신고 처리 중 문제가 발생했습니다.");
								}
							}
							handleReportDialogClose();
						}}
						color='success'>
						확인
					</Button>
				</DialogActions>
			</Dialog>
			<Box className={styles.header}>
				<IconButton onClick={() => navigate(-1)} sx={{padding: "0px"}}>
					<ArrowBackIosNewIcon />
				</IconButton>
				<Typography className={styles.boardTitle}>{post.noticeBoard}</Typography>
				<MoreVertIcon className={styles.moreButton} onClick={handleMenuOpen} sx={{cursor: "pointer"}} />
			</Box>
			<PullToRefresh onRefresh={handleRefresh} shouldPullToRefresh={() => !isSwipingImagesRef.current}>
				<Box
					className={styles.scrollableContent}
					ref={scrollableContentRef}
					onTouchStart={(e) => {
						touchStartRef.current = {
							x: e.touches[0].clientX,
							y: e.touches[0].clientY,
						};
					}}
					onTouchMove={(e) => {
						const dx = Math.abs(e.touches[0].clientX - touchStartRef.current.x);
						const dy = Math.abs(e.touches[0].clientY - touchStartRef.current.y);
						isSwipingImagesRef.current = dx > dy;
					}}
					onTouchEnd={() => {
						setTimeout(() => {
							isSwipingImagesRef.current = false;
						}, 200);
					}}>
					<Box className={styles.content}>
						<Box display='flex' alignItems='center' gap={1} mb={1}>
							<img
								src={post.profileImage}
								alt='작성자 프로필'
								style={{
									width: 48,
									height: 48,
									borderRadius: "50%",
									objectFit: "cover",
									cursor: "pointer",
								}}
								onClick={() => handlePreview(post.profileImage)}
							/>
							<Box>
								<Box display='flex' alignItems='center' gap={1}>
									<Typography className={styles.nickname}>{post.writer}</Typography>
									{post.badgeImage && (
										<img
											src={post.badgeImage}
											alt='뱃지'
											style={{width: 36, height: 36, cursor: "pointer"}}
											onClick={() => handlePreview(post.badgeImage)}
										/>
									)}
								</Box>
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

						{post.images?.length > 0 && (
							<Box
								sx={{
									display: "flex",
									overflowX: "auto",
									gap: 1,
									paddingY: 1,
								}}>
								{post.images.map((img, idx) => (
									<Box
										key={idx}
										component='img'
										src={img}
										alt={`본문 이미지 ${idx + 1}`}
										onClick={() => handlePreview(img)}
										sx={{
											height: 180,
											borderRadius: 2,
											cursor: "pointer",
											flexShrink: 0,
										}}
									/>
								))}
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
										color: post.participated ? "#4caf50" : "#999",
									}}>
									<WavingHandIcon fontSize='medium' />
								</IconButton>
								<Typography
									variant='body2'
									color='#999'
									mt={1}
									onClick={handleParticipantClick}
									sx={{cursor: "pointer"}}>
									{post.currentParticipants} / {maxParticipants}
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
								{(post?.commentCount ?? 0) > 0 ? ` ${post.commentCount}` : ""}
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
										style={{color: comment.hasLiked ? "#f28b82" : "#999"}}>
										{comment.hasLiked ? (
											<ThumbUpAltIcon fontSize='small' />
										) : (
											<ThumbUpAltOutlinedIcon fontSize='small' />
										)}
										<Typography variant='caption'>{comment.likes > 0 ? ` ${comment.likes}` : ""}</Typography>
									</Box>
									<Box
										className={styles.commentActionButton}
										onClick={(e) => handleReport(e, "comment", comment.id)}
										style={{color: "#999"}}>
										<FlagOutlinedIcon fontSize='small' />
										<Typography variant='caption'></Typography>
									</Box>
									{comment.isMyComment && (
										<IconButton onClick={(e) => handleCommentMenuOpen(e, comment.id)} size='small'>
											<MoreVertIcon fontSize='small' />
										</IconButton>
									)}
								</Box>

								{/* 댓글 내용 */}
								<Box display='flex' alignItems='center' gap={1}>
									<img
										src={comment.profileImage}
										alt='댓글 프로필'
										style={{
											width: 32,
											height: 32,
											borderRadius: "50%",
											objectFit: "cover",
											cursor: "pointer",
										}}
										onClick={() => handlePreview(comment.profileImage)}
									/>
									<Box>
										<Box display='flex' alignItems='center' gap={1}>
											<Typography className={styles.commentNickname}>{comment.nickname}</Typography>
											{comment.badgeImage && (
												<img
													src={comment.badgeImage}
													alt='뱃지'
													style={{width: 32, height: 32, cursor: "pointer"}}
													onClick={() => handlePreview(comment.badgeImage)}
												/>
											)}
										</Box>
									</Box>
								</Box>

								<Typography
									className={styles.commentText}
									component='pre'
									sx={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>
									{comment.text}
								</Typography>
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
														style={{color: reply.hasLiked ? "#f28b82" : "#999"}}>
														{reply.hasLiked ? (
															<ThumbUpAltIcon fontSize='small' />
														) : (
															<ThumbUpAltOutlinedIcon fontSize='small' />
														)}
														<Typography variant='caption'>{reply.likes > 0 ? `${reply.likes}` : ""}</Typography>
													</Box>
													<Box
														className={styles.commentActionButton}
														onClick={(e) => handleReport(e, "reply", reply.id, comment.id)}
														style={{color: "#999"}}>
														<FlagOutlinedIcon fontSize='small' />
														<Typography variant='caption'></Typography>
													</Box>

													{reply.isMyReply && (
														<IconButton onClick={(e) => handleCommentMenuOpen(e, reply.id, true)} size='small'>
															<MoreVertIcon fontSize='small' />
														</IconButton>
													)}
												</Box>
												<Box display='flex' alignItems='center' gap={1}>
													<img
														src={reply.profileImage}
														alt='대댓글 프로필'
														style={{
															width: 32,
															height: 32,
															borderRadius: "50%",
															objectFit: "cover",
															cursor: "pointer",
														}}
														onClick={() => handlePreview(reply.profileImage)}
													/>
													<Box>
														<Box display='flex' alignItems='center' gap={1}>
															<Typography className={styles.replyNickname}>{reply.nickname}</Typography>
															{reply.badgeImage && (
																<img
																	src={reply.badgeImage}
																	alt='뱃지'
																	style={{width: 32, height: 32, cursor: "pointer"}}
																	onClick={() => handlePreview(reply.badgeImage)}
																/>
															)}
														</Box>
													</Box>
												</Box>
												<Typography
													className={styles.replyText}
													component='pre'
													sx={{whiteSpace: "pre-wrap", wordBreak: "break-word"}}>
													{reply.text}
												</Typography>
												<Typography className={styles.replyTime}>{formatTime(reply.timestamp)}</Typography>
											</Box>
										))}
									</Box>
								)}
							</Box>
						))}
						<div ref={bottomRef} />
					</Box>

					{isLoadingMore && (
						<Box display='flex' justifyContent='center' py={2}>
							<CircularProgress color='success' size={28} />
						</Box>
					)}
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
					{isEditingComment ? "수정" : "등록"}
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
			<Dialog open={previewOpen} onClose={handleClosePreview}>
				<Box display='flex' justifyContent='flex-end' p={1}>
					<IconButton onClick={handleClosePreview} size='small'>
						<CloseIcon />
					</IconButton>
				</Box>
				<DialogContent>
					<img src={previewImage} alt='미리보기' style={{width: "100%", height: "auto"}} />
				</DialogContent>
			</Dialog>
			<Menu
				anchorEl={participantAnchorEl}
				open={Boolean(participantAnchorEl)}
				onClose={() => setParticipantAnchorEl(null)}
				anchorOrigin={{vertical: "bottom", horizontal: "center"}}
				transformOrigin={{vertical: "top", horizontal: "center"}}
				PaperProps={{
					style: {
						maxHeight: 300,
						width: "200px",
						overflowY: "auto",
					},
				}}>
				{participants.map((p, index) => (
					<MenuItem key={p.user.id}>
						<Box display='flex' alignItems='center' gap={1}>
							<img
								src={
									p.user.profile_image ||
									"https://firebasestorage.googleapis.com/v0/b/greenday-8d0a5.firebasestorage.app/o/profile-images%2FGreenDayProfile.png?alt=media&token=dc457190-a5f4-4ea9-be09-39a31aafef7c"
								}
								alt='프로필'
								style={{width: 32, height: 32, borderRadius: "50%", objectFit: "cover"}}
							/>
							<Typography fontWeight='bold' color='#388e3c'>
								{p.user.displayName}
							</Typography>
							{p.user.badge_image && <img src={p.user.badge_image} alt='뱃지' style={{width: 32, height: 32}} />}
						</Box>
					</MenuItem>
				))}
			</Menu>
			;
		</Box>
	);
};

export default PostDetail;
