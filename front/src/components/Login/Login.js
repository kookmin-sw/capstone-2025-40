import React, {useState, useRef, useEffect} from "react";
import {
	Box,
	Button,
	TextField,
	Typography,
	Checkbox,
	FormControlLabel,
	InputAdornment,
	IconButton,
	CircularProgress,
} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {login} from "../../redux/slices/authSlice";
import styles from "./Login.module.css";

const Login = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const {loading, error} = useSelector((state) => state.auth);
	const [autoLogin, setAutoLogin] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [username, setUsername] = useState(""); // 아이디
	const [password, setPassword] = useState(""); // 비밀번호
	const [usernameError, setUsernameError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const passwordRef = useRef(null);

	useEffect(() => {
		const autoLoginFlag = localStorage.getItem("autoLogin");
		const userData = localStorage.getItem("user");
		if (autoLoginFlag && userData) {
			navigate("/main/home");
		}
	}, []);

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
			dispatch(login({username, password}))
				.unwrap()
				.then((res) => {
					console.log("로그인 응답:", res);
					localStorage.setItem("user", JSON.stringify(res));
					if (autoLogin) {
						localStorage.setItem("autoLogin", "true");
					}
					navigate("/main/home");
				})
				.catch((err) => alert("로그인에 실패했습니다. 다시 시도해주세요."));
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
			{loading ? (
				<Button className={styles.loginButton} fullWidth disabled>
					<CircularProgress size={24} color='success' />
				</Button>
			) : (
				<Button className={styles.loginButton} fullWidth onClick={handleLogin}>
					로그인
				</Button>
			)}
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
