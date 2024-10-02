from django.shortcuts import render, redirect, get_object_or_404
from django.urls import reverse
from django.views import View
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.contrib.auth import login, authenticate, logout
from .forms import LoginForm, UserRegisterForm, UserProfileForm, ProfileUpdateForm
from .models import User, UserProfile
from django.contrib import messages
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Q  # Ensure this import exists
from rest_framework.views import APIView
from django.middleware.csrf import get_token


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': serializer.data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    User = get_user_model()
    username_or_email = request.data.get('username_or_email')
    password = request.data.get('password')
    
    # Try to fetch the user by username or email
    try:
        user = User.objects.get(Q(username=username_or_email) | Q(email=username_or_email))
    except User.DoesNotExist:
        user = None
    
    if user and user.check_password(password):
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class CustomLoginView(View):
    template_name = 'login.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('profile_detail', username=request.user.username)
        form = LoginForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, 'You have successfully logged in.')
                return redirect(reverse('storyline_selection'))
            else:
                messages.error(request, 'Invalid username or password.')
        return render(request, self.template_name, {'form': form})


class RegisterUserView(View):
    template_name = 'register.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('profile_detail', username=request.user.username)  # Redirect to the profile_detail view
        form = UserRegisterForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        if request.user.is_authenticated:
            return redirect('profile_detail', username=request.user.username)  # Redirect to the profile_detail view

        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('profile_detail', username=user.username)  # Redirect to the newly created user's profile
        return render(request, self.template_name, {'form': form})


@method_decorator(login_required, name='dispatch')
class ProfileUpdateView(View):
    form_class = ProfileUpdateForm
    template_name = 'profile_update.html'

    def get(self, request, username):
        profile = get_object_or_404(UserProfile, user__username=username)
        form = self.form_class(instance=profile)
        return render(request, self.template_name, {'form': form, 'profile': profile})

    def post(self, request, username):
        profile = get_object_or_404(UserProfile, user__username=username)
        form = self.form_class(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            return redirect('profile_update_success')  # Redirect to success page or profile page
        return render(request, self.template_name, {'form': form, 'profile': profile})


@method_decorator(login_required, name='dispatch')
class ProfileDetailView(View):
    template_name = 'profile_detail.html'
    
    def get(self, request, username):
        # Retrieve the profile by the username in the URL
        profile = get_object_or_404(UserProfile, user__username=username)
        return render(request, self.template_name, {'profile': profile})


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Ensure the user is authenticated
def user_detail(request):
    user = request.user  # Get the currently authenticated user
    serializer = UserSerializer(user)  # Serialize the user data
    return Response(serializer.data)  # Return the user data


class LoginView(APIView):
    def post(self, request):
        username_or_email = request.data.get('username_or_email')
        password = request.data.get('password')
        user = authenticate(request, username=username_or_email, password=password)
        if user is not None:
            login(request, user)
            refresh = RefreshToken.for_user(user)
            return Response({
                'detail': 'Successfully logged in.',
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'username': request.user.username,
            'email': request.user.email
        })


class CSRFTokenView(APIView):
    def get(self, request):
        return Response({'csrfToken': get_token(request)})