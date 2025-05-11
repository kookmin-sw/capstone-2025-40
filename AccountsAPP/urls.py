from django.urls import path
from .views import UserSignupView, UsernameLoginView, TodayAssignedQuestsView, UserQuestResultCreateView, RandomTipView, \
    TodayQuestSummaryView, ChallengeStatsAPIView, DuplicateCheckAPIView, \
    CommunityPostDetailView, CommunityPostListCreateView, CommentCreateView, CommentDetailView, ReplyCreateView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', UserSignupView.as_view(), name='signup'),
    path('login/', UsernameLoginView.as_view(), name='username_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('my-quests/today/', TodayAssignedQuestsView.as_view(), name='today-quests'),
    path('my-quests/<int:assignment_id>/complete/', UserQuestResultCreateView.as_view(), name='quest-complete'),
    path('tips/random/', RandomTipView.as_view(), name='random-tip'),
    path('my-quests/today/summary/', TodayQuestSummaryView.as_view(), name='today-quest-summary'),
    path('my-challenge-stats/', ChallengeStatsAPIView.as_view()),
    path('check-duplicate/', DuplicateCheckAPIView.as_view()),
    path('community/posts/', CommunityPostListCreateView.as_view(), name='community-post-create'), # ?post_type=<타입>&page=<페이지 번호> 어떤 유형의 글인지 전체 조회 # ?mine=true 내 글조회
    path('community/posts/<int:pk>/', CommunityPostDetailView.as_view(), name='community-post-detail'),
    path('api/community/posts/<int:post_id>/comments/', CommentCreateView.as_view(), name='comment-create'),
    path('api/community/posts/<int:post_id>/comments/<int:comment_id>/', CommentDetailView.as_view(), name='comment-detail'),
    path('api/community/posts/<int:post_id>/comments/<int:parent_id>/replies/', ReplyCreateView.as_view(), name='reply-create'),
]
