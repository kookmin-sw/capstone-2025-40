import React from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Box, Typography, IconButton, Paper} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import trashData from "../../trashData";
import styles from "./TrashDetailPage.module.css";

const TrashDetailPage = () => {
	const {id} = useParams();
	const navigate = useNavigate();
	const numericId = parseInt(id);

	const foundItem = trashData.flatMap((category) => category.items).find((item) => item.id === numericId);

	if (!foundItem) {
		return (
			<Box className={styles.container}>
				<Typography>해당 항목을 찾을 수 없습니다.</Typography>
			</Box>
		);
	}

	return (
		<Box className={styles.container}>
			<Box className={styles.header}>
				<IconButton onClick={() => navigate(-1)} sx={{padding: 0}}>
					<ArrowBackIosNewIcon />
				</IconButton>
				<Typography className={styles.boardTitle}>{foundItem.name}</Typography>
			</Box>

			<Box className={styles.content}>
				<Typography variant='body2' color='text.secondary' sx={{mb: 1, mt: 3}}>
					재활용: {foundItem.recyclable ? "가능" : "불가능"}
				</Typography>
				<Typography variant='body2' color='text.secondary' sx={{mb: 2}}>
					분류: {foundItem.categories?.join(", ") || "알 수 없음"}
				</Typography>
				<Typography variant='h6' className={styles.subtitle}>
					버리는 방법
				</Typography>
				<Paper elevation={1} sx={{p: 2, backgroundColor: "#fefefe", borderRadius: "12px", color: "#555"}}>
					{foundItem.howToDispose
						.split("- ")
						.filter((line) => line.trim() !== "")
						.map((line, index) => (
							<Typography key={index} className={styles.description} sx={{mb: 1}}>
								- {line.trim()}
							</Typography>
						))}
				</Paper>
			</Box>
		</Box>
	);
};

export default TrashDetailPage;
