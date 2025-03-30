from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    profile_image = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.username

# 퀘스트
class Quest(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)


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
    photo_url = models.URLField()
    completed_at = models.DateTimeField(auto_now_add=True)


# 커뮤니티 게시글
class CommunityPost(models.Model):
    POST_TYPES = [
        ('certification', 'Certification'),
        ('campaign', 'Campaign'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    title = models.CharField(max_length=100)
    content = models.TextField(blank=True)
    post_type = models.CharField(max_length=20, choices=POST_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# 캠페인 정보
class Campaign(models.Model):
    post = models.OneToOneField(CommunityPost, on_delete=models.CASCADE, related_name='campaign')
    location = models.CharField(max_length=100)
    event_date = models.DateField()
    participant_limit = models.PositiveIntegerField()

    def __str__(self):
        return f"Campaign: {self.post.title}"


# 캠페인 참여자
class CampaignParticipant(models.Model):
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='participants')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('campaign', 'user')


# 댓글
class Comment(models.Model):
    post = models.ForeignKey(CommunityPost, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
