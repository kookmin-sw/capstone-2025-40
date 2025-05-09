import React, {useState} from "react";
import {
	Box,
	Typography,
	TextField,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	List,
	ListItem,
	ListItemText,
	InputAdornment,
	IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import DeleteIcon from "@mui/icons-material/Delete";
import RecyclingIcon from "@mui/icons-material/Recycling";
import NoFoodIcon from "@mui/icons-material/NoFood";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import {useNavigate} from "react-router-dom";
import trashData from "../../trashData";
import styles from "./TrashDictionary.module.css";

const TrashDictionary = () => {
	const [search, setSearch] = useState("");
	const navigate = useNavigate();

	const handleSearchChange = (e) => setSearch(e.target.value);

	const filteredData = trashData.filter((category) => {
		const normalizedSearch = search.replace(/\s/g, "");
		const normalizedCategory = category.category.replace(/\s/g, "");
		return (
			normalizedCategory.includes(normalizedSearch) ||
			category.items.some((item) => item.name.replace(/\s/g, "").includes(normalizedSearch))
		);
	});

	return (
		<Box className={styles.container}>
			<Box className={styles.header}>
				<IconButton onClick={() => navigate(-1)} sx={{padding: "0px"}}>
					<ArrowBackIosNewIcon />
				</IconButton>
				<Typography className={styles.boardTitle}>쓰레기 백과사전</Typography>
			</Box>
			<TextField
				fullWidth
				placeholder='쓰레기 이름 및 분류를 검색하세요'
				variant='outlined'
				size='small'
				color='success'
				value={search}
				onChange={handleSearchChange}
				InputProps={{
					startAdornment: (
						<InputAdornment position='start'>
							<SearchIcon color='action' />
						</InputAdornment>
					),
				}}
				className={styles.searchBox}
			/>

			<Box className={styles.scrollArea}>
				{(search ? filteredData : trashData).map((category, index) => (
					<Accordion key={index} className={styles.accordion} defaultExpanded>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							{category.category === "일반 쓰레기" && <DeleteIcon sx={{mr: 1}} color='success' />}
							{category.category === "재활용 쓰레기" && <RecyclingIcon sx={{mr: 1}} color='success' />}
							{category.category === "음식물 쓰레기" && <NoFoodIcon sx={{mr: 1}} color='success' />}
							{category.category === "가연성 쓰레기" && <LocalFireDepartmentIcon sx={{mr: 1}} color='success' />}
							{category.category === "불연성 쓰레기" && <DoNotDisturbIcon sx={{mr: 1}} color='success' />}
							<Typography className={styles.categoryTitle}>{category.category}</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<List>
								{category.items
									.filter((item) => {
										const normalizedSearch = search.replace(/\s/g, "");
										return (
											item.name.replace(/\s/g, "").includes(normalizedSearch) ||
											category.category.replace(/\s/g, "").includes(normalizedSearch)
										);
									})
									.map((item, idx) => (
										<ListItem
											button
											key={idx}
											onClick={() => navigate(`/trash/${item.id}`)}
											className={styles.listItem}>
											<ListItemText primary={item.name} />
										</ListItem>
									))}
							</List>
						</AccordionDetails>
					</Accordion>
				))}
			</Box>
		</Box>
	);
};

export default TrashDictionary;
