from django.urls import path
from .views import LoginView, LogoutView, UserView, CSRFTokenView, register_user, login_user

urlpatterns = [
    path('login/', LoginView.as_view(), name='api_login'),
    path('logout/', LogoutView.as_view(), name='api_logout'),
    path('user/', UserView.as_view(), name='api_user'),
    path('csrf-token/', CSRFTokenView.as_view(), name='api_csrf_token'),
    path('register/', register_user, name='api_register'),
    path('login-user/', login_user, name='api_login_user'),  # Additional API endpoint for login
]