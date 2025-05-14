import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axiosInstance from "../../axiosInstance";

const storedUser = localStorage.getItem("user");
const storedAutoLogin = localStorage.getItem("autoLogin");
const initialState = {
	user: storedAutoLogin ? JSON.parse(storedUser) : null,
	loading: false,
	error: null,
};

// 회원가입 요청 thunk
export const signup = createAsyncThunk("auth/signup", async (formData, {rejectWithValue}) => {
	try {
		const response = await axiosInstance.post(`/users/signup/`, formData);
		return response.data;
	} catch (err) {
		return rejectWithValue(err.response?.data || "회원가입 실패");
	}
});

// 로그인 요청 thunk
export const login = createAsyncThunk("auth/login", async (credentials, {rejectWithValue}) => {
	try {
		const response = await axiosInstance.post(`/users/login/`, credentials);
		const {access, refresh, user_id, username} = response.data;
		localStorage.setItem("accessToken", access);
		localStorage.setItem("refreshToken", refresh);
		return {user_id, username};
	} catch (err) {
		return rejectWithValue(err.response?.data || "로그인 실패");
	}
});

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		logout: (state) => {
			state.user = null;
			localStorage.removeItem("accessToken");
			localStorage.removeItem("refreshToken");
			localStorage.removeItem("autoLogin");
			localStorage.removeItem("user");
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(signup.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(signup.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
			})
			.addCase(signup.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			})
			.addCase(login.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(login.fulfilled, (state, action) => {
				state.loading = false;
				state.user = action.payload;
				localStorage.setItem("user", JSON.stringify(action.payload));
			})
			.addCase(login.rejected, (state, action) => {
				state.loading = false;
				state.error = action.payload;
			});
	},
});

export const {logout} = authSlice.actions;

export default authSlice.reducer;
