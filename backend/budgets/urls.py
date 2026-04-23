from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BudgetViewSet, budget_status

router = DefaultRouter()
router.register(r'budgets', BudgetViewSet, basename='budget')

urlpatterns = [
    path('budgets-status/', budget_status, name='budget-status'),
    path('', include(router.urls)),
]
