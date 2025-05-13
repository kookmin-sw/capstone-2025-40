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
)



@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'name', 'city', 'district', 'points', 'is_staff', 'is_active']
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


admin.site.register(Quest)
admin.site.register(UserQuestAssignment)
admin.site.register(UserQuestResult)
admin.site.register(Tip)