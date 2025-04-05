import React, {useState, useRef} from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Checkbox,
	FormControlLabel,
	InputAdornment,
	IconButton,
} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import styles from "./Login.module.css";

const Login = () => {
	const navigate = useNavigate();
	const [autoLogin, setAutoLogin] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [username, setUsername] = useState(""); // 아이디
	const [password, setPassword] = useState(""); // 비밀번호
	const [usernameError, setUsernameError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const passwordRef = useRef(null);

	const handleTogglePassword = () => {
		setShowPassword((prev) => !prev);
	};

	const handleLogin = () => {
		let hasError = false;
		if (username.trim() === "") {
			setUsernameError(true);
			hasError = true;
		} else {
			setUsernameError(false);
		}

		if (password.trim() === "") {
			setPasswordError(true);
			hasError = true;
		} else {
			setPasswordError(false);
		}

		if (!hasError) {
			// 로그인 로직 실행
			console.log("로그인 시도:", {username, password});
			navigate("/main/home");
		}
	};

	return (
		<Box className={styles.container}>
			<Typography variant='h4' marginTop={10}>
				로그인
			</Typography>
			{/* 아이디 입력창 */}
			<TextField
				label='아이디'
				variant='standard'
				margin='normal'
				fullWidth
				color='success'
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				className={styles.textField}
				error={usernameError}
				helperText={usernameError ? "아이디를 입력해주세요." : ""}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						handleLogin();
					}
				}}
			/>
			{/* 비밀번호 입력창 */}
			<TextField
				label='비밀번호'
				type={showPassword ? "text" : "password"}
				variant='standard'
				margin='normal'
				fullWidth
				color='success'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className={styles.textField}
				error={passwordError}
				helperText={passwordError ? "비밀번호를 입력해주세요." : ""}
				inputRef={passwordRef}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						handleLogin();
					}
				}}
				slotProps={{
					input: {
						endAdornment: (
							<InputAdornment position='end'>
								<IconButton onClick={handleTogglePassword} edge='end'>
									{showPassword ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							</InputAdornment>
						),
					},
				}}
			/>
			<FormControlLabel
				className={styles.autoLogin}
				control={<Checkbox checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)} color='success' />}
				label='자동 로그인'
			/>
			<Button className={styles.loginButton} fullWidth onClick={handleLogin}>
				로그인
			</Button>
			<Box className={styles.findBox}>
				<Typography className={styles.signupText} onClick={() => navigate("/find-id")}>
					아이디 찾기
				</Typography>
				<Typography className={styles.findTextDivider}>|</Typography>
				<Typography className={styles.signupText} onClick={() => navigate("/find-password")}>
					비밀번호 찾기
				</Typography>
			</Box>
			<Typography className={styles.signupText} onClick={() => navigate("/signup")}>
				혹시 회원이 아니신가요? <strong>회원가입하기</strong>
			</Typography>
		</Box>
	);
};

export default Login;
