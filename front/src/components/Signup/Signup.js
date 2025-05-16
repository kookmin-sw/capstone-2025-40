import React, {useState} from "react";
import {Box, Button, TextField, Typography, InputAdornment, IconButton, CircularProgress} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {signup} from "../../redux/slices/authSlice";
import {area} from "../../area";
import MenuItem from "@mui/material/MenuItem";
import styles from "./Signup.module.css";

const Signup = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();

	// 입력 상태
	const [userid, setUserid] = useState("");
	const [username, setUsername] = useState("");
	const [nickname, setNickname] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [city, setCity] = useState("");
	const [district, setDistrict] = useState("");
	const [loading, setLoading] = useState(false);

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
		if (!email.trim()) newErrors.email = "이메일을 입력해주세요.";
		else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) newErrors.email = "이메일 형식이 알맞지 않습니다.";
		if (!password.trim()) newErrors.password = "비밀번호를 입력해주세요.";
		if (!confirmPassword.trim()) newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
		if (password !== confirmPassword) newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
		if (!city.trim()) newErrors.city = "거주지(시)를 입력해주세요.";
		if (!district.trim()) newErrors.district = "거주지(구)를 입력해주세요.";

		setErrors(newErrors);

		if (Object.keys(newErrors).length === 0) {
			const formData = {
				username: userid,
				email,
				password,
				name: username,
				city,
				district,
				nickname,
				points: 0,
			};
			setLoading(true);
			dispatch(signup(formData))
				.unwrap()
				.then(() => {
					alert("회원가입이 완료되었습니다.");
					navigate("/login");
					setLoading(false);
				})
				.catch((err) => {
					if (err && err.username && Array.isArray(err.username)) {
						alert(err.username[0]);
					} else {
						alert("회원가입에 실패했습니다. 다시 시도해주세요.");
					}
					setLoading(false);
				});
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
				label='이메일'
				variant='standard'
				color='success'
				margin='normal'
				fullWidth
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				error={!!errors.email}
				helperText={errors.email}
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
					select
					className={styles.locationField}
					// label='거주지 (시)'
					variant='standard'
					color='success'
					margin='normal'
					fullWidth
					value={city}
					onChange={(e) => {
						setCity(e.target.value);
						setDistrict("");
					}}
					error={!!errors.city}
					helperText={errors.city}
					SelectProps={{
						displayEmpty: true,
						MenuProps: {
							PaperProps: {
								style: {
									maxHeight: 200,
								},
							},
						},
					}}>
					<MenuItem value='' disabled>
						시 선택
					</MenuItem>
					{area.map((a) => (
						<MenuItem key={a.name} value={a.name}>
							{a.name}
						</MenuItem>
					))}
				</TextField>

				<TextField
					select
					className={styles.locationField}
					// label='거주지 (구)'
					variant='standard'
					color='success'
					margin='normal'
					fullWidth
					value={district}
					onChange={(e) => setDistrict(e.target.value)}
					error={!!errors.district}
					helperText={errors.district}
					disabled={!city}
					SelectProps={{
						displayEmpty: true,
						MenuProps: {
							PaperProps: {
								style: {
									maxHeight: 200,
								},
							},
						},
					}}>
					<MenuItem value='' disabled>
						군/구 선택
					</MenuItem>
					{(area.find((a) => a.name === city)?.subArea || []).map((sub) => (
						<MenuItem key={sub} value={sub}>
							{sub}
						</MenuItem>
					))}
				</TextField>
			</Box>

			{loading ? (
				<Button className={styles.signupButton} fullWidth disabled>
					<CircularProgress size={24} color='success' />
				</Button>
			) : (
				<Button className={styles.signupButton} fullWidth onClick={handleSubmit}>
					회원가입
				</Button>
			)}

			<Typography className={styles.loginText} onClick={() => navigate("/login")}>
				이미 계정이 있으신가요? <strong>로그인하기</strong>
			</Typography>
		</Box>
	);
};

export default Signup;
