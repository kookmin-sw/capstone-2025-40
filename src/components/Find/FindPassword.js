import React, {useState} from "react";
import {Box, Typography, TextField, Button} from "@mui/material";
import {useNavigate} from "react-router-dom";
import styles from "./Find.module.css";

const FindPassword = () => {
	const navigate = useNavigate();
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [usernameError, setUsernameError] = useState(false);
	const [emailError, setEmailError] = useState(false);

	const handleFindPassword = () => {
		let hasError = false;

		if (username.trim() === "") {
			setUsernameError(true);
			hasError = true;
		} else {
			setUsernameError(false);
		}

		if (email.trim() === "") {
			setEmailError(true);
			hasError = true;
		} else {
			setEmailError(false);
		}

		if (!hasError) {
			// 비밀번호 재설정 로직
			console.log("아이디:", username, "이메일:", email);
		}
	};

	return (
		<Box className={styles.container}>
			<Typography variant='h4' marginTop={10}>
				비밀번호 찾기
			</Typography>
			<TextField
				label='아이디'
				variant='standard'
				fullWidth
				color='success'
				margin='normal'
				className={styles.textField}
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				error={usernameError}
				helperText={usernameError ? "아이디를 입력해주세요." : ""}
			/>
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
			<Button className={styles.button} fullWidth onClick={handleFindPassword}>
				비밀번호 재설정
			</Button>
			<Typography className={styles.loginText} onClick={() => navigate("/login")}>
				로그인으로 돌아가기
			</Typography>
		</Box>
	);
};

export default FindPassword;
