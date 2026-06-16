from django.urls import path

from .views import LoginAPIView, LogoutAPIView, MeAPIView, RegisterAPIView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='accounts-register'),
    path('login/', LoginAPIView.as_view(), name='accounts-login'),
    path('logout/', LogoutAPIView.as_view(), name='accounts-logout'),
    path('me/', MeAPIView.as_view(), name='accounts-me'),
]
