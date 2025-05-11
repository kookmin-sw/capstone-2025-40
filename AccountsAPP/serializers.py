from django.utils.text import Truncator
from rest_framework import serializers
from .models import UserQuestAssignment, UserQuestResult, CustomUser, CommunityPost, Campaign, Comment, PostImage
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'name', 'city', 'district']

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)



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
    # post_type이 'campaign'일 때 post.campaign을 직렬화
    campaign = CampaignSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)

    class Meta:
        model = CommunityPost
        fields = [
            'id', 'user', 'title', 'content', 'post_type',
            'created_at', 'like_count', 'comment_count',
            'campaign', 'images'
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
        fields = ['content']  # 작성 시 필요 입력 필드


class CommentDetailSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at']


