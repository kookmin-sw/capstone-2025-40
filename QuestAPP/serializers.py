from rest_framework import serializers
from .models import Quest, UserQuestAssignment, UserQuestResult


# 오늘의 퀘스트 목록용 Serializer
class UserQuestAssignmentSerializer(serializers.ModelSerializer):
    quest_title = serializers.CharField(source='quest.title')
    quest_description = serializers.CharField(source='quest.description')

    class Meta:
        model = UserQuestAssignment
        fields = ['id', 'quest_title', 'quest_description', 'assigned_date']


# 퀘스트 인증용 Serializer
class UserQuestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuestResult
        fields = ['photo_url']

    def create(self, validated_data):
        assignment = self.context['assignment']
        return UserQuestResult.objects.create(
            assignment=assignment,
            photo_url=validated_data['photo_url']
        )
