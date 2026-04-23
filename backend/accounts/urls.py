from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserProfileView, ChangePasswordView,
    SendOTPView, VerifyOTPView, CheckUsernameView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),
    path('login/', TokenObtainPairView.as_view(), name='auth-login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='auth-token-refresh'),
    path('user/', UserProfileView.as_view(), name='auth-user-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
    path('send-otp/', SendOTPView.as_view(), name='auth-send-otp'),
    path('verify-otp/', VerifyOTPView.as_view(), name='auth-verify-otp'),
    path('check-username/', CheckUsernameView.as_view(), name='auth-check-username'),
]
