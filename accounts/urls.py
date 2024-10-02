from django.urls import path
from .views import LoginView, LogoutView, UserView, CSRFTokenView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user/', UserView.as_view(), name='user'),
    path('csrf-token/', CSRFTokenView.as_view(), name='csrf_token'),
]
