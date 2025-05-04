from django.urls import path
from .views import UserSignupView, UsernameLoginView, TodayAssignedQuestsView, UserQuestResultCreateView, RandomTipView, \
    TodayQuestSummaryView, ChallengeStatsAPIView, DuplicateCheckAPIView
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
]
