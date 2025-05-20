from datetime import timedelta
import random
import string
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import AbstractUser
from django.db import models


######################################################### PWA 알림
class FCMDevice(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    registration_token = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
#########################################################

class CustomUser(AbstractUser):
    nickname = models.CharField(max_length=50, blank=True, null=True)
    profile_image = models.URLField(max_length=500, blank=True, null=True)
    badge_image = models.URLField(max_length=500, blank=True, null=True)
    points = models.IntegerField(blank=True, null=True, default = 0)
    name = models.CharField(max_length=30, blank=True, null=True)  # 사용자 이름
    city = models.CharField(max_length=50, blank=True, null=True)  # 예: 서울시
    district = models.CharField(max_length=50, blank=True, null=True)  # 예: 마포구


    def __str__(self):
        return self.username

# 퀘스트
class Quest(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    useCamera = models.BooleanField(default=False)
    point = models.IntegerField(default=5)


# 사용자 퀘스트 인증
class UserQuestAssignment(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    quest = models.ForeignKey(Quest, on_delete=models.CASCADE)
    assigned_date = models.DateField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'quest', 'assigned_date')


class UserQuestResult(models.Model):
    assignment = models.OneToOneField(UserQuestAssignment, on_delete=models.CASCADE)
    photo_url = models.URLField(max_length=500, blank=True, null=True)
    completed_at = models.DateTimeField(auto_now_add=True)


################################################################  커스텀 챌린지
def generate_invite_code():
    # 8자리 영문+숫자 랜덤 (예: '7F3Q1X2B')
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

class CustomChallenge(models.Model):
    id = models.AutoField(primary_key=True)
    invite_code = models.CharField(
        max_length=12,
        default=generate_invite_code,  # 위에서 정의한 랜덤 생성 함수
        unique=True,
        db_index=True
    )
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    badge_image = models.URLField(max_length=500, blank=True, null=True)
    leader = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='led_challenges'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.invite_code})"


class CustomChallengeQuest(models.Model):
    challenge = models.ForeignKey(CustomChallenge, on_delete=models.CASCADE, related_name='quests')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    use_camera = models.BooleanField(default=False)
    point = models.IntegerField(default=3)

    def __str__(self):
        return f"{self.title} [{self.challenge.title}]"


class CustomChallengeParticipant(models.Model):
    challenge = models.ForeignKey(CustomChallenge, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('challenge', 'user')

    def __str__(self):
        return f"{self.user.username} in {self.challenge.title}"


class CustomChallengeQuestAssignment(models.Model):
    participant = models.ForeignKey(CustomChallengeParticipant, on_delete=models.CASCADE, related_name='assignments')
    quest = models.ForeignKey(CustomChallengeQuest, on_delete=models.CASCADE)
    assigned_date = models.DateField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('participant', 'quest')

    def __str__(self):
        return f"Assignment: {self.participant.user.username} - {self.quest.title}"


class CustomChallengeQuestResult(models.Model):
    assignment = models.OneToOneField(CustomChallengeQuestAssignment, on_delete=models.CASCADE, related_name='result')
    photo_url = models.URLField(max_length=500, blank=True, null=True)
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Result for {self.assignment}"


#####################################################################################


class Tip(models.Model):
    text = models.TextField(unique=True)

    def __str__(self):
        return self.text[:50]  # 앞 50자만 보여줍니다.


class CommunityPost(models.Model):
    POST_TYPES = [
        ('free', '자유글'),
        ('info', '정보글'),
        ('campaign', '캠페인'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    content = models.TextField(blank=True)
    post_type = models.CharField(max_length=20, choices=POST_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    # 비정규화 필드
    like_count = models.PositiveIntegerField(default=0)
    scrap_count = models.PositiveIntegerField(default=0)
    comment_count = models.PositiveIntegerField(default=0)


    def __str__(self):
        return self.title


class Campaign(models.Model):
    post = models.OneToOneField(CommunityPost, on_delete=models.CASCADE, related_name='campaign')
    start_date = models.DateField()
    end_date = models.DateField()
    city = models.CharField(max_length=50)  # 예: '서울시'
    district = models.CharField(max_length=50)  # 예: '마포구'
    participant_limit = models.PositiveIntegerField()  # 양수만 받음.

    @property
    def current_participant_count(self): # 이것도 필드처럼 동작 campaign.current_participant_count 로 쓸 수 있음.
        return self.participants.count()

    @property
    def is_full(self):
        return self.participants.count() >= self.participant_limit


class CampaignParticipant(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('campaign', 'user')

# 댓글(대댓글도 포함)
class Comment(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')  # null 이면 최상위 댓글, 다른 댓글이 이 필드에 연결되어 있으면 답글


# 이미지 관리 모델
class PostImage(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500)

    def __str__(self):
        return f"{self.post.id} – {self.image_url}"

# 좋아요
class PostLike(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')  # 한 사용자가 한 게시물에 한 번만 좋아요 가능

# 스크랩
class PostScrap(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='scraps')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    scrapped_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('post', 'user')  # 중복 스크랩 방지

# 댓글 좋아요
class CommentLike(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    liked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('comment', 'user')  # 한 유저가 같은 댓글에 여러 번 좋아요

# 댓글 신고
class Report(models.Model):
    REPORT_REASONS = [
        ('spam', '스팸'),
        ('abuse', '욕설/비방'),
        ('other', '기타'),
    ]
    post = models.ForeignKey('CommunityPost', null=True, blank=True, related_name='reports', on_delete=models.CASCADE)
    comment = models.ForeignKey('Comment', null=True, blank=True, on_delete=models.CASCADE, related_name='reports')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    reason = models.CharField(max_length=20, choices=REPORT_REASONS)
    details = models.TextField(blank=True)  # 추가 설명
    reported_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [
            ('post', 'user'),
            ('comment', 'user'),
        ]  # 한 유저가 같은 댓글에 중복 신고


class PasswordResetCode(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reset_codes'
    )
    code = models.CharField(max_length=6)      # 6자리 숫자 코드
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    @property
    def is_expired(self):
        # 생성 후 10분 이내만 유효

        return timezone.now() > self.created_at + timedelta(minutes=10)

    class Meta:
        indexes = [
            models.Index(fields=['user', 'code']),
        ]

class UserBadge(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='badges')
    challenge = models.ForeignKey(CustomChallenge, on_delete=models.CASCADE)
    badge_image = models.URLField()
    awarded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'challenge')
