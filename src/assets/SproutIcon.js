// src/components/icons/SproutIcon.js
import React from "react";

const SproutIcon = ({size = 18, color = "#66bb6a"}) => (
	<svg xmlns='http://www.w3.org/2000/svg' width={size} height={size} viewBox='0 0 24 24' fill='none'>
		<path
			d='M12 2C13.933 2 16 4.067 16 6V11H17.5C18.88 11 20 12.12 20 13.5C20 14.88 18.88 16 17.5 16H14V18.586L15.707 20.293C16.098 20.684 16.098 21.316 15.707 21.707C15.316 22.098 14.684 22.098 14.293 21.707L12 19.414L9.707 21.707C9.316 22.098 8.684 22.098 8.293 21.707C7.902 21.316 7.902 20.684 8.293 20.293L10 18.586V16H6.5C5.12 16 4 14.88 4 13.5C4 12.12 5.12 11 6.5 11H8V6C8 4.067 10.067 2 12 2Z'
			fill={color}
		/>
	</svg>
);

export default SproutIcon;
