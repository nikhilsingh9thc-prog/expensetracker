from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.conf import settings
from .models import OTPVerification
from .serializers import (
    RegisterSerializer, UserSerializer, ChangePasswordSerializer,
    SendOTPSerializer, VerifyOTPSerializer, CheckUsernameSerializer
)
from transactions.models import Category


class RegisterView(generics.CreateAPIView):
    """Register a new user and seed default categories."""
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        # Seed default categories for new user
        default_categories = [
            {'name': 'Salary', 'type': 'income', 'icon': '💰'},
            {'name': 'Freelance', 'type': 'income', 'icon': '💻'},
            {'name': 'Investments', 'type': 'income', 'icon': '📈'},
            {'name': 'Other Income', 'type': 'income', 'icon': '💵'},
            {'name': 'Groceries', 'type': 'expense', 'icon': '🛒'},
            {'name': 'Rent', 'type': 'expense', 'icon': '🏠'},
            {'name': 'Utilities', 'type': 'expense', 'icon': '💡'},
            {'name': 'Transportation', 'type': 'expense', 'icon': '🚗'},
            {'name': 'Entertainment', 'type': 'expense', 'icon': '🎬'},
            {'name': 'Food & Dining', 'type': 'expense', 'icon': '🍕'},
            {'name': 'Healthcare', 'type': 'expense', 'icon': '🏥'},
            {'name': 'Shopping', 'type': 'expense', 'icon': '🛍️'},
            {'name': 'Education', 'type': 'expense', 'icon': '📚'},
            {'name': 'Subscriptions', 'type': 'expense', 'icon': '📱'},
        ]
        for cat in default_categories:
            Category.objects.create(user=user, is_default=True, **cat)


class UserProfileView(APIView):
    """Get or update the current user's profile."""
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ChangePasswordView(APIView):
    """Change the current user's password."""
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {"old_password": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"detail": "Password changed successfully."})


class SendOTPView(APIView):
    """Send OTP to user's email."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        purpose = serializer.validated_data['purpose']

        # Invalidate previous OTPs for this email
        OTPVerification.objects.filter(email=email, purpose=purpose, is_verified=False).delete()

        # Create new OTP
        otp = OTPVerification(email=email, purpose=purpose)
        otp.save()
        print("OTP:", otp.otp_code)   

        # Send email
        try:
            send_mail(
                subject=f'Paise Kaha - Your OTP Code: {otp.otp_code}',
                message=f'Your OTP verification code is: {otp.otp_code}\n\nThis code expires in 10 minutes.',
                from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@paisekaha.com',
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            print("EMAIL ERROR:", e)
            pass

        return Response({"detail": "OTP sent successfully.", "email": email})


class VerifyOTPView(APIView):
    """Verify an OTP code."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp_code']
        purpose = serializer.validated_data['purpose']

        try:
            otp = OTPVerification.objects.filter(
                email=email, otp_code=otp_code, purpose=purpose, is_verified=False
            ).latest('created_at')
        except OTPVerification.DoesNotExist:
            return Response(
                {"detail": "Invalid OTP code."},
                status=status.HTTP_400_BAD_REQUEST
            )
            

        if otp.is_expired:
            return Response(
                {"detail": "OTP has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp.is_verified = True
        otp.save()

        return Response({"detail": "OTP verified successfully.", "verified": True})


class CheckUsernameView(APIView):
    """Check if a username is available."""
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = CheckUsernameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        username = serializer.validated_data['username']
        is_taken = User.objects.filter(username=username).exists()

        return Response({
            "username": username,
            "available": not is_taken,
        })
