const trashData = [
	{
		category: "일반 쓰레기",
		items: [
			{
				id: 1,
				name: "휴지",
				howToDispose: `- 화장실에서 주로 사용하는 두루마리 휴지는 화장실 변기에 버려요. 변기에 버리지 않을 경우엔 일반쓰레기(종량제봉투)로 버려주세요. 
							   - 휴지를 모두 사용하고 남은 종이 휴지심은 종이로 분리배출해요. 티슈(미용화장지)나 물티슈는 반드시 일반쓰레기(종량제봉투)로 버려주세요. 
							     두루마리 휴지처럼 변기에 버리면 절대 안됩니다!`,
				recyclable: false,
				categories: ["일반 쓰레기"],
			},
			{
				id: 2,
				name: "종이컵",
				howToDispose: `- 일회용 종이컵은 음료나 이물질이 묻어있지 않은 상태로 배출해야만 재활용이 가능해요. 음료를 마신 후 종이컵 안쪽을 물로 깨끗이 헹궈낸 뒤 종이팩 종이컵 분리 수거으로 분리배출해주세요.
							   - 카페에서 테이크아웃한 일회용 종이컵의 플라스틱 뚜껑 등은 분리해서 재질별로 분리배출해요.
							   - 일회용 종이컵은 낱개로 배출하는 것보다 여러개를 한번에 모아서 배출할 경우 재활용될 가능성이 높습니다. 사용한 종이컵을 한곳에 모아두었다가 투명비닐 등에 넣어서 분리배출하는 것을 추천드립니다.
							   - 음료나 이물질에 오염되어 세척이 불가능한 종이컵은 일반쓰레기(종량제봉투)로 버려주세요.`,
				recyclable: true,
				categories: ["일반 쓰레기"],
			},
			{
				id: 3,
				name: "생선 뼈",
				howToDispose: `- 크기 작은 것은 음식물로, 큰 뼈는 일반 쓰레기로 구분합니다.`,
				recyclable: false,
				categories: ["일반 쓰레기", "음식물 쓰레기"],
			},
		],
	},
	{
		category: "재활용 쓰레기",
		items: [
			{
				id: 4,
				name: "페트병",
				howToDispose: `- 내용물을 비우고 라벨 제거 후 찌그러뜨려 배출합니다.`,
				recyclable: true,
				categories: ["재활용 쓰레기"],
			},
			{
				id: 5,
				name: "캔",
				howToDispose: `- 내용물 비우고 물로 헹군 후 배출합니다.`,
				recyclable: true,
				categories: ["재활용 쓰레기"],
			},
			{
				id: 6,
				name: "종이박스",
				howToDispose: `- 테이프 제거 후 평평하게 접어 배출합니다.`,
				recyclable: true,
				categories: ["재활용 쓰레기"],
			},
		],
	},
	{
		category: "음식물 쓰레기",
		items: [
			{
				id: 7,
				name: "사과껍질",
				howToDispose: `- 물기 제거 후 음식물 쓰레기로 배출합니다.`,
				recyclable: false,
				categories: ["음식물 쓰레기"],
			},
			{
				id: 8,
				name: "계란 껍데기",
				howToDispose: `- 일반 쓰레기로 배출합니다. (음식물 아님)`,
				recyclable: false,
				categories: ["음식물 쓰레기"],
			},
		],
	},
	{
		category: "가연성 쓰레기",
		items: [
			{
				id: 10,
				name: "비닐봉지",
				howToDispose: `- 이물질 없고 깨끗하면 재활용, 그렇지 않으면 일반 쓰레기입니다.`,
				recyclable: true,
				categories: ["가연성 쓰레기"],
			},
			{
				id: 11,
				name: "플라스틱 랩",
				howToDispose: `- 이물질 없으면 재활용 가능하지만, 오염 시 일반 쓰레기로 배출합니다.`,
				recyclable: true,
				categories: ["가연성 쓰레기"],
			},
		],
	},
	{
		category: "불연성 쓰레기",
		items: [
			{
				id: 12,
				name: "도자기 조각",
				howToDispose: `- 신문지에 감싸 일반 쓰레기로 배출합니다.`,
				recyclable: false,
				categories: ["불연성 쓰레기"],
			},
			{
				id: 13,
				name: "거울",
				howToDispose: `- 종이에 감싸 일반 쓰레기로 배출하거나 주민센터에 문의합니다.`,
				recyclable: false,
				categories: ["불연성 쓰레기"],
			},
		],
	},
];

export default trashData;
