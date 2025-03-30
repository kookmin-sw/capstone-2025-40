from django.urls import path
from .views import UserSignupView, UsernameLoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('signup/', UserSignupView.as_view(), name='signup'),
    path('login/', UsernameLoginView.as_view(), name='username_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
