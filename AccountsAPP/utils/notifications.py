# your_app/utils/notifications.py

import logging
from firebase_admin import messaging
from ..models import FCMDevice

logger = logging.getLogger(__name__)

def send_push_to_token(token, title, body, data=None):
    try:
        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            token=token,
            data=data or {}
        )
        return messaging.send(message)
    except Exception as e:
        # TODO: 로깅 / 재시도 로직
        logger.error(f"FCM 전송 실패 (token={token}): {e}")
        return None

def send_push_to_user(user, title, body, data=None):
    tokens = FCMDevice.objects.filter(user=user).values_list('registration_token', flat=True)
    results = []
    for t in tokens:
        results.append(send_push_to_token(t, title, body, data))
    return results
