import React, {useRef, useState, useEffect} from "react";
import {Box, CircularProgress} from "@mui/material";

const PullToRefresh = ({onRefresh, children, disabled = false}) => {
	const scrollRef = useRef(null);
	const [pulling, setPulling] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [startY, setStartY] = useState(0);
	const [pullHeight, setPullHeight] = useState(0);
	const scrollStartXRef = useRef(0);

	const MAX_PULL = 70;
	const THRESHOLD = 50;

	useEffect(() => {
		const scroll = scrollRef.current;
		if (!scroll) return;

		const handleTouchStart = (e) => {
			if (scroll.scrollTop === 0 && !refreshing && !disabled) {
				setStartY(e.touches[0].clientY);
				scrollStartXRef.current = e.touches[0].clientX;
				setPulling(true);
			}
		};

		const handleTouchMove = (e) => {
			if (!pulling) return;

			const currentY = e.touches[0].clientY;
			const currentX = e.touches[0].clientX;
			const deltaY = currentY - startY;
			const deltaX = Math.abs(currentX - (scrollStartXRef.current || 0));

			// Only trigger pull if it's a vertical pull greater than horizontal
			if (Math.abs(deltaY) > deltaX && deltaY > 0 && deltaY < MAX_PULL) {
				e.preventDefault();
				setPullHeight(deltaY);
			}
			// Otherwise, ignore horizontal or non-vertical gestures
		};

		const handleTouchEnd = () => {
			if (!pulling) return;
			setPulling(false);

			if (pullHeight >= THRESHOLD) {
				setRefreshing(true);
				onRefresh?.().finally(() => {
					setRefreshing(false);
					setPullHeight(0);
				});
			} else {
				setPullHeight(0);
			}
		};

		scroll.addEventListener("touchstart", handleTouchStart);
		scroll.addEventListener("touchmove", handleTouchMove, {passive: false});
		scroll.addEventListener("touchend", handleTouchEnd);

		return () => {
			scroll.removeEventListener("touchstart", handleTouchStart);
			scroll.removeEventListener("touchmove", handleTouchMove);
			scroll.removeEventListener("touchend", handleTouchEnd);
		};
	}, [pulling, pullHeight, refreshing, startY, onRefresh, disabled]);

	return (
		<Box
			ref={scrollRef}
			sx={{
				height: "100%",
				overflowY: "auto",
				WebkitOverflowScrolling: "touch",
			}}>
			<Box
				sx={{
					height: pullHeight,
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					transition: pulling ? "none" : "height 0.3s",
				}}>
				{refreshing && <CircularProgress color='success' size={24} />}
			</Box>
			{children}
		</Box>
	);
};

export default PullToRefresh;
