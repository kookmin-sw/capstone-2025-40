import React, {useState, useEffect, useCallback} from "react";
import {
	Box,
	Typography,
	LinearProgress,
	CircularProgress,
	Paper,
	Dialog,
	DialogContent,
	IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import styles from "./Challenge.module.css";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LabelList} from "recharts";
import ChallengeModal from "./ChallengeModal";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupsIcon from "@mui/icons-material/Groups";
import PullToRefresh from "../PullToRefresh/PullToRefresh";
import axiosInstance from "../../axiosInstance";

const Challenge = () => {
	const [progress, setProgress] = useState(0);
	const [weekData, setWeekData] = useState([]);
	const [monthData, setMonthData] = useState([]);
	const [maxStreak, setMaxStreak] = useState(0);
	const [totalSuccessDays, setTotalSuccessDays] = useState(0);
	const [loading, setLoading] = useState(true);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalTitle, setModalTitle] = useState("");
	const [selectedRankData, setSelectedRankData] = useState([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [participantAnchorEl, setParticipantAnchorEl] = useState(null);
	const participantOpen = Boolean(participantAnchorEl);
	const [participantList, setParticipantList] = useState([]);

	const [personalRankData, setPersonalRankData] = useState([]);
	const [localRankData, setLocalRankData] = useState([]);
	const [myPersonalRank, setMyPersonalRank] = useState(null);
	const [myLocalRank, setMyLocalRank] = useState(null);

	const [endedChallenges, setEndedChallenges] = useState([]);

	const [previewImage, setPreviewImage] = useState(null);

	const fetchLocalRanking = useCallback(async () => {
		try {
			const res = await axiosInstance.get("/users/rankings/local/");
			const formatted = res.data.results.map((user) => ({
				name: user.nickname,
				username: user.username,
				score: user.points ?? 0,
				rank: user.rank,
			}));
			setLocalRankData(formatted);

			const user = JSON.parse(localStorage.getItem("user"));
			const myData = res.data.results.find((u) => u.username === user.username);
			if (myData) setMyLocalRank(myData.rank);
		} catch (error) {
			console.error("동네 랭킹 데이터 불러오기 실패:", error);
		}
	}, []);

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await axiosInstance.get("/users/my-challenge-stats/");
			const data = response.data;

			setProgress(data.today.progress || 0);
			setWeekData(
				data.weekly.map((item) => ({
					day: new Date(item.date).toLocaleDateString("ko-KR", {weekday: "short"}),
					value: item.count,
				}))
			);
			setMonthData(
				data.monthly.map((item) => ({
					week: `${item.week}주차`,
					value: item.count,
				}))
			);
			setMaxStreak(data.max_streak || 0);
			setTotalSuccessDays(data.total_success_days || 0);
		} catch (error) {
			console.error("통계 데이터 가져오기 실패:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchPersonalRanking = useCallback(async () => {
		try {
			const res = await axiosInstance.get("/users/rankings/global/");
			const formatted = res.data.results.map((user) => ({
				name: user.nickname,
				username: user.username,
				score: user.points ?? 0,
				rank: user.rank,
			}));
			setPersonalRankData(formatted);

			const user = JSON.parse(localStorage.getItem("user"));
			const myData = res.data.results.find((u) => u.username === user.username);
			if (myData) setMyPersonalRank(myData.rank);
		} catch (error) {
			console.error("개인 랭킹 데이터 불러오기 실패:", error);
		}
	}, []);

	const fetchEndedChallenges = async () => {
		try {
			const res = await axiosInstance.get("/users/custom-challenge/my-ended/");
			setEndedChallenges(res.data);
		} catch (err) {
			console.error("종료된 챌린지 데이터 불러오기 실패:", err);
		}
	};

	useEffect(() => {
		fetchStats();
		fetchPersonalRanking();
		fetchLocalRanking();
		fetchEndedChallenges();
	}, [fetchPersonalRanking, fetchLocalRanking]);

	const openModal = (title, data) => {
		setModalTitle(title);
		setSelectedRankData(data);
		setModalOpen(true);
	};

	const handleRefresh = () => {
		return new Promise((resolve) => {
			fetchStats().then(() => {
				setTimeout(resolve, 500);
			});
		});
	};

	return (
		<PullToRefresh onRefresh={handleRefresh}>
			<Box className={styles.container}>
				<Typography className={styles.sectionTitle}>오늘의 챌린지 현황 🔥</Typography>
				<Box className={styles.progressBox}>
					<LinearProgress variant='determinate' value={progress} className={styles.progressBar} />
					<Typography className={styles.progressText}>{progress}%</Typography>
				</Box>

				<Box className={styles.chartRow}>
					<Box className={styles.chartContainer}>
						<Typography variant='subtitle1' className={styles.sectionTitle}>
							<TrendingUpIcon fontSize='small' /> 주간 현황
						</Typography>
						{loading ? (
							<Box display='flex' justifyContent='center' alignItems='center' height={200}>
								<CircularProgress color='success' />
							</Box>
						) : (
							<ResponsiveContainer width='100%' height={200}>
								<LineChart data={weekData}>
									<XAxis dataKey='day' />
									<YAxis />
									<Tooltip formatter={(value) => [`${value}개`, "달성 수"]} />
									<Line type='monotone' dataKey='value' stroke='#66bb6a' strokeWidth={3} />
								</LineChart>
							</ResponsiveContainer>
						)}
					</Box>

					<Box className={styles.chartContainer}>
						<Typography variant='subtitle1' className={styles.sectionTitle}>
							<CalendarTodayIcon fontSize='small' /> 월간 현황
						</Typography>
						{loading ? (
							<Box display='flex' justifyContent='center' alignItems='center' height={200}>
								<CircularProgress color='success' />
							</Box>
						) : (
							<ResponsiveContainer width='100%' height={200}>
								<LineChart data={monthData}>
									<XAxis dataKey='week' />
									<YAxis />
									<Tooltip formatter={(value) => [`${value}개`, "달성 수"]} />
									<Line type='monotone' dataKey='value' stroke='#43a047' strokeWidth={3} />
								</LineChart>
							</ResponsiveContainer>
						)}
					</Box>
				</Box>

				<Box className={styles.chartContainer}>
					<Typography className={styles.sectionTitle}>📊 전체 분석</Typography>
					<Box className={styles.dualBarWrapper}>
						{/* 최대 연속 일수 */}
						<Box className={styles.barItem}>
							<Typography className={styles.barTitle}>현재 연속 일수</Typography>
							{loading ? (
								<Box display='flex' justifyContent='center' alignItems='center' height={150}>
									<CircularProgress color='success' />
								</Box>
							) : (
								<ResponsiveContainer width='100%' height={150}>
									<BarChart data={[{name: "연속", value: maxStreak}]}>
										<XAxis dataKey='name' hide />
										<YAxis hide domain={[0, Math.max(10, maxStreak + 2)]} />
										<Tooltip formatter={(value) => [`${value}개`, "달성 수"]} />
										<Bar dataKey='value' fill='#66bb6a' barSize={30} radius={[6, 6, 0, 0]}>
											<LabelList dataKey='value' position='top' />
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							)}
						</Box>

						{/* 전체 달성 일수 */}
						<Box className={styles.barItem}>
							<Typography className={styles.barTitle}>전체 달성 일수</Typography>
							{loading ? (
								<Box display='flex' justifyContent='center' alignItems='center' height={150}>
									<CircularProgress color='success' />
								</Box>
							) : (
								<ResponsiveContainer width='100%' height={150}>
									<BarChart data={[{name: "전체", value: totalSuccessDays}]}>
										<XAxis dataKey='name' hide />
										<YAxis hide domain={[0, Math.max(10, totalSuccessDays + 5)]} />
										<Tooltip formatter={(value) => [`${value}개`, "달성 수"]} />
										<Bar dataKey='value' fill='#66bb6a' barSize={30} radius={[6, 6, 0, 0]}>
											<LabelList dataKey='value' position='top' />
										</Bar>
									</BarChart>
								</ResponsiveContainer>
							)}
						</Box>
					</Box>
				</Box>

				<Box className={styles.rankingBox}>
					<Box className={styles.rankingItem} onClick={() => openModal("개인 랭킹", personalRankData)}>
						<div className={styles.label}>🥇 개인 랭킹</div>
						<div className={styles.rank}>{myPersonalRank ? `${myPersonalRank}위` : "-"}</div>
					</Box>
					<Box className={styles.rankingItem} onClick={() => openModal("동네 랭킹", localRankData)}>
						<div className={styles.label}>🏡 동네 랭킹</div>
						<div className={styles.rank}>{myLocalRank ? `${myLocalRank}위` : "-"}</div>
					</Box>
				</Box>

				{/* 종료된 챌린지 섹션 */}
				<Box mt={4}>
					<Typography className={styles.sectionTitle}>종료된 챌린지</Typography>
					{endedChallenges.length > 0 &&
						endedChallenges.map((challenge, idx) => {
							const progress =
								challenge.total_assignment_count > 0
									? Math.round((challenge.completed_assignment_count / challenge.total_assignment_count) * 100)
									: 0;
							const dateRange = `${challenge.start_date} ~ ${challenge.end_date}`;
							const members = challenge.participants.length;

							return (
								<Paper key={idx} sx={{p: 2, mb: 2, borderRadius: "12px"}}>
									<Typography fontWeight='bold' sx={{color: "#2e7d32", fontSize: "16px"}}>
										{challenge.title}
									</Typography>
									<Box display='flex' alignItems='center' justifyContent='center' gap={2} mt={0.5}>
										<Box display='flex' alignItems='center' gap={0.5}>
											<CalendarMonthIcon sx={{fontSize: 16, color: "#4caf50"}} />
											<Typography sx={{fontSize: "14px", color: "#4caf50"}}>{dateRange}</Typography>
										</Box>
										<Box
											display='flex'
											alignItems='center'
											gap={0.5}
											onClick={(e) => {
												setParticipantAnchorEl(e.currentTarget);
												setParticipantList(challenge.participants);
											}}
											sx={{cursor: "pointer"}}>
											<GroupsIcon sx={{fontSize: 16, color: "#4caf50"}} />
											<Typography sx={{fontSize: "14px", color: "#4caf50"}}>{members}</Typography>
										</Box>
									</Box>
									{challenge.badge_image && (
										<Box display='flex' alignItems='center' justifyContent='center' gap={1} mt={1}>
											<Typography sx={{fontSize: "14px", color: "#4caf50"}}>달성 뱃지:</Typography>
											<Box onClick={() => setPreviewImage(challenge.badge_image)} sx={{cursor: "pointer"}}>
												<img
													src={challenge.badge_image}
													alt='뱃지 이미지'
													style={{
														width: "32px",
														height: "32px",
														borderRadius: "50%",
														objectFit: "cover",
													}}
												/>
											</Box>
										</Box>
									)}
									<Box display='flex' alignItems='center' gap={1} mt={1}>
										<LinearProgress className={styles.progressBar} variant='determinate' value={progress} />
										<Typography fontWeight='bold' color='#4caf50' minWidth={40}>
											{progress}%
										</Typography>
									</Box>
								</Paper>
							);
						})}
					<Menu
						anchorEl={participantAnchorEl}
						open={participantOpen}
						onClose={() => setParticipantAnchorEl(null)}
						anchorOrigin={{vertical: "bottom", horizontal: "center"}}
						transformOrigin={{vertical: "top", horizontal: "center"}}>
						{participantList.map((p) => (
							<MenuItem key={p.id} sx={{fontSize: "14px", color: "#555"}}>
								{p.nickname + (p.is_me ? " (나)" : "")}
							</MenuItem>
						))}
					</Menu>
				</Box>

				<ChallengeModal
					open={modalOpen}
					onClose={() => setModalOpen(false)}
					rankData={selectedRankData}
					title={modalTitle}
				/>
				{previewImage && (
					<Dialog open={true} onClose={() => setPreviewImage(null)}>
						<Box display='flex' justifyContent='flex-end' p={1}>
							<IconButton onClick={() => setPreviewImage(null)} size='small'>
								<CloseIcon />
							</IconButton>
						</Box>
						<DialogContent>
							<img src={previewImage} alt='미리보기' style={{width: "100%", height: "auto"}} />
						</DialogContent>
					</Dialog>
				)}
			</Box>
		</PullToRefresh>
	);
};

export default Challenge;
