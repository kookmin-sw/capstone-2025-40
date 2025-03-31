from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password']

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


from rest_framework import serializers
from .models import UserQuestAssignment, UserQuestResult

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



