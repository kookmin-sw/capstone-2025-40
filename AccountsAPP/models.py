from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    nickname = models.CharField(max_length=30, blank=True)
    # 유저 관련 커스텀 추가 필요

    def __str__(self):
        return self.username
