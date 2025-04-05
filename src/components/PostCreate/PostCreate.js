import React, {useState, useEffect} from "react";
import {Box, TextField, Typography, IconButton, Paper, MenuItem, Alert} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import {useNavigate, useLocation} from "react-router-dom";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {ko} from "date-fns/locale";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {MobileDatePicker} from "@mui/x-date-pickers/MobileDatePicker";
import styles from "./PostCreate.module.css";
import {DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {SortableContext, arrayMove, horizontalListSortingStrategy, useSortable} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";
import {area} from "../../area";

const SortableImage = ({img, index, onDelete}) => {
	const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: img.id});
	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};
	return (
		<div ref={setNodeRef} style={style} className={styles.draggableWrapper}>
			<Paper className={styles.previewBox} elevation={3}>
				<div {...attributes} {...listeners} className={styles.dragHandleArea}>
					<img src={img.url} alt={`preview-${index}`} className={styles.previewImage} />
				</div>
				<Typography variant='caption' className={styles.imageIndex}>
					{index + 1}
				</Typography>
				<IconButton size='small' className={styles.deleteButton} onClick={() => onDelete(img.id)}>
					<DeleteIcon fontSize='small' />
				</IconButton>
			</Paper>
		</div>
	);
};

const PostCreate = () => {
	const navigate = useNavigate();
	const {state} = useLocation();
	const isEditMode = !!state?.post;
	const isCampaign = state?.post?.noticeBoard === "캠페인 게시판" || state?.noticeBoard === "캠페인 게시판";

	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [images, setImages] = useState([]);
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [city, setCity] = useState("");
	const [district, setDistrict] = useState("");
	const [error, setError] = useState("");
	const [recruitment, setRecruitment] = useState("");

	useEffect(() => {
		if (isEditMode) {
			const post = state.post;
			setTitle(post.title || "");
			setContent(post.content || "");
			setImages(post.images || []);

			if (isCampaign) {
				setStartDate(post.startDate ? new Date(post.startDate) : null);
				setEndDate(post.endDate ? new Date(post.endDate) : null);
				setRecruitment(post.maxParticipants ?? "");

				// location 문자열에서 시, 군/구 분리
				const [parsedCity, parsedDistrict] = post.location?.split(" ") || [];
				setCity(parsedCity || "");
				setDistrict(parsedDistrict || "");
			}
		}
	}, [isEditMode, state]);

	const handleImageChange = (e) => {
		const files = Array.from(e.target.files);
		const newImages = files.map((file) => ({id: crypto.randomUUID(), url: URL.createObjectURL(file)}));
		setImages((prev) => [...prev, ...newImages]);
	};

	const handleDelete = (id) => {
		setImages((prev) => prev.filter((img) => img.id !== id));
	};

	const handleSubmit = () => {
		if (!title.trim() || !content.trim()) {
			alert("제목과 내용을 입력해주세요.");
			return;
		}
		if (isCampaign && startDate && endDate && endDate < startDate) {
			setError("종료 날짜는 시작 날짜보다 늦어야 합니다.");
			return;
		}
		setError("");
		alert(isEditMode ? "게시물이 수정되었습니다." : "게시물이 등록되었습니다.");
		navigate(-1);
	};

	const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

	return (
		<Box className={styles.container}>
			<Box className={styles.header}>
				<IconButton onClick={() => navigate(-1)} sx={{padding: "0px"}}>
					<ArrowBackIosNewIcon />
				</IconButton>
				<Typography className={styles.titleText}>{isEditMode ? "글 수정" : "글쓰기"}</Typography>
				<Typography className={styles.successText} onClick={handleSubmit} sx={{marginLeft: "auto", cursor: "pointer"}}>
					{isEditMode ? "수정" : "완료"}
				</Typography>
			</Box>

			{isCampaign && (
				<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
					<Box display='flex' gap={1} alignItems='center' mb={2}>
						<MobileDatePicker
							value={startDate}
							onChange={(newValue) => setStartDate(newValue)}
							format='yyyy-MM-dd'
							closeOnSelect={true}
							slotProps={{
								toolbar: {hidden: true},
								actionBar: {actions: []},
								textField: {
									color: "success",
									fullWidth: true,
									variant: "outlined",
									label: "캠페인 시작 날짜",
									sx: {
										backgroundColor: "white",
									},
								},
							}}
						/>
						<Typography>~</Typography>
						<MobileDatePicker
							value={endDate}
							onChange={(newValue) => setEndDate(newValue)}
							format='yyyy-MM-dd'
							closeOnSelect={true}
							slotProps={{
								toolbar: {hidden: true},
								actionBar: {actions: []},
								textField: {
									color: "success",
									fullWidth: true,
									variant: "outlined",
									label: "캠페인 종료 날짜",
									sx: {
										backgroundColor: "white",
									},
								},
							}}
						/>
					</Box>
					<Box display='flex' gap={1}>
						<TextField
							select
							value={city}
							fullWidth
							color='success'
							className={styles.input}
							onChange={(e) => {
								setCity(e.target.value);
								setDistrict("");
							}}
							SelectProps={{
								displayEmpty: true,
								renderValue: (selected) => {
									if (!selected) {
										return <span style={{color: "#aaa"}}>시 선택</span>;
									}
									return selected;
								},
							}}>
							<MenuItem value='' disabled>
								시 선택
							</MenuItem>
							{area.map((areaItem) => (
								<MenuItem key={areaItem.name} value={areaItem.name}>
									{areaItem.name}
								</MenuItem>
							))}
						</TextField>
						<TextField
							select
							value={district}
							fullWidth
							color='success'
							className={styles.input}
							onChange={(e) => setDistrict(e.target.value)}
							disabled={!city}
							SelectProps={{
								displayEmpty: true,
								renderValue: (selected) => {
									if (!selected) {
										return <span style={{color: "#aaa"}}>군/구 선택</span>;
									}
									return selected;
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
						<TextField
							type='number'
							color='success'
							fullWidth
							label='모집 인원'
							variant='outlined'
							inputProps={{min: 1}}
							className={styles.input}
							sx={{backgroundColor: "white", mb: 2}}
							value={recruitment}
							onChange={(e) => {
								const value = e.target.value;
								if (!isNaN(value) && Number(value) >= 0) {
									setRecruitment(value);
								}
							}}
						/>
					</Box>
				</LocalizationProvider>
			)}

			{error && (
				<Alert severity='error' sx={{mb: 2}}>
					{error}
				</Alert>
			)}

			<TextField
				color='success'
				variant='outlined'
				fullWidth
				placeholder='제목을 입력해주세요.'
				className={styles.input}
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>

			<TextField
				color='success'
				variant='outlined'
				fullWidth
				placeholder='내용을 입력해주세요.'
				multiline
				rows={15}
				className={styles.input}
				value={content}
				onChange={(e) => setContent(e.target.value)}
			/>

			<Box className={styles.imageUploadBox}>
				<input
					accept='image/*'
					multiple
					style={{display: "none"}}
					id='upload-photo'
					type='file'
					onChange={handleImageChange}
				/>
				<label htmlFor='upload-photo' className={styles.uploadLabel}>
					<IconButton color='success' component='span'>
						<PhotoCamera />
					</IconButton>
					<Typography variant='caption' sx={{fontSize: "14px", color: "#388e3c", fontWeight: "bold"}}>
						사진 업로드
					</Typography>
				</label>
			</Box>

			{images.length > 0 && (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={({active, over}) => {
						if (active.id !== over?.id) {
							const oldIndex = images.findIndex((i) => i.id === active.id);
							const newIndex = images.findIndex((i) => i.id === over.id);
							setImages((imgs) => arrayMove(imgs, oldIndex, newIndex));
						}
					}}>
					<SortableContext items={images.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
						<div className={styles.previewContainer}>
							{images.map((img, idx) => (
								<SortableImage key={img.id} img={img} index={idx} onDelete={handleDelete} />
							))}
						</div>
					</SortableContext>
				</DndContext>
			)}
		</Box>
	);
};

export default PostCreate;
