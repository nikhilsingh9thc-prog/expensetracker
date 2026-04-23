from django.urls import path
from .views import financial_summary, category_breakdown, spending_trends

urlpatterns = [
    path('analytics/summary/', financial_summary, name='analytics-summary'),
    path('analytics/category-breakdown/', category_breakdown, name='analytics-category-breakdown'),
    path('analytics/trends/', spending_trends, name='analytics-trends'),
]
