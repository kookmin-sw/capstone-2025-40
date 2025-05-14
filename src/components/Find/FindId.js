import React, {useState} from "react";
import {Box, Typography, TextField, Button, CircularProgress} from "@mui/material";
import {useNavigate} from "react-router-dom";
import styles from "./Find.module.css";
import axiosInstance from "../../axiosInstance";

const FindId = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState(false);
	const [resultMessage, setResultMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleFindId = async () => {
		let hasError = false;

		if (email.trim() === "") {
			setEmailError(true);
			hasError = true;
		} else {
			setEmailError(false);
		}

		if (!hasError) {
			setIsLoading(true);
			try {
				const response = await axiosInstance.post("/users/auth/find-username/", {email});
				setResultMessage(`아이디: ${response.data.username}`);
			} catch (error) {
				if (error.response?.status === 404) {
					setResultMessage("해당 이메일로 가입된 계정이 없습니다.");
				} else {
					setResultMessage("아이디 찾기에 실패했습니다. 다시 시도해주세요.");
				}
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<Box className={styles.container}>
			<Typography variant='h4' marginTop={10}>
				아이디 찾기
			</Typography>
			<TextField
				label='이메일'
				variant='standard'
				fullWidth
				color='success'
				margin='normal'
				className={styles.textField}
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				error={emailError}
				helperText={emailError ? "이메일을 입력해주세요." : ""}
			/>
			<Button className={styles.button} fullWidth onClick={handleFindId} disabled={isLoading}>
				{isLoading ? <CircularProgress size={24} color='success' /> : "아이디 찾기"}
			</Button>
			{resultMessage && (
				<Typography color='textSecondary' marginTop={2}>
					{resultMessage}
				</Typography>
			)}
			<Typography className={styles.loginText} onClick={() => navigate("/login")}>
				로그인으로 돌아가기
			</Typography>
		</Box>
	);
};

export default FindId;
