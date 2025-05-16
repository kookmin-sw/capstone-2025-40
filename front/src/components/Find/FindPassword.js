import React, {useState, useEffect} from "react";
import {Box, Typography, TextField, Button, CircularProgress} from "@mui/material";
import {useNavigate} from "react-router-dom";
import styles from "./Find.module.css";
import axiosInstance from "../../axiosInstance";

const FindPassword = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState(false);
	const [resultMessage, setResultMessage] = useState("");
	const [code, setCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [step, setStep] = useState("request"); // 'request' | 'reset'
	const [timer, setTimer] = useState(600);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let interval;
		if (step === "reset" && timer > 0) {
			interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [step, timer]);

	const handleFindPassword = async () => {
		if (step === "request") {
			if (email.trim() === "") {
				setEmailError(true);
				return;
			}
			setEmailError(false);
			setIsLoading(true);
			try {
				const response = await axiosInstance.post("/users/auth/password/reset/code/", {email});
				setResultMessage(response.data.detail || "이메일로 인증번호를 발송했습니다.");
				setStep("reset");
				setTimer(600);
			} catch (error) {
				setResultMessage("인증번호 발송에 실패했습니다. 다시 시도해주세요.");
			} finally {
				setIsLoading(false);
			}
		} else if (step === "reset") {
			setIsLoading(true);
			try {
				const response = await axiosInstance.post("/users/auth/password/reset/confirm-code/", {
					email,
					code,
					new_password: newPassword,
				});
				setResultMessage(response.data.detail || "비밀번호가 변경되었습니다.");
				alert("비밀번호가 변경되었습니다.");
				navigate("/login");
			} catch (error) {
				const msg = error.response?.data?.detail || "비밀번호 재설정에 실패했습니다.";
				setResultMessage(msg);
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<Box className={styles.container}>
			<Typography variant='h4' marginTop={10}>
				비밀번호 재설정
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
			{step === "reset" && (
				<>
					<TextField
						label='인증번호'
						variant='standard'
						fullWidth
						color='success'
						margin='normal'
						className={styles.textField}
						value={code}
						onChange={(e) => setCode(e.target.value)}
					/>
					<TextField
						label='새 비밀번호'
						type='password'
						variant='standard'
						fullWidth
						color='success'
						margin='normal'
						className={styles.textField}
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
					/>
					<Typography variant='body2' color='textSecondary'>
						남은 시간: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
					</Typography>
				</>
			)}
			<Button className={styles.button} fullWidth onClick={handleFindPassword} disabled={isLoading}>
				{isLoading ? (
					<CircularProgress size={24} color='success' />
				) : step === "request" ? (
					"인증번호 요청"
				) : (
					"비밀번호 재설정"
				)}
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

export default FindPassword;
