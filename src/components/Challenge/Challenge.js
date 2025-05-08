import React, {useState, useEffect} from "react";
import {Box, Typography, LinearProgress, CircularProgress, Paper} from "@mui/material";
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

	const personalRankData = [
		{name: "사용자A", score: 65, rank: 1},
		{name: "사용자B", score: 63, rank: 2},
		{name: "사용자C", score: 62, rank: 3},
		{name: "나", score: 60, rank: 4},
		{name: "사용자E", score: 58, rank: 5},
		{name: "사용자F", score: 57, rank: 6},
		{name: "사용자G", score: 56, rank: 7},
	];

	const localRankData = [
		{name: "주민1", score: 72, rank: 9},
		{name: "주민2", score: 71, rank: 10},
		{name: "주민3", score: 69, rank: 11},
		{name: "나", score: 67, rank: 12},
		{name: "주민5", score: 65, rank: 13},
		{name: "주민6", score: 64, rank: 14},
	];

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

	useEffect(() => {
		fetchStats();
	}, []);

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
							<Typography className={styles.barTitle}>최대 연속 일수</Typography>
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
						<div className={styles.rank}>4위</div>
					</Box>
					<Box className={styles.rankingItem} onClick={() => openModal("동네 랭킹", localRankData)}>
						<div className={styles.label}>🏡 동네 랭킹</div>
						<div className={styles.rank}>12위</div>
					</Box>
				</Box>

				{/* 종료된 챌린지 섹션 */}
				<Box mt={4}>
					<Typography className={styles.sectionTitle}>종료된 챌린지</Typography>
					{[
						{
							title: "캡스톤 팀 40 챌린지 1",
							date: "2025-04-28 ~ 2025-04-29",
							members: 4,
							progress: 100,
						},
						{
							title: "캡스톤 팀 40 챌린지 2",
							date: "2025-05-01 ~ 2025-05-05",
							members: 4,
							progress: 80,
						},
					].map((challenge, idx) => (
						<Paper key={idx} sx={{p: 2, mb: 2, borderRadius: "12px"}}>
							<Typography fontWeight='bold' sx={{color: "#2e7d32", fontSize: "16px"}}>
								{challenge.title}
							</Typography>
							<Box display='flex' alignItems='center' justifyContent='center' gap={2} mt={0.5}>
								<Box display='flex' alignItems='center' gap={0.5}>
									<CalendarMonthIcon sx={{fontSize: 16, color: "#4caf50"}} />
									<Typography sx={{fontSize: "14px", color: "#4caf50"}}>{challenge.date}</Typography>
								</Box>
								<Box display='flex' alignItems='center' gap={0.5}>
									<GroupsIcon sx={{fontSize: 16, color: "#4caf50"}} />
									<Typography sx={{fontSize: "14px", color: "#4caf50"}}>{challenge.members}</Typography>
								</Box>
							</Box>
							<Box display='flex' alignItems='center' gap={1} mt={1}>
								<LinearProgress className={styles.progressBar} variant='determinate' value={challenge.progress} />
								<Typography fontWeight='bold' color='#4caf50' minWidth={40}>
									{challenge.progress}%
								</Typography>
							</Box>
						</Paper>
					))}
				</Box>

				<ChallengeModal
					open={modalOpen}
					onClose={() => setModalOpen(false)}
					rankData={selectedRankData}
					title={modalTitle}
				/>
			</Box>
		</PullToRefresh>
	);
};

export default Challenge;
