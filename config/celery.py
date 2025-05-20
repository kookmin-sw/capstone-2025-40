# back/config/celery.py
import os
from celery import Celery
from celery.schedules import crontab

# 1) Django 설정 모듈 지정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('config')
# 2) settings.py 의 CELERY_* 옵션 읽기
app.config_from_object('django.conf:settings', namespace='CELERY')
# 3) your_app/tasks.py 등의 @shared_task 자동 탐색
app.autodiscover_tasks()

# 4) 스케줄러: 매일 9시·18시 태스크 실행 설정
app.conf.beat_schedule = {
    'morning-encouragement': {
        'task': 'AccountsAPP.tasks.send_morning_encouragement',
        'schedule': crontab(hour=9, minute=0),
    },
    'evening-remaining-quests': {
        'task': 'AccountsAPP.tasks.send_evening_remaining_quests',
        'schedule': crontab(hour=18, minute=0),
    },
    'award-badges-everyday-1am': {
        'task': 'your_app_name.tasks.award_challenge_badges',
        'schedule': crontab(hour=1, minute=0),
    },
}

app.conf.beat_schedule.update({
    'noon-lunch-notification': {
        'task': 'AccountsAPP.tasks.send_noon_lunch_notification',
        'schedule': crontab(hour=12, minute=0),
    },
})


