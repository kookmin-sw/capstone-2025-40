import React from "react";
import {Box, Typography, Modal, Button} from "@mui/material";
import styles from "./ChallengeModal.module.css";

const ChallengeModal = ({open, onClose, rankData, title}) => {
	return (
		<Modal open={open} onClose={onClose}>
			<Box className={styles.modalWrapper}>
				<Typography className={styles.modalTitle}>{title || "내 랭킹 주변 보기"}</Typography>
				<Box className={styles.modalContent}>
					{rankData.map((r, i) => {
						const isMe = r.name === "나";
						const displayName = `${r.name} (${r.rank}위)`;

						return (
							<Box key={i} className={styles.modalListItem}>
								<span className={isMe ? styles.modalHighlight : ""}>{displayName}</span>
								<span className={isMe ? styles.modalHighlight : ""}>{r.score}점</span>
							</Box>
						);
					})}
				</Box>
				<Button
					fullWidth
					onClick={onClose}
					className={styles.closeButton} // ✅ 스타일 클래스 추가
				>
					닫기
				</Button>
			</Box>
		</Modal>
	);
};

export default ChallengeModal;
