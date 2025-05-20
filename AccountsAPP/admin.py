from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser,
    Quest,
    UserQuestAssignment,
    UserQuestResult,
    Tip,
    CommunityPost,
    Campaign,
    CampaignParticipant,
    Comment,
    PostLike,
    PostScrap,
    CommentLike,
    Report, PostImage,
    CustomChallenge,
    CustomChallengeParticipant,
    CustomChallengeQuest,
    CustomChallengeQuestAssignment,
    CustomChallengeQuestResult, UserBadge,
)



@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'nickname', 'email', 'name', 'city', 'district', 'points', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('name', 'city', 'district', 'profile_image', 'points')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('name', 'city', 'district', 'profile_image', 'points')}),
    )
    search_fields = ['username', 'email', 'name', 'city', 'district', 'points']
    list_filter = ['is_staff', 'is_active', 'city', 'points']

@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'title', 'post_type', 'created_at', 'like_count', 'comment_count']
    list_filter = ['post_type', 'created_at']
    search_fields = ['title', 'content', 'user__username']

@admin.register(UserQuestAssignment)
class UserQuestAssignmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'quest', 'assigned_date', 'is_completed']
    list_filter = ['user', 'assigned_date', 'is_completed']
    search_fields = ['assigned_date', 'is_completed']


@admin.register(UserQuestResult)
class UserQuestResultAdmin(admin.ModelAdmin):
    list_display = ['assignment','photo_url', 'completed_at']
    search_fields = ['completed_at']

@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'post', 'city', 'district', 'start_date',
        'end_date', 'participant_limit', 'current_participant_count'
    ]
    list_filter = ['city', 'district', 'start_date', 'end_date']
    search_fields = ['post__title']

@admin.register(CampaignParticipant)
class CampaignParticipantAdmin(admin.ModelAdmin):
    list_display = ['id', 'campaign', 'user', 'joined_at']
    list_filter = ['campaign', 'joined_at']
    search_fields = ['user__username', 'campaign__post__title']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'content', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'user__username', 'post__title']

@admin.register(PostLike)
class PostLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'liked_at']
    list_filter = ['liked_at']
    search_fields = ['post__title', 'user__username']

@admin.register(PostScrap)
class PostScrapAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'user', 'scrapped_at']
    list_filter = ['scrapped_at']
    search_fields = ['post__title', 'user__username']

@admin.register(CommentLike)
class CommentLikeAdmin(admin.ModelAdmin):
    list_display = ['id', 'comment', 'user', 'liked_at']
    list_filter = ['liked_at']
    search_fields = ['comment__content', 'user__username']

@admin.register(Report)
class CommentReportAdmin(admin.ModelAdmin):
    list_display = ['id', 'post', 'comment', 'user', 'reason', 'reported_at']
    list_filter = ['reason', 'reported_at']
    search_fields = ['comment__content', 'user__username']

@admin.register(PostImage)
class PostImageAdmin(admin.ModelAdmin):
    list_display = ['post','image_url']
    search_fields = ['post']

# 커스텀 챌린지 퀘스트 인라인 (챌린지 상세에서 미션들)
class CustomChallengeQuestInline(admin.TabularInline):
    model = CustomChallengeQuest
    extra = 0

# 챌린지 참가자 인라인 (챌린지 상세에서 참가자들)
class CustomChallengeParticipantInline(admin.TabularInline):
    model = CustomChallengeParticipant
    extra = 0

@admin.register(CustomChallenge)
class CustomChallengeAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'leader', 'start_date', 'end_date', 'invite_code')
    search_fields = ('title', 'leader__username', 'invite_code')
    list_filter = ('start_date', 'end_date')
    inlines = [CustomChallengeQuestInline, CustomChallengeParticipantInline]

# --- 퀘스트 인라인에서 Assignment(완수자)도 보기 ---
class CustomChallengeQuestAssignmentInline(admin.TabularInline):
    model = CustomChallengeQuestAssignment
    extra = 0
    # 완수자만 보기 위해, 필터 혹은 list_filter에서 is_completed만 보여줄 수도 있음
    fields = ('participant', 'is_completed', 'assigned_date')
    readonly_fields = ('participant', 'assigned_date', 'is_completed')

@admin.register(CustomChallengeParticipant)
class CustomChallengeParticipantAdmin(admin.ModelAdmin):
    list_display = ('id', 'challenge', 'user', 'joined_at')
    search_fields = ('challenge__title', 'user__username')
    list_filter = ('challenge',)

@admin.register(CustomChallengeQuest)
class CustomChallengeQuestAdmin(admin.ModelAdmin):
    list_display = ('id', 'challenge', 'title', 'point', 'use_camera')
    search_fields = ('challenge__title', 'title')
    list_filter = ('challenge',)
    inlines = [CustomChallengeQuestAssignmentInline]

@admin.register(CustomChallengeQuestAssignment)
class CustomChallengeQuestAssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'participant', 'quest', 'assigned_date', 'is_completed')
    search_fields = ('participant__user__username', 'quest__title')
    list_filter = ('is_completed', 'assigned_date')

@admin.register(CustomChallengeQuestResult)
class CustomChallengeQuestResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'assignment', 'photo_url', 'completed_at')
    search_fields = ('assignment__participant__user__username',)
    list_filter = ('completed_at',)


@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'challenge', 'badge_image', 'awarded_at')
    search_fields = ('user__username', 'challenge__title')
    list_filter = ('challenge',)
    autocomplete_fields = ['user', 'challenge']
    readonly_fields = ('awarded_at',)


admin.site.register(Quest)
admin.site.register(Tip)