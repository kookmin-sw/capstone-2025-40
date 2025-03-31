from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .models import UserQuestAssignment, UserQuestResult, Tip
from .serializers import UserSignupSerializer, UsernameLoginSerializer, UserQuestAssignmentSerializer, UserQuestResultSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import date


class UserSignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '회원가입 완료'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsernameLoginView(TokenObtainPairView):
    serializer_class = UsernameLoginSerializer


# 오늘 배정된 퀘스트 조회
class TodayAssignedQuestsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserQuestAssignmentSerializer

    def get_queryset(self):
        return UserQuestAssignment.objects.filter(
            user=self.request.user,
            assigned_date=date.today()
        )


# 퀘스트 인증 (사진 등록)
class UserQuestResultCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, assignment_id):
        try:
            assignment = UserQuestAssignment.objects.select_related('quest').get(
                id=assignment_id,
                user=request.user
            )
        except UserQuestAssignment.DoesNotExist:
            return Response({'error': '퀘스트를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

        # 이미 인증했는지 확인
        if assignment.is_completed:
            return Response({'error': '이미 인증된 퀘스트입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 오늘 인증만 허용
        if assignment.assigned_date != date.today():
            return Response({'error': '인증 기한이 지났습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # ✅ useCamera 여부에 따라 사진 필수 여부 판단
        use_camera = assignment.quest.useCamera
        photo_url = request.data.get('photo_url')

        if use_camera and not photo_url:
            return Response({'error': '사진이 필요합니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 인증 결과 저장
        result = UserQuestResult.objects.create(
            assignment=assignment,
            photo_url=photo_url if use_camera else None
        )
        assignment.is_completed = True
        assignment.save()

        return Response({'message': '퀘스트 인증 완료!'}, status=status.HTTP_201_CREATED)


class TodayQuestSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()

        assignments = UserQuestAssignment.objects.filter(user=user, assigned_date=today)
        total = assignments.count()
        completed = assignments.filter(is_completed=True).count()

        return Response({
            "completed": completed,
            "total": total
        })



from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random


class RandomTipView(APIView):
    authentication_classes = []
    permission_classes = []

    def get(self, request):
        tips = Tip.objects.all()
        if not tips.exists():
            return Response({"tip": "팁이 아직 등록되어 있지 않습니다."}, status=status.HTTP_200_OK)

        tip = random.choice(tips)
        return Response({"tip": tip.text}, status=status.HTTP_200_OK)
