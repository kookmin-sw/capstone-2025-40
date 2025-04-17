import React, {useState, useEffect} from "react";
import {Box, Typography, LinearProgress, CircularProgress} from "@mui/material";
import styles from "./Challenge.module.css";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LabelList} from "recharts";
import ChallengeModal from "./ChallengeModal";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
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
