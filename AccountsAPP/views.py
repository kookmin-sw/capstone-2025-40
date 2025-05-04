from collections import defaultdict
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .models import UserQuestAssignment, UserQuestResult, Tip
from .serializers import UserSignupSerializer, UsernameLoginSerializer, UserQuestAssignmentSerializer, UserQuestResultSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from datetime import date, timedelta


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


class ChallengeStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = now().date()

        # 오늘의 퀘스트 진행률
        today_assignments = UserQuestAssignment.objects.filter(user=user, assigned_date=today)
        today_total = today_assignments.count()
        today_completed = today_assignments.filter(is_completed=True).count()

        # 최근 7일간 완료 현황
        last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]
        weekly_data = {d: 0 for d in last_7_days}
        weekly_assignments = UserQuestAssignment.objects.filter(
            user=user, is_completed=True, assigned_date__in=last_7_days
        )
        for item in weekly_assignments:
            weekly_data[item.assigned_date] += 1
        weekly_output = [{"date": d.strftime('%Y-%m-%d'), "count": weekly_data[d]} for d in last_7_days]

        # 최근 4주간 (주차별) 완료 현황
        start_of_month = today - timedelta(days=28)
        monthly_assignments = UserQuestAssignment.objects.filter(
            user=user, is_completed=True,
            assigned_date__gte=start_of_month, assigned_date__lte=today
        )
        weekly_counts = defaultdict(int)
        for a in monthly_assignments:
            week_index = ((today - a.assigned_date).days // 7)
            week_number = 4 - week_index
            weekly_counts[week_number] += 1
        monthly_output = [{"week": i, "count": weekly_counts.get(i, 0)} for i in range(1, 5)]

        # 최대 연속 달성 일수 계산
        completed_days = set(
            UserQuestAssignment.objects.filter(user=user, is_completed=True)
            .values_list('assigned_date', flat=True)
        )
        max_streak = 0
        current_streak = 0
        check_day = today
        while check_day in completed_days:
            current_streak += 1
            check_day -= timedelta(days=1)
        max_streak = current_streak

        # 전체 완료 날짜 수
        total_success_days = len(completed_days)

        return Response({
            "today": {
                "completed": today_completed,
                "total": today_total,
                "progress": int((today_completed / today_total) * 100) if today_total > 0 else 0
            },
            "weekly": weekly_output,
            "monthly": monthly_output,
            "max_streak": max_streak,
            "total_success_days": total_success_days
        })


from django.http import JsonResponse
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

User = get_user_model()

class DuplicateCheckAPIView(APIView): # 중복검사 api
    permission_classes = [AllowAny]

    def get(self, request):
        field = request.GET.get('field')
        value = request.GET.get('value')

        if not field or not value:
            return JsonResponse({"error": "field와 value를 모두 전달해야 합니다."}, status=400)

        if field not in ['username', 'name', 'email', 'phone_number']:
            return JsonResponse({"error": "유효하지 않은 필드입니다."}, status=400)

        filter_kwargs = {field: value}
        exists = User.objects.filter(**filter_kwargs).exists()

        return JsonResponse({"exists": exists})
