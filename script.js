// Smooth Scrolling for Internal Navigation Links
document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
	const href = anchor.getAttribute("href");
	const target = document.querySelector(href);
	if (target) {
		anchor.addEventListener("click", function (e) {
			e.preventDefault();
			target.scrollIntoView({behavior: "smooth"});
		});
	}
});
