from django.urls import path
from .views import UserSignupView, UsernameLoginView, TodayAssignedQuestsView, UserQuestResultCreateView, RandomTipView, \
    TodayQuestSummaryView, ChallengeStatsAPIView, DuplicateCheckAPIView, \
    CommunityPostDetailView, CommunityPostListCreateView, CommentListCreateView, CommentDetailView, ReplyCreateView, \
    CommentLikeToggleView, ReportCreateView, CampaignParticipantToggleView, PostScrapToggleView, \
    PostLikeToggleView, ScrappedPostListView, JoinedCampaignPostListView, UserProfileView, MyPageView, \
    PasswordResetCodeRequestAPIView, PasswordResetWithCodeAPIView, FindUsernameAPIView, GlobalRankingListView, \
    LocalRankingListView, MonthlySuccessDaysAPIView, FCMDeviceRegisterView, FCMDeviceUnregisterView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', UserSignupView.as_view(), name='signup'),
    path('login/', UsernameLoginView.as_view(), name='username_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/find-username/', FindUsernameAPIView.as_view(), name='find-username'),
    path('auth/password/reset/code/', PasswordResetCodeRequestAPIView.as_view(), name='password-reset-code-request'),
    path('auth/password/reset/confirm-code/', PasswordResetWithCodeAPIView.as_view(), name='password-reset-confirm-code'),
    path('profile/<int:user_id>/', UserProfileView.as_view(), name='user-profile'),
    path('profile/my/', MyPageView.as_view(), name='my-page'),
    path('my-quests/today/', TodayAssignedQuestsView.as_view(), name='today-quests'),
    path('my-quests/<int:assignment_id>/complete/', UserQuestResultCreateView.as_view(), name='quest-complete'),
    path('my-quests/success-days/', MonthlySuccessDaysAPIView.as_view(), name='monthly-success-days'),
    path('tips/random/', RandomTipView.as_view(), name='random-tip'),
    path('my-quests/today/summary/', TodayQuestSummaryView.as_view(), name='today-quest-summary'),
    path('my-challenge-stats/', ChallengeStatsAPIView.as_view()),
    path('rankings/global/', GlobalRankingListView.as_view(), name='global-ranking'),
    path('rankings/local/', LocalRankingListView.as_view(), name='local-ranking'),
    path('check-duplicate/', DuplicateCheckAPIView.as_view()),
    path('community/posts/', CommunityPostListCreateView.as_view(), name='community-post-create-list'), # ?post_type=<타입>&page=<페이지 번호> 어떤 유형의 글인지 전체 조회 # ?mine=true 내 글조회
    path('community/posts/campaigns_joined/', JoinedCampaignPostListView.as_view(), name='joined-campaign-posts'),
    path('community/posts/scrapped/', ScrappedPostListView.as_view(), name='post-scrapped-list'),
    path('community/posts/<int:pk>/', CommunityPostDetailView.as_view(), name='community-post-detail'),
    path('community/posts/<int:post_id>/like/', PostLikeToggleView.as_view(), name='post-like-toggle'),
    path('community/posts/<int:post_id>/scrap/', PostScrapToggleView.as_view(), name='post-scrap-toggle'),
    path('community/posts/<int:post_id>/participant/', CampaignParticipantToggleView.as_view(), name='campaign-participant'),
    path('community/posts/<int:post_id>/comments/', CommentListCreateView.as_view(), name='comment-create-list'),
    path('community/posts/<int:post_id>/comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
    path('community/posts/<int:post_id>/comments/<int:parent_id>/replies/', ReplyCreateView.as_view(), name='reply-create'),
    path('community/posts/<int:post_id>/comments/<int:comment_id>/like/', CommentLikeToggleView.as_view(), name='comment-like-toggle'),
    path('community/posts/<int:post_id>/report/', ReportCreateView.as_view(), name='post-report'),
    path('community/posts/<int:post_id>/comments/<int:comment_id>/report/', ReportCreateView.as_view(), name='comment-report'),

    # 토큰 등록/갱신 (POST)
    path('fcm/devices/', FCMDeviceRegisterView.as_view(), name='fcm_device_register'),
    # 토큰 삭제 (DELETE)
    path('fcm/devices/', FCMDeviceUnregisterView.as_view(), name='fcm_device_unregister'),
]
