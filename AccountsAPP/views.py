from collections import defaultdict

from django.db.models import F
from django.utils.timezone import now
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from .models import UserQuestAssignment, UserQuestResult, Tip, Comment
from .serializers import UserSignupSerializer, UsernameLoginSerializer, UserQuestAssignmentSerializer, \
    UserQuestResultSerializer, CommunityPostListSerializer, CommunityPostDetailSerializer, CommentSerializer, \
    CommentDetailSerializer
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
        today = date.today()

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


# 나중에 옮길 예정
# views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from .models import CommunityPost, Campaign
from .serializers import CommunityPostSerializer, CampaignSerializer
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

CAMPAIGN_DATA_SCHEMA = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    properties={
        'title': openapi.Schema(type=openapi.TYPE_STRING),
        'content': openapi.Schema(type=openapi.TYPE_STRING),
        'post_type': openapi.Schema(type=openapi.TYPE_STRING, enum=['free','info','campaign']),
        'campaign_data': openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'city': openapi.Schema(type=openapi.TYPE_STRING),
                'district': openapi.Schema(type=openapi.TYPE_STRING),
                'start_date': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
                'end_date': openapi.Schema(type=openapi.TYPE_STRING, format='date'),
                'participant_limit': openapi.Schema(type=openapi.TYPE_INTEGER),
            },
            required=['city','district','start_date','end_date','participant_limit']
        )
    },
    required=['title','post_type']
)

# 카테고리별 List GET, POST api(두가지 기능)
class CommunityPostListCreateView(APIView):

    def get_permissions(self):
        # POST는 로그인 필요
        if self.request.method == 'POST':
            return [IsAuthenticated()]

        # GET + mine=true 이면 로그인 필요
        if self.request.method == 'GET' and self.request.query_params.get('mine') == 'true':
            return [IsAuthenticated()]

        # 그 외 GET 요청은 누구나
        return [AllowAny()]

    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'post_type',
                openapi.IN_QUERY,
                description="글 유형",
                type=openapi.TYPE_STRING,
                enum=['free', 'info', 'campaign']
            ),
            openapi.Parameter(
                'mine',
                openapi.IN_QUERY,
                description="내 글만 보기 (true/false)",
                type=openapi.TYPE_BOOLEAN
            ),
            openapi.Parameter(
                'page',
                openapi.IN_QUERY,
                description="페이지 번호",
                type=openapi.TYPE_INTEGER
            ),
        ]
    )
    def get(self, request):
        post_type = request.query_params.get('post_type')
        mine = request.query_params.get('mine')
        queryset = CommunityPost.objects.all().order_by('-created_at')

        # mine=true 이면 로그인 유저 필터
        if mine == 'true':
            queryset = queryset.filter(user=request.user)

        if post_type:
            queryset = queryset.filter(post_type=post_type)

        # 페이지네이션 수동 적용 (DRF의 기본 페이지네이터 이용)
        from rest_framework.pagination import PageNumberPagination

        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = CommunityPostListSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    @swagger_auto_schema(
        request_body=CAMPAIGN_DATA_SCHEMA,
        responses={201: openapi.Response('Created')}
    )
    def post(self, request):
        post_data = request.data.copy()
        campaign_data = post_data.pop('campaign_data', None)

        # Step 1: 기본 게시글 저장
        post_serializer = CommunityPostSerializer(data=post_data)
        post_serializer.is_valid(raise_exception=True)
        post = post_serializer.save(user=request.user)

        # Step 2: 캠페인인 경우 추가 저장
        if post.post_type == 'campaign':
            if not campaign_data:
                raise ValidationError({"campaign_data": "캠페인 정보가 필요합니다."})
            campaign_serializer = CampaignSerializer(data=campaign_data)
            campaign_serializer.is_valid(raise_exception=True)
            campaign_serializer.save(post=post)

        return Response({"message": "게시글이 생성되었습니다.", "post_id": post.id}, status=201)

#
class CommunityPostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk): # patch, delete에 쓰는 용도
        return get_object_or_404(CommunityPost, pk=pk)

    # 상세 조회
    def get(self, request, pk):
        post = get_object_or_404(CommunityPost, pk=pk)
        serializer = CommunityPostDetailSerializer(post)
        return Response(serializer.data)

    # 수정
    def patch(self, request, pk):
        post = self.get_object(pk)
        if post.user != request.user:
            raise PermissionDenied("본인 글만 수정할 수 있습니다.")

        serializer = CommunityPostSerializer(post, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # 캠페인일 경우 campaign 정보도 수정
        if post.post_type == "campaign" and "campaign_data" in request.data:
            campaign = post.campaign  # OneToOneField
            campaign_serializer = CampaignSerializer(campaign, data=request.data["campaign_data"], partial=True)
            campaign_serializer.is_valid(raise_exception=True)
            campaign_serializer.save()

        return Response(serializer.data)

    # 삭제
    def delete(self, request, pk):
        post = self.get_object(pk)
        if post.user != request.user:
            raise PermissionDenied("본인 글만 삭제할 수 있습니다.")
        post.delete()
        return Response(status=204)


class CommentCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        # 1) 대상 게시글 확인
        post = get_object_or_404(CommunityPost, pk=post_id)

        # 2) 댓글 생성
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.save(user=request.user, post=post)

        # 3) 댓글 수 카운트 업데이트
        post.comment_count = F('comment_count') + 1
        post.save(update_fields=['comment_count'])
        # F() 를 썼으니 실제 값 갱신을 위해 리프레시
        post.refresh_from_db(fields=['comment_count'])

        # 4) 생성된 댓글 정보 반환
        detail = CommentDetailSerializer(comment)
        return Response(detail.data, status=status.HTTP_201_CREATED)


class CommentDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, post_id, comment_id):
        # 1) 대상 댓글 가져오기 (post_id 검증 포함)
        comment = get_object_or_404(Comment, pk=comment_id, post_id=post_id)
        if comment.user != request.user:
            raise PermissionDenied("본인 댓글만 삭제할 수 있습니다.")

        # 2) 댓글 삭제 전, 연관된 게시글의 comment_count 감소
        post = comment.post
        comment.delete()
        post.comment_count = F('comment_count') - 1
        post.save(update_fields=['comment_count'])
        post.refresh_from_db(fields=['comment_count'])

        # 3) 삭제 성공 응답
        return Response(status=status.HTTP_204_NO_CONTENT)