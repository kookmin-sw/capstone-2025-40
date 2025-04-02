from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import random

from AccountsAPP.models import Quest, UserQuestAssignment

User = get_user_model()

class Command(BaseCommand):
    help = 'Assigns 5 daily quests to each user, excluding quests cleared yesterday.'

    def handle(self, *args, **options):
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        users = User.objects.all()

        for user in users:
            print(f"Assigning quests for user: {user.username}")

            # 어제 클리어한 퀘스트 ID 가져오기
            cleared_quest_ids = UserQuestAssignment.objects.filter(
                user=user,
                assigned_date=yesterday,
                is_completed=True
            ).values_list('quest_id', flat=True)

            if not cleared_quest_ids:
                print(f" - No cleared quests yesterday. All quests are available.")

            # 오늘 이미 배정된 퀘스트가 있으면 스킵 (중복 방지)
            if UserQuestAssignment.objects.filter(user=user, assigned_date=today).exists():
                print(f" - Already assigned today. Skipping.")
                continue

            # 배정 가능한 퀘스트 목록
            available_quests = Quest.objects.exclude(id__in=cleared_quest_ids)

            if available_quests.count() == 0:
                print(f" - No available quests to assign.")
                continue

            selected_quests = random.sample(
                list(available_quests),
                min(5, available_quests.count())
            )

            for quest in selected_quests:
                UserQuestAssignment.objects.create(
                    user=user,
                    quest=quest,
                    assigned_date=today
                )
                print(f" - Assigned: {quest.title}")

        self.stdout.write(self.style.SUCCESS('Daily quests assignment complete!'))
