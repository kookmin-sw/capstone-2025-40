import React, {useState, useEffect} from "react";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import InstallPrompt from "./components/InstallPrompt/InstallPrompt";
import Login from "./components/Login/Login";
import FindId from "./components/Find/FindId";
import FindPassword from "./components/Find/FindPassword";
import Signup from "./components/Signup/Signup";
import Main from "./components/Main/Main";
import PostDetail from "./components/PostDetail/PostDetail";
import PostCreate from "./components/PostCreate/PostCreate";
import MyPosts from "./components/MyPosts/MyPosts";
import Profile from "./components/Profile/Profile";
import TrashDictionary from "./components/TrashDictionary/TrashDictionary";
import TrashDetailPage from "./components/TrashDictionary/TrashDetailPage";

const App = () => {
	const [isInstalled, setIsInstalled] = useState(
		() => localStorage.getItem("pwaInstalled") === "true" // PWA 설치 상태를 로컬스토리지에서 확인
	);

	useEffect(() => {
		// PWA가 설치되었는지 확인
		if (window.matchMedia("(display-mode: standalone)").matches) {
			setIsInstalled(true);
			localStorage.setItem("pwaInstalled", "true"); // PWA 설치 상태 저장
		}
	}, []);

	return (
		<Router>
			<Routes>
				{/* PWA가 설치되지 않았다면 InstallPrompt를 먼저 보여줌 */}
				{!isInstalled ? (
					<Route path='*' element={<InstallPrompt onInstall={() => setIsInstalled(true)} />} />
				) : (
					<>
						<Route path='/login' element={<Login />} />
						<Route path='/find-id' element={<FindId />} />
						<Route path='/find-password' element={<FindPassword />} />
						<Route path='/signup' element={<Signup />} />
						<Route path='/main/*' element={<Main />} />
						<Route path='/post/:id' element={<PostDetail />} />
						<Route path='/post/create' element={<PostCreate />} />
						<Route path='/myposts' element={<MyPosts />} />
						<Route path='/profile' element={<Profile />} />
						<Route path='/trashdictionary' element={<TrashDictionary />} />
						<Route path='/trash/:id' element={<TrashDetailPage />} />
						{/* 기본적으로 로그인 페이지로 이동 */}
						<Route path='*' element={<Navigate to='/login' />} />
					</>
				)}
			</Routes>
		</Router>
	);
};

export default App;
