import React, {useState} from "react";
import {Box, Typography, TextField, Button} from "@mui/material";
import {useNavigate} from "react-router-dom";
import styles from "./Find.module.css";

const FindId = () => {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [nameError, setNameError] = useState(false);
	const [emailError, setEmailError] = useState(false);

	const handleFindId = () => {
		let hasError = false;

		if (name.trim() === "") {
			setNameError(true);
			hasError = true;
		} else {
			setNameError(false);
		}

		if (email.trim() === "") {
			setEmailError(true);
			hasError = true;
		} else {
			setEmailError(false);
		}

		if (!hasError) {
			// 아이디 찾기 로직
			console.log("이름:", name, "이메일:", email);
		}
	};

	return (
		<Box className={styles.container}>
			<Typography variant='h4' marginTop={10}>
				아이디 찾기
			</Typography>
			<TextField
				label='이름'
				variant='standard'
				fullWidth
				color='success'
				margin='normal'
				className={styles.textField}
				value={name}
				onChange={(e) => setName(e.target.value)}
				error={nameError}
				helperText={nameError ? "이름을 입력해주세요." : ""}
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
			<Button className={styles.button} fullWidth onClick={handleFindId}>
				아이디 찾기
			</Button>

			<Typography className={styles.loginText} onClick={() => navigate("/login")}>
				로그인으로 돌아가기
			</Typography>
		</Box>
	);
};

export default FindId;
