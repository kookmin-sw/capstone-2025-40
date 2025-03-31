from django.core.management.base import BaseCommand
from AccountsAPP.models import Quest, Tip

class Command(BaseCommand):
    help = 'Seed initial Quests and Tips into the database.'

    CHALLENGE_LIST = [
        { "text": "비닐봉투 대신 장바구니 사용하기", "useCamera": True },
        { "text": "텀블러로 음료 구매 인증", "useCamera": True },
        { "text": "사용하지 않는 콘센트 뽑기", "useCamera": True },
        { "text": "플라스틱 분리수거 사진 찍기", "useCamera": True },
        { "text": "길거리 쓰레기 1개 주우기", "useCamera": True },
        { "text": "종이 영수증 대신 전자 영수증 받기", "useCamera": False },
        { "text": "에코백 사용 인증하기", "useCamera": True },
        { "text": "일회용 수저 대신 개인 수저 사용하기", "useCamera": True },
        { "text": "재활용 마크 확인하고 분리배출하기", "useCamera": False },
        { "text": "엘리베이터 대신 계단으로 이동하기", "useCamera": False },
        { "text": "세탁물 모아서 한 번에 하기", "useCamera": False },
        { "text": "유리용기에 음식 담아보기", "useCamera": True },
        { "text": "화분에 물 주기", "useCamera": True },
        { "text": "냅킨 대신 개인 손수건 사용하기", "useCamera": True },
        { "text": "샤워 시간 1분 줄이기", "useCamera": False },
        { "text": "페트병 라벨 제거 후 분리배출하기", "useCamera": True },
        { "text": "채식 한 끼 실천하기", "useCamera": True },
        { "text": "고체 비누 사용 인증", "useCamera": True },
        { "text": "친환경 라벨 제품 구매하기", "useCamera": True },
        { "text": "양치할 때 컵 사용하기", "useCamera": False },
        { "text": "대중교통 이용하기", "useCamera": True },
        { "text": "택배 상자 테이프 제거 후 배출하기", "useCamera": True },
        { "text": "이메일 정리하여 서버 에너지 절약하기", "useCamera": False },
        { "text": "음식물 쓰레기 줄이기 위해 적정량 덜어먹기", "useCamera": False },
        { "text": "공유 자전거/킥보드 이용하기", "useCamera": True },
        { "text": "실내 온도 1℃ 조절하기", "useCamera": False },
        { "text": "햇빛에 빨래 말리기", "useCamera": False },
    ]

    TIPS = [
        "종이류를 버릴 때 물기에 젖지 않도록 하고, 반듯하게 펴서 묶어 배출하면 재활용이 더 쉬워집니다.",
        "종이팩과 일반 종이류는 재활용 공정이 달라 따로 분리 배출해야 합니다.",
        "종이팩을 깨끗이 헹구고 말려 배출하면 화장지, 미용티슈 등으로 재활용할 수 있습니다.",
        "금속 캔은 내용물을 비우고 물로 헹군 후 배출하면 재활용 효율이 높아집니다.",
        "부탄가스나 살충제 용기는 가스를 완전히 제거한 후 배출해야 합니다.",
        "유리병은 색상과 관계없이 배출할 수 있지만, 깨지지 않도록 주의해야 합니다.",
        "소주, 맥주병은 빈용기보증금 환급 대상이므로 반납하면 보증금을 돌려받을 수 있습니다.",
        "페트병은 내용물을 비우고 라벨을 제거한 후 찌그러뜨려 배출하면 재활용이 용이합니다.",
        "비닐류는 이물질을 제거한 후 흩날리지 않도록 묶어서 배출해야 합니다.",
        "스티로폼 완충재는 내용물을 비우고 부착상표를 제거한 후 배출해야 합니다.",
        "택배 상자는 테이프를 제거하고 평평하게 접어 배출하면 재활용하기 좋습니다.",
        "음식물 쓰레기는 물기를 최대한 제거한 후 배출하면 처리 과정에서 에너지 절약 효과가 있습니다.",
        "폐건전지는 일반 쓰레기로 버리지 말고, 전용 수거함에 배출해야 환경 오염을 줄일 수 있습니다.",
        "깨진 유리는 신문지 등에 감싸 종량제 봉투에 배출해야 안전합니다.",
        "플라스틱 용기는 세척 후 라벨을 제거하여 분리배출하면 품질 높은 재활용이 가능합니다.",
        "일반 비닐과 랩 필름은 재질이 다를 수 있으니 분리하여 배출하는 것이 중요합니다.",
        "고철류(못, 철사, 캔 등)는 이물질이 섞이지 않도록 한 후 배출해야 합니다.",
        "의류 및 원단류는 폐의류 전용수거함에 배출하면 재사용될 가능성이 높아집니다.",
        "전자제품은 무상 방문 수거 서비스를 이용하면 보다 효율적으로 재활용할 수 있습니다.",
        "플라스틱 용기에 붙은 라벨과 뚜껑을 제거하면 재활용 공정을 더욱 원활하게 할 수 있습니다.",
        "우유팩과 종이팩을 따로 모아 배출하면 재활용률을 크게 높일 수 있습니다.",
        "유해 폐기물(폐형광등, 폐의약품 등)은 전용 수거함을 이용하여 배출해야 안전합니다.",
        "1회용 컵이나 빨대 대신 개인 컵과 다회용 빨대를 사용하면 플라스틱 쓰레기를 줄일 수 있습니다.",
        "알약 포장재(플라스틱+알루미늄)는 분리배출이 어렵기 때문에 일반 쓰레기로 버려야 합니다.",
        "깨끗한 종이컵은 종이류로 배출할 수 있지만, 오염된 종이컵은 종량제 봉투에 버려야 합니다.",
        "플라스틱 빨대, 수저, 포크 등은 재활용이 어렵기 때문에 가급적 사용을 줄이는 것이 좋습니다.",
        "음식물 쓰레기로 착각하기 쉬운 조개껍데기, 닭뼈, 과일 씨앗 등은 일반 쓰레기로 배출해야 합니다."
    ]

    def handle(self, *args, **kwargs):
        quest_created = 0
        for item in self.CHALLENGE_LIST:
            quest, created = Quest.objects.get_or_create(
                title=item["text"],
                defaults={"description": "", "useCamera": item["useCamera"]}
            )
            if created:
                quest_created += 1
                self.stdout.write(f" Quest created: {item['text']}")

        tip_created = 0
        for tip_text in self.TIPS:
            tip, created = Tip.objects.get_or_create(text=tip_text)
            if created:
                tip_created += 1
                self.stdout.write(f" Tip created: {tip_text[:40]}...")

        self.stdout.write(self.style.SUCCESS(
            f"🏁 퀘스트 {quest_created}개, 팁 {tip_created}개가 추가되었습니다."
        ))
