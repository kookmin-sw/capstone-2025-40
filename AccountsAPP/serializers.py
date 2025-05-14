from django.utils.text import Truncator
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from .models import UserQuestAssignment, UserQuestResult, CustomUser, CommunityPost, Campaign, Comment, PostImage, \
    Report, CampaignParticipant
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'name', 'nickname', 'profile_image', 'badge_image', 'points', 'city', 'district', 'email']

class UserSignupSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=CustomUser.objects.all(),
                message="이미 사용 중인 이메일입니다."
            )
        ]
    )
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username','nickname', 'email', 'password', 'name', 'city', 'district']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)



User = get_user_model()

class FindUsernameSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetCodeRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

class PasswordResetWithCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)


class UsernameLoginSerializer(TokenObtainPairSerializer):
    username_field = 'username'

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user_id'] = self.user.id
        data['username'] = self.user.username
        return data


# 오늘의 퀘스트 목록용 Serializer
class UserQuestAssignmentSerializer(serializers.ModelSerializer):
    quest_title = serializers.CharField(source='quest.title')
    quest_description = serializers.CharField(source='quest.description')
    useCamera = serializers.BooleanField(source='quest.useCamera')

    class Meta:
        model = UserQuestAssignment
        fields = [
            'id',  # assignment_id
            'quest_title',
            'quest_description',
            'useCamera',
            'is_completed',
            'assigned_date'
        ]


# 퀘스트 인증용 Serializer
class UserQuestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuestResult
        fields = ['photo_url']


class UserRankingSerializer(serializers.ModelSerializer):
    rank = serializers.IntegerField(read_only=True)
    is_self = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username','nickname', 'name', 'profile_image', 'badge_image',
            'points', 'city', 'district', 'rank', 'is_self'
        ]

    def get_is_self(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.pk == request.user.pk
        return False


class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ['image_url']


class CommunityPostSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.URLField(),
        write_only=True,
        required=False,
        help_text="최대 5개의 이미지 URL"
    )

    class Meta:
        model = CommunityPost
        fields = ['title', 'content', 'post_type', 'images']


class CampaignSerializer(serializers.ModelSerializer):
    # 현재 참여 인원 (모델의 @property 사용)
    current_participant_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Campaign
        fields = ['city', 'district', 'start_date', 'end_date', 'participant_limit', 'current_participant_count']


class CommunityPostDetailSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    campaign = CampaignSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)

    is_owner = serializers.BooleanField(read_only=True)
    has_liked = serializers.BooleanField(read_only=True)
    has_scrapped = serializers.BooleanField(read_only=True)
    has_participated = serializers.BooleanField(read_only=True)

    class Meta:
        model = CommunityPost
        fields = [
            'id', 'user', 'title', 'content', 'post_type',
            'created_at', 'like_count', 'comment_count', 'scrap_count',
            'is_owner','has_liked','has_scrapped','has_participated','campaign', 'images'
        ]


class CommunityPostListSerializer(serializers.ModelSerializer):
    comment_count = serializers.IntegerField(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    excerpt = serializers.SerializerMethodField()
    participant_limit = serializers.SerializerMethodField()
    current_participant_count = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = [
            'id',
            'title',
            'excerpt',
            'post_type',
            'created_at',
            'like_count',
            'comment_count',
            # 캠페인 전용 없으면 null 처리
            'participant_limit',
            'current_participant_count',
        ]

    def get_excerpt(self, obj):
        # content가 너무 길면 15자만 보여주고 ... 처리
        return Truncator(obj.content).chars(15, truncate='...')

    def get_participant_limit(self, obj):
        # 캠페인 글일 때만 max 인원 노출
        if obj.post_type == 'campaign' and hasattr(obj, 'campaign'):
            return obj.campaign.participant_limit
        return None

    def get_current_participant_count(self, obj):
        # 캠페인 글일 때만 현재 참여 인원 노출
        if obj.post_type == 'campaign' and hasattr(obj, 'campaign'):
            return obj.campaign.current_participant_count
        return None


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']



class CommentDetailSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    like_count = serializers.SerializerMethodField()

    is_my_comment = serializers.BooleanField(read_only=True)
    is_my_reply = serializers.BooleanField(read_only=True)
    has_liked_comment = serializers.BooleanField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at', 'like_count', 'is_my_comment','is_my_reply','has_liked_comment', 'replies']

    def get_replies(self, obj):
        qs = getattr(obj, 'annotated_replies', [])
        return CommentDetailSerializer(qs, many=True, context=self.context).data


    def get_like_count(self, obj):
            # CommentLike 테이블을 조회해서 동적으로 숫자 계산
            return obj.likes.count()  # CommentLike 모델의 related_name='likes.


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ['reason', 'details']


class CampaignParticipantSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = CampaignParticipant
        fields = ['user', 'joined_at']