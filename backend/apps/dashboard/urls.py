from django.urls import path

from .views import DashboardResumoAPIView, GraficoSemanalAPIView

urlpatterns = [
    path('resumo/', DashboardResumoAPIView.as_view(), name='dashboard-resumo'),
    path('semanal/', GraficoSemanalAPIView.as_view(), name='dashboard-semanal'),
]
