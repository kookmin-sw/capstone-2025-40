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
	campaign: [
		{
			id: 1,
			noticeBoard: "캠페인 게시판",
			writer: "홍길동",
			title: "서울시 공원행동특공대 캠페인 하실분!!",
			content: `공원행동특공대 환경 캠페인 하실 분들을 모집합니다.\n보라매공원 데크산책로 주변에서 환경을 위해 같이 주변 청소해요!\n마실 음료는 오시면 기본 제공되니 참여하실분 참여 버튼 눌러주세요!!`,
			image: require("../../assets/community/campaign1.jpg"),
			createdAt: new Date(),
			likes: Math.floor(Math.random() * 20),
			comments: 5,
			scrap: 0,
			currentParticipants: 33,
			maxParticipants: 50,
			startDate: new Date(),
			endDate: new Date(),
			location: "서울시 동작구",
		},
		{
			id: 2,
			noticeBoard: "캠페인 게시판",
			writer: "홍길동",
			title: "성북구에서 환경 보호 캠페인 모집합니다.",
			content: `성북구에서 지구와 함께하는 우리 캠페인 참여하실분 모집합니다.\n인원은 10명 정도 받고 있으며, 깨끗한 성북구를 위해 노력합시다.`,
			image: require("../../assets/community/campaign2.jpg"),
			createdAt: new Date(),
			likes: Math.floor(Math.random() * 20),
			comments: 5,
			scrap: Math.floor(Math.random() * 10),
			currentParticipants: 2,
			maxParticipants: 10,
			startDate: new Date(),
			endDate: new Date(),
			location: "서울시 성북구",
		},
		{
			id: 3,
			noticeBoard: "캠페인 게시판",
			writer: "홍길동",
			title: "산림 복원 캠페인 참여자 모집합니다.",
			content: `고성군 죽왕면 가진리 산63에서 산림 복원 캠페인을 하실 분 모집합니다.\n고성군의 깨끗한 산림을 가꾸기 위해 참여해주세요!`,
			image: require("../../assets/community/campaign3.jpg"),
			createdAt: new Date(),
			likes: Math.floor(Math.random() * 20),
			comments: Math.floor(Math.random() * 10),
			scrap: Math.floor(Math.random() * 10),
			currentParticipants: 19,
			maxParticipants: 20,
			startDate: new Date(),
			endDate: new Date(),
			location: "고성군 죽왕면",
		},
		{
			id: 4,
			noticeBoard: "캠페인 게시판",
			writer: "홍길동",
			title: "지구를 지켜라 환경 캠페인 하실분~!",
			content: `10년마다 평균온도가 1도씩 상승하고 있어요ㅠㅠ 모두들 지구를 지켜라 캠페인 같이해요!!\n모두들 지구를 위해 조그만한 습관을 변경하는 것만으로도 지구의 온도를 낮출 수 있습니다!!`,
			image: require("../../assets/community/campaign4.jpeg"),
			createdAt: new Date(),
			likes: Math.floor(Math.random() * 20),
			comments: Math.floor(Math.random() * 10),
			scrap: Math.floor(Math.random() * 10),
			currentParticipants: 120,
			maxParticipants: "무제한",
			startDate: new Date(),
			endDate: new Date(),
			location: "대한민국",
		},
	],

	free: [
		{
			id: 101,
			noticeBoard: "자유 게시판",
			writer: "익명1",
			title: "캡스톤 팀 40 커스텀 챌린지 같이 하실분~",
			content: "저희가 드디어 커스텀 챌린지를 만들었습니다! 환경을 위해 같이 참여해요!!!\n 참가 코드: GreenDay123",
			image: require("../../assets/community/free1.PNG"),
			createdAt: new Date(),
			likes: Math.floor(Math.random() * 20),
			comments: Math.floor(Math.random() * 10),
			scrap: Math.floor(Math.random() * 10),
		},
		{
			id: 102,
			noticeBoard: "자유 게시판",
			writer: "익명2",
			title: "국민대에서 환경보호할만한 것이 뭐가 있을까요??",
			content: "국민대 주변 쓰레기를 줍는 것만으로도 도움이 되겠죠?",
			image: require("../../assets/community/free2.jpg"),
			createdAt: new Date(),
			likes: Math.floor(Math.random() * 20),
			comments: Math.floor(Math.random() * 10),
			scrap: Math.floor(Math.random() * 10),
		},
		{
			id: 103,
			noticeBoard: "자유 게시판",
			writer: "익명3",
			title: "환경을 아끼는 게 생각보다 힘든 것 같아요ㅠㅠ",
			content: "환경 보호를 위해 그린데이 앱을 쓰면서 조금씩 실천 중인데, 생각보다 쉽지 않네요ㅠㅠ\n조언 부탁드립니다.",
			image: "",
			createdAt: new Date(),
			likes: Math.floor(Math.random() * 20),
			comments: Math.floor(Math.random() * 10),
			scrap: Math.floor(Math.random() * 10),
		},
		{
			id: 104,
			noticeBoard: "자유 게시판",
			writer: "익명3",
			title: "그린데이 개발자분들 요청드립니다!",
			content: "쓰레기 백과사전에 데이터 좀 더 추가해주셨으면 좋겠어요!",
			image: "",
			createdAt: new Date(),
			likes: Math.floor(Math.random() * 20),
			comments: Math.floor(Math.random() * 10),
			scrap: Math.floor(Math.random() * 10),
		},
		{
			id: 105,
			noticeBoard: "자유 게시판",
			writer: "익명4",
			title: "생활습관 고치기 커스텀 챌린지 하실분?",
			content: "참가 코드: XTCBG1",
			image: "",
			createdAt: new Date(),
			likes: Math.floor(Math.random() * 20),
			comments: Math.floor(Math.random() * 10),
			scrap: Math.floor(Math.random() * 10),
		},
	],

	info: [
		{
			id: 201,
			noticeBoard: "정보 게시판",
			writer: "익명1",
			title: "사과 심지",
			content: `사과 심, 씨, 씨방은 단단해서 먹을 수 없기 때문에 일반 쓰레기로 생각하기 쉽지만 크기가 작고 쉽게 분해되기 때문에 음식물 쓰레기로 분류됩니다. \n음식물 쓰레기는 살균 처리와 고온 건조 과정을 거쳐 동물용 사료 또는 경작용 퇴비로 재활용됩니다.`,
			image: require("../../assets/community/info1.jpg"),
			createdAt: new Date(),
			likes: 0,
			comments: 0,
			scrap: 0,
		},
		{
			id: 202,
			noticeBoard: "정보 게시판",
			writer: "익명2",
			title: "그거 아세요?!",
			content: "1회용 컵 1개를 재활용하면 0.025kg의 탄소를 절약할 수 있어요!",
			image: require("../../assets/community/info2.jpg"),
			createdAt: new Date(),
			likes: 0,
			comments: 0,
			scrap: 0,
		},
		{
			id: 203,
			noticeBoard: "정보 게시판",
			writer: "익명3",
			title: "종이팩",
			content: "종이팩을 1개 재활용하면 A4용지 5장을 생산할 수 있습니다.",
			image: require("../../assets/community/info3.png"),
			createdAt: new Date(),
			likes: 0,
			comments: 0,
			scrap: 0,
		},
		{
			id: 204,
			noticeBoard: "정보 게시판",
			writer: "익명4",
			title: "일어나서 바로 환기하는 습관 가집시다.",
			content: "창문을 10분 개방하여 환기하면 실내 공기질을 40% 개선할 수 있으니깐 모두 환경을 위해 조금씩 힘 써봐요!",
			image: "",
			createdAt: new Date(),
			likes: 0,
			comments: 0,
			scrap: 0,
		},
		{
			id: 205,
			noticeBoard: "정보 게시판",
			writer: "익명4",
			title: "LED 전구로 바꾸시는 거 어때요?",
			content: "LED 전구를 사용하면 전력 소모를 80% 절약할 수 있으니깐요!",
			image: "",
			createdAt: new Date(),
			likes: 0,
			comments: 0,
			scrap: 0,
		},
	],
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
			}, 500); // 1초 후 리프레시 완료
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
						animateHeight>
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
