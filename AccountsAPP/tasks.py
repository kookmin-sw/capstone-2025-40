# back/your_app/tasks.py

from celery import shared_task
from django.contrib.auth import get_user_model
from datetime import date
from .utils.notifications import send_push_to_user
from .models import UserQuestAssignment

User = get_user_model()

@shared_task
def send_morning_encouragement():
    """
    매일 아침 9시에 모든 활성 사용자에게
    '오늘도 힘내세요!' 응원 메시지 전송
    """
    for user in User.objects.filter(is_active=True):
        send_push_to_user(
            user,
            title='좋은 아침입니다! ☀️',
            body='오늘도 힘내세요! 오늘의 퀘스트를 확인해 보세요.',
            data={'click_action': '/quests/today'}
        )


@shared_task
def send_evening_remaining_quests():
    """
    매일 저녁 18시에 모든 활성 사용자에게
    오늘 남은 퀘스트 개수 알림 전송
    """
    today = date.today()
    for user in User.objects.filter(is_active=True):
        remaining = UserQuestAssignment.objects.filter(
            user=user,
            assigned_date=today,
            is_completed=False
        ).count()

        send_push_to_user(
            user,
            title='오늘의 퀘스트 현황 🕕',
            body=f'아직 오늘의 챌린지가 {remaining}개 남았어요! 환경을 위해 도전해주세요! 🌱',
            data={'click_action': '/quests/today'}
        )

@shared_task
def send_noon_lunch_notification():
    """
    매일 정오 12시에 모든 활성 사용자에게
    '맛있는 점심 드세요!' 알림을 보냅니다.
    """
    for user in User.objects.filter(is_active=True):
        send_push_to_user(
            user,
            title='🍴 점심 시간입니다!',
            body='맛있는 점심 드세요! 😊',
            data={'click_action': '/'}   # 원하는 URL 경로로 바꿔도 됩니다
        )


