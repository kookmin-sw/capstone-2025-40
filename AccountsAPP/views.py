import random
from calendar import monthrange
from collections import defaultdict
from datetime import date, timedelta
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import F, Prefetch, Window, Q, Count, Exists, OuterRef, Case, When, Value, BooleanField
from django.db.models.functions import Rank
from django.http import JsonResponse
from django.utils.timezone import now
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import generics, permissions, status
from rest_framework.generics import ListAPIView, RetrieveAPIView, RetrieveUpdateAPIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from .models import UserQuestAssignment, UserQuestResult, Tip, CommunityPost, Campaign, Comment, PostImage, CommentLike, \
    Report, CampaignParticipant, PostScrap, PostLike, PasswordResetCode, FCMDevice
from .pagination import RankingPagination
from .serializers import UserSignupSerializer, UsernameLoginSerializer, UserQuestAssignmentSerializer, \
    UserQuestResultSerializer, CommunityPostListSerializer, CommunityPostDetailSerializer, CommentSerializer, \
    CommunityPostSerializer, CampaignSerializer, CommentDetailSerializer, ReportSerializer, CampaignParticipantSerializer, UserProfileSerializer, \
    FindUsernameSerializer, PasswordResetCodeRequestSerializer, PasswordResetWithCodeSerializer, UserRankingSerializer, \
    FCMDeviceSerializer
from .utils.notifications import send_push_to_user

User = get_user_model()


######################################################### PWA 알림
class FCMDeviceRegisterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FCMDeviceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        FCMDevice.objects.update_or_create(
            user=request.user,
            registration_token=serializer.validated_data['registration_token']
        )
        return Response(status=201)


class FCMDeviceUnregisterView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        token = request.data.get('registration_token')
        FCMDevice.objects.filter(user=request.user, registration_token=token).delete()
        return Response(status=204)

#########################################################


class UserSignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '회원가입 완료'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UsernameLoginView(TokenObtainPairView):
    serializer_class = UsernameLoginSerializer



class UserProfileView(RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [AllowAny]            # 공개 프로필이라면 AllowAny, 로그인 필요 시 IsAuthenticated
    lookup_field = 'id'
    lookup_url_kwarg = 'user_id'


class MyPageView(RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # 요청한 사용자를 그대로 반환
        return self.request.user


class FindUsernameAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = FindUsernameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'detail': '해당 이메일로 가입된 계정이 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({'username': user.username}, status=status.HTTP_200_OK)



class PasswordResetCodeRequestAPIView(APIView):
    """
      - body: { email }
      - 해당 이메일의 유저가 있으면 6자리 코드 생성·저장 후 메일 발송
      - (보안상) 항상 200 응답
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetCodeRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # 존재하지 않아도 같은 응답
            return Response({'detail': '인증번호를 발송했습니다.'}, status=status.HTTP_200_OK)

        # 이전 코드 무효화
        PasswordResetCode.objects.filter(user=user, is_used=False).update(is_used=True)

        # 6자리 숫자 코드 생성
        code = f"{random.randint(0, 999999):06d}"
        PasswordResetCode.objects.create(user=user, code=code)

        # 이메일 발송
        send_mail(
            subject='[GreenDay] 비밀번호 재설정 인증번호',
            message=f'인증번호: {code}\n\n10분 이내에 입력해 주세요.',
            from_email=None,  # DEFAULT_FROM_EMAIL 사용
            recipient_list=[email],
        )

        return Response({'detail': '인증번호를 발송했습니다.'}, status=status.HTTP_200_OK)


class PasswordResetWithCodeAPIView(APIView):
    """
      - body: { email, code, new_password }
      - 인증번호 확인 후 비밀번호 변경
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetWithCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'detail': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prc = PasswordResetCode.objects.get(user=user, code=code, is_used=False)
        except PasswordResetCode.DoesNotExist:
            return Response({'detail': '인증번호가 유효하지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 만료 검사
        if prc.is_expired:
            prc.is_used = True
            prc.save(update_fields=['is_used'])
            return Response({'detail': '인증번호가 만료되었습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 비밀번호 변경
        user.set_password(new_password)
        user.save()

        # 코드 사용 처리
        prc.is_used = True
        prc.save(update_fields=['is_used'])

        return Response({'detail': '비밀번호가 변경되었습니다.'}, status=status.HTTP_200_OK)


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


        # 여기쯤에 로직 추가하면 될 듯.
        # def AIcertification(image, prompt)


        # 인증 결과 저장
        result = UserQuestResult.objects.create(
            assignment=assignment,
            photo_url=photo_url if use_camera else None
        )
        assignment.is_completed = True
        assignment.save()

        # 테스트용 FCM 푸시 전송
        send_push_to_user(
            request.user,
            title='🎉 퀘스트 인증 완료!',
            body=f'"{assignment.quest.title}" 퀘스트 인증이 완료되었습니다.',
            data={'click_action': f'/quests/{assignment.id}/result'}
        )

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


class MonthlySuccessDaysAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Query Params:
          - year: YYYY (e.g. 2025)
          - month: MM   (1~12)
        Response:
          { "success_dates": ["2025-05-01", "2025-05-03", ...] }
        """
        # 1) year, month 파싱 및 유효성 체크
        try:
            year = int(request.query_params.get('year'))
            month = int(request.query_params.get('month'))
            _, _ = monthrange(year, month)
        except (TypeError, ValueError):
            return Response(
                {"detail": "year, month를 올바르게 전달하세요. (예: ?year=2025&month=5)"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 2) UserQuestResult 테이블에서 assignment__assigned_date 기준으로 집계
        qs = (
            UserQuestResult.objects
            .filter(
                assignment__user=request.user,
                assignment__assigned_date__year=year,
                assignment__assigned_date__month=month
            )
            .values(day=F('assignment__assigned_date'))
            .annotate(completed_count=Count('pk'))
            .filter(completed_count=5)      # 하루 인증이 5건인 날만
            .order_by('day')
        )

        # 3) 날짜 문자열 리스트로 변환
        success_dates = [
            entry['day'].strftime('%Y-%m-%d')
            for entry in qs
        ]

        return Response({"success_dates": success_dates})



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


class GlobalRankingListView(ListAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = UserRankingSerializer
    pagination_class = RankingPagination

    def get_queryset(self):
        # Rank 윈도우 함수로 전체 순위 계산
        return User.objects.annotate(
            rank=Window(
                expression=Rank(),
                order_by=F('points').desc()
            )
        ).order_by('-points')


class LocalRankingListView(ListAPIView):

    permission_classes = [IsAuthenticated]
    serializer_class = UserRankingSerializer
    pagination_class = RankingPagination

    def get_queryset(self):
        user = self.request.user
        # 동네 사용자만 필터 후 순위 계산
        return User.objects.filter(
            city=user.city,
            district=user.district
        ).annotate(
            rank=Window(
                expression=Rank(),
                order_by=F('points').desc()
            )
        ).order_by('-points')




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

        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )

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
        image_urls = post_data.pop('images', [])
        campaign_data = post_data.pop('campaign_data', None)

        if len(image_urls) > 5:
            raise ValidationError({"images": "최대 5장까지만 업로드할 수 있습니다."})

        # 1) 기본 게시글 저장
        post_serializer = CommunityPostSerializer(data=post_data)
        post_serializer.is_valid(raise_exception=True)
        post = post_serializer.save(user=request.user)

        # 2) 이미지 저장
        for url in image_urls:
            PostImage.objects.create(post=post, image_url=url)

        # 3) 캠페인 처리
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
        user = request.user

        # 1) 기본 queryset에 플래그 annotate
        qs = CommunityPost.objects.select_related('user', 'campaign').annotate(
            is_owner=Case(
                When(user=user, then=Value(True)),
                default=Value(False),
                output_field=BooleanField()
            ),
            has_liked=Exists(
                PostLike.objects.filter(post=OuterRef('pk'), user=user)
            ),
            has_scrapped=Exists(
                PostScrap.objects.filter(post=OuterRef('pk'), user=user)
            ),
            has_participated=Exists(
                CampaignParticipant.objects.filter(campaign=OuterRef('campaign'), user=user)
            ),
        )

        # 2) annotate된 queryset에서 단일 객체 조회
        post = get_object_or_404(qs, pk=pk)

        # 3) context에 request 넣어서 Serializer 호출
        serializer = CommunityPostDetailSerializer(post, context={'request': request})
        return Response(serializer.data)
    # 수정
    def patch(self, request, pk):
        post = self.get_object(pk)
        if post.user != request.user:
            raise PermissionDenied("본인 글만 수정할 수 있습니다.")

        data = request.data.copy()
        image_urls = data.pop('images', None)

        post_serializer = CommunityPostSerializer(post, data=data, partial=True)
        post_serializer.is_valid(raise_exception=True)
        post = post_serializer.save()

        if image_urls is not None:
            if len(image_urls) > 5:
                raise ValidationError({"images": "최대 5장까지만 업로드할 수 있습니다."})
            post.images.all().delete()  # 기존 이미지 전부 삭제
            for url in image_urls:  # 새로운 URL로 다시 생성
                PostImage.objects.create(post=post, image_url=url)

        # 캠페인일 경우 campaign 정보도 수정
        if post.post_type == "campaign" and "campaign_data" in request.data:
            campaign = post.campaign  # OneToOneField
            campaign_serializer = CampaignSerializer(campaign, data=request.data["campaign_data"], partial=True)
            campaign_serializer.is_valid(raise_exception=True)
            campaign_serializer.save()

        return Response(CommunityPostDetailSerializer(post).data, status=200)

    # 삭제
    def delete(self, request, pk):
        post = self.get_object(pk)
        if post.user != request.user:
            raise PermissionDenied("본인 글만 삭제할 수 있습니다.")
        post.delete()
        return Response(status=204)


class PostLikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(CommunityPost, pk=post_id)
        qs = PostLike.objects.filter(post=post, user=request.user)

        if qs.exists():
            # 좋아요 취소
            qs.delete()
            liked = False
            post.like_count = F('like_count') - 1
        else:
            # 좋아요 생성
            PostLike.objects.create(post=post, user=request.user)
            liked = True
            post.like_count = F('like_count') + 1

        # DB 레벨에서 안전하게 증감 처리
        post.save(update_fields=['like_count'])
        post.refresh_from_db(fields=['like_count'])

        return Response(
            {'liked': liked, 'like_count': post.like_count},
            status=status.HTTP_200_OK
        )


class PostScrapToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        # 1) 대상 게시글 조회
        post = get_object_or_404(CommunityPost, pk=post_id)

        # 2) 토글 로직: 존재하면 삭제, 없으면 생성
        scrap_qs = PostScrap.objects.filter(post=post, user=request.user)
        if scrap_qs.exists():
            # 이미 스크랩된 상태 → 취소
            scrap_qs.delete()
            scrapped = False
            # 비정규화된 카운트 감소
            post.scrap_count = F('scrap_count') - 1
        else:
            # 스크랩 생성
            PostScrap.objects.create(post=post, user=request.user)
            scrapped = True
            # 비정규화된 카운트 증가
            post.scrap_count = F('scrap_count') + 1

        # 3) DB 레벨에서 안전하게 반영 후 실제 값 가져오기
        post.save(update_fields=['scrap_count'])
        post.refresh_from_db(fields=['scrap_count'])

        # 4) 최종 상태 반환
        return Response(
            {"scrapped": scrapped, "scrap_count": post.scrap_count},
            status=status.HTTP_200_OK
        )


class ScrappedPostListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommunityPostListSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        qs = CommunityPost.objects.filter(scraps__user=self.request.user).order_by('-created_at')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )
        return qs


class CommentListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request, post_id):
        user = request.user if request.user.is_authenticated else None
        post = get_object_or_404(CommunityPost, pk=post_id)

        # 1) 모든 댓글(부모/자식)에 대해 플래그 annotate
        annotated_comments = Comment.objects.filter(post=post).annotate(
            is_my_comment=Case(
                When(user=user, then=Value(True)),
                default=Value(False),
                output_field=BooleanField()
            ),
            # 자식 댓글이든 부모 댓글이든, 로그인 유저가 작성자면 True
            is_my_reply=Case(
                When(parent__isnull=False, user=user, then=Value(True)),
                default=Value(False),
                output_field=BooleanField()
            ),
            has_liked_comment=Exists(
                CommentLike.objects.filter(comment=OuterRef('pk'), user=user)
            )
        )

        # 2) 부모 댓글만 꺼내오되, 이미 annotate된 자식 댓글도 Prefetch
        parent_qs = annotated_comments.filter(parent__isnull=True).order_by('-created_at')
        parent_qs = parent_qs.prefetch_related(
            Prefetch(
                'replies',
                queryset=annotated_comments.filter(parent__isnull=False).order_by('created_at'),
                to_attr='annotated_replies'
            )
        )

        # 3) 페이지네이션 & 직렬화
        paginator = PageNumberPagination()
        page = paginator.paginate_queryset(parent_qs, request)
        serializer = CommentDetailSerializer(
            page,
            many=True,
            context={'request': request}
        )
        return paginator.get_paginated_response(serializer.data)

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


class CommentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_comment(self, post_id, comment_id):
        return get_object_or_404(Comment, pk=comment_id, post_id=post_id)

    def patch(self, request, post_id, comment_id):
        comment = self.get_comment(post_id, comment_id)
        if comment.user != request.user:
            raise PermissionDenied("본인 댓글만 수정할 수 있습니다.")

        serializer = CommentSerializer(comment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(CommentDetailSerializer(comment).data)

    def delete(self, request, post_id, comment_id):
        # 1) 대상 댓글 가져오기 (post_id 검증 포함)
        comment = self.get_comment(post_id, comment_id)
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


class ReplyCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id, parent_id):
        # 1) 원본 게시글과 부모 댓글 확인
        post = get_object_or_404(CommunityPost, pk=post_id)
        parent = get_object_or_404(Comment, pk=parent_id, post=post)

        # 2) 대댓글 생성
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reply = serializer.save(
            user=request.user,
            post=post,
            parent=parent
        )

        # 3) 게시글 댓글 수 업데이트
        post.comment_count = F('comment_count') + 1
        post.save(update_fields=['comment_count'])
        post.refresh_from_db(fields=['comment_count'])

        # 4) 생성된 대댓글 반환
        return Response(
            CommentDetailSerializer(reply).data,
            status=status.HTTP_201_CREATED
        )


class CommentLikeToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id, comment_id):
        comment = get_object_or_404(Comment, pk=comment_id, post_id=post_id)

        like_qs = CommentLike.objects.filter(comment=comment, user=request.user)
        if like_qs.exists():
            like_qs.delete()
            liked = False
        else:
            CommentLike.objects.create(comment=comment, user=request.user)
            liked = True

        like_count = CommentLike.objects.filter(comment=comment).count()

        return Response(
            {"liked": liked, "like_count": like_count},
            status=status.HTTP_200_OK
        )


class ReportCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id, comment_id=None):
        # 1) 신고 대상 가져오기
        if comment_id is not None:
            target = get_object_or_404(Comment, pk=comment_id, post_id=post_id)
            lookup = {'comment': target}
        else:
            target = get_object_or_404(CommunityPost, pk=post_id)
            lookup = {'post': target}

        # 2) 중복 신고 방지
        if Report.objects.filter(user=request.user, **lookup).exists():
            return Response(
                {'detail': '이미 신고하셨습니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3) 신고 생성
        serializer = ReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        Report.objects.create(user=request.user, **lookup, **serializer.validated_data)

        return Response({"reported": True}, status=status.HTTP_201_CREATED)



class CampaignParticipantToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, post_id):
        # 1) 게시글 조회 및 연결된 캠페인 가져오기
        post = get_object_or_404(CommunityPost, pk=post_id)
        campaign = post.campaign

        # 2) 해당 캠페인 참여자 목록 조회
        participants = CampaignParticipant.objects.filter(
            campaign=campaign
        ).select_related('user')

        # 3) 직렬화 및 응답
        serializer = CampaignParticipantSerializer(participants, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, post_id):
        # 1) 게시글 조회 및 연결된 캠페인 가져오기
        post = get_object_or_404(CommunityPost, pk=post_id)
        campaign = post.campaign

        # 2) 사용자 참여 토글 로직
        qs = CampaignParticipant.objects.filter(campaign=campaign, user=request.user)
        if qs.exists():
            # 이미 참여 중 → 취소
            qs.delete()
            participated = False
        else:
            # 참여 전 → 정원 체크
            if campaign.is_full:
                return Response(
                    {'detail': '참여 정원이 가득 찼습니다.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            CampaignParticipant.objects.create(campaign=campaign, user=request.user)
            participated = True

        # 3) 최신 참여자 수 조회 및 응답
        current_count = campaign.participants.count()  # related_name='participants'
        return Response(
            {
                'participated': participated,
                'current_participant_count': current_count
            },
            status=status.HTTP_200_OK
        )



class JoinedCampaignPostListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CommunityPostListSerializer
    pagination_class = PageNumberPagination

    def get_queryset(self):
        qs = CommunityPost.objects.filter(campaign__participants__user=self.request.user).order_by('-created_at')

        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(content__icontains=search)
            )
        return qs