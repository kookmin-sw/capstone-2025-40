import React, {useState} from "react";
import {Box, Button, TextField, Typography, InputAdornment, IconButton} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import styles from "./Signup.module.css";

const Signup = () => {
	const navigate = useNavigate();

	// 입력 상태
	const [userid, setUserid] = useState("");
	const [username, setUsername] = useState("");
	const [nickname, setNickname] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [city, setCity] = useState("");
	const [district, setDistrict] = useState("");

	// 에러 상태
	const [errors, setErrors] = useState({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleTogglePassword = () => setShowPassword(!showPassword);
	const handleToggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

	const handleSubmit = () => {
		const newErrors = {};

		if (!userid.trim()) newErrors.userid = "아이디를 입력해주세요.";
		if (!username.trim()) newErrors.username = "이름을 입력해주세요.";
		if (!nickname.trim()) newErrors.nickname = "닉네임을 입력해주세요.";
		if (!password.trim()) newErrors.password = "비밀번호를 입력해주세요.";
		if (!confirmPassword.trim()) newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
		if (password !== confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
		if (!city.trim()) newErrors.city = "거주지(시)를 입력해주세요.";
		if (!district.trim()) newErrors.district = "거주지(구)를 입력해주세요.";

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			console.log("회원가입 정보:", {userid, nickname, password, city, district});
			// 실제 회원가입 처리
		}
	};

	return (
		<Box className={styles.container}>
			<Typography variant='h4' marginTop={10}>
				회원가입
			</Typography>

			<TextField
				className={styles.textField}
				label='아이디'
				variant='standard'
				color='success'
				margin='normal'
				fullWidth
				value={userid}
				onChange={(e) => setUserid(e.target.value)}
				error={!!errors.userid}
				helperText={errors.userid}
			/>

			<TextField
				className={styles.textField}
				label='이름'
				variant='standard'
				color='success'
				margin='normal'
				fullWidth
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				error={!!errors.username}
				helperText={errors.username}
			/>

			<TextField
				className={styles.textField}
				label='닉네임'
				color='success'
				variant='standard'
				margin='normal'
				fullWidth
				value={nickname}
				onChange={(e) => setNickname(e.target.value)}
				error={!!errors.nickname}
				helperText={errors.nickname}
			/>

			<TextField
				className={styles.textField}
				label='비밀번호'
				type={showPassword ? "text" : "password"}
				variant='standard'
				color='success'
				margin='normal'
				fullWidth
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				error={!!errors.password}
				helperText={errors.password}
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

			<TextField
				className={styles.textField}
				label='비밀번호 확인'
				type={showConfirmPassword ? "text" : "password"}
				variant='standard'
				color='success'
				margin='normal'
				fullWidth
				value={confirmPassword}
				onChange={(e) => setConfirmPassword(e.target.value)}
				error={!!errors.confirmPassword}
				helperText={errors.confirmPassword}
				slotProps={{
					input: {
						endAdornment: (
							<InputAdornment position='end'>
								<IconButton onClick={handleToggleConfirmPassword} edge='end'>
									{showConfirmPassword ? <VisibilityOff /> : <Visibility />}
								</IconButton>
							</InputAdornment>
						),
					},
				}}
			/>

			{/* 거주지 수평 정렬 */}
			<Box className={styles.locationContainer}>
				<TextField
					className={styles.locationField}
					label='거주지 (시)'
					variant='standard'
					color='success'
					margin='normal'
					fullWidth
					value={city}
					onChange={(e) => setCity(e.target.value)}
					error={!!errors.city}
					helperText={errors.city}
				/>
				<TextField
					className={styles.locationField}
					label='거주지 (구)'
					variant='standard'
					color='success'
					margin='normal'
					fullWidth
					value={district}
					onChange={(e) => setDistrict(e.target.value)}
					error={!!errors.district}
					helperText={errors.district}
				/>
			</Box>

			<Button className={styles.signupButton} fullWidth onClick={handleSubmit}>
				회원가입
			</Button>

			<Typography className={styles.loginText} onClick={() => navigate("/login")}>
				이미 계정이 있으신가요? <strong>로그인하기</strong>
			</Typography>
		</Box>
	);
};

export default Signup;
