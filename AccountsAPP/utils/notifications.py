# your_app/utils/notifications.py

import logging
from firebase_admin import messaging
from ..models import FCMDevice

logger = logging.getLogger(__name__)


def send_push_to_token(token, title=None, body=None, data=None):
    try:
        # “data-only” payload 구성
        payload = {}
        if title:
            payload['title'] = title
        if body:
            payload['body'] = body
        if data:
            payload.update(data)

        # notification 필드 없이 data만 담아 전송
        message = messaging.Message(
            data=payload,
            token=token,
        )
        return messaging.send(message)

    except Exception as e:
        logger.error(f"FCM 전송 실패 (token={token}): {e}")
        return None

def send_push_to_user(user, title=None, body=None, data=None):
    tokens = FCMDevice.objects.filter(user=user).values_list('registration_token', flat=True)
    results = []
    for t in tokens:
        results.append(send_push_to_token(t, title, body, data))
    return results
