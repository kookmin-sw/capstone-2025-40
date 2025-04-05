import React, {useState} from "react";
import {Box, Typography, LinearProgress} from "@mui/material";
import styles from "./Challenge.module.css";
import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LabelList} from "recharts";
import ChallengeModal from "./ChallengeModal";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PullToRefresh from "../PullToRefresh/PullToRefresh";

const weekData = [
	{day: "월", value: 2},
	{day: "화", value: 4},
	{day: "수", value: 1},
	{day: "목", value: 3},
	{day: "금", value: 5},
	{day: "토", value: 2},
	{day: "일", value: 4},
];

const monthData = [
	{week: "1주차", value: 12},
	{week: "2주차", value: 15},
	{week: "3주차", value: 8},
	{week: "4주차", value: 10},
];

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

const Challenge = () => {
	const [progress] = useState(60);
	const [modalOpen, setModalOpen] = useState(false);
	const [modalTitle, setModalTitle] = useState("");
	const [selectedRankData, setSelectedRankData] = useState([]);
	const [refreshKey, setRefreshKey] = useState(0);

	const openModal = (title, data) => {
		setModalTitle(title);
		setSelectedRankData(data);
		setModalOpen(true);
	};

	const handleRefresh = () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				setRefreshKey((prev) => prev + 1); // 다시 렌더링
				resolve();
			}, 1000);
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
						<ResponsiveContainer width='100%' height={200}>
							<LineChart data={weekData}>
								<XAxis dataKey='day' />
								<YAxis />
								<Tooltip formatter={(value) => [`${value}개`, "달성 수"]} />
								<Line type='monotone' dataKey='value' stroke='#66bb6a' strokeWidth={3} />
							</LineChart>
						</ResponsiveContainer>
					</Box>

					<Box className={styles.chartContainer}>
						<Typography variant='subtitle1' className={styles.sectionTitle}>
							<CalendarTodayIcon fontSize='small' /> 월간 현황
						</Typography>
						<ResponsiveContainer width='100%' height={200}>
							<LineChart data={monthData}>
								<XAxis dataKey='week' />
								<YAxis />
								<Tooltip formatter={(value) => [`${value}개`, "달성 수"]} />
								<Line type='monotone' dataKey='value' stroke='#43a047' strokeWidth={3} />
							</LineChart>
						</ResponsiveContainer>
					</Box>
				</Box>

				<Box className={styles.chartContainer}>
					<Typography className={styles.sectionTitle}>📊 전체 분석</Typography>
					<Box className={styles.dualBarWrapper}>
						{/* 최대 연속 일수 */}
						<Box className={styles.barItem}>
							<Typography className={styles.barTitle}>최대 연속 일수</Typography>
							<ResponsiveContainer width='100%' height={150}>
								<BarChart data={[{name: "연속", value: 15}]}>
									<XAxis dataKey='name' hide />
									<YAxis hide domain={[0, 50]} />
									<Tooltip formatter={(value) => [`${value}개`, "달성 수"]} />
									<Bar dataKey='value' fill='#66bb6a' barSize={30} radius={[6, 6, 0, 0]}>
										<LabelList dataKey='value' position='top' />
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						</Box>

						{/* 전체 달성 일수 */}
						<Box className={styles.barItem}>
							<Typography className={styles.barTitle}>전체 달성 일수</Typography>
							<ResponsiveContainer width='100%' height={150}>
								<BarChart data={[{name: "전체", value: 40}]}>
									<XAxis dataKey='name' hide />
									<YAxis hide domain={[0, 50]} />
									<Tooltip formatter={(value) => [`${value}개`, "달성 수"]} />
									<Bar dataKey='value' fill='#66bb6a' barSize={30} radius={[6, 6, 0, 0]}>
										<LabelList dataKey='value' position='top' />
									</Bar>
								</BarChart>
							</ResponsiveContainer>
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
