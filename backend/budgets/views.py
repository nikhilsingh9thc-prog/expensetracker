from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Budget
from .serializers import BudgetSerializer
from transactions.models import Transaction


class BudgetViewSet(viewsets.ModelViewSet):
    """CRUD operations for budgets."""
    serializer_class = BudgetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Budget.objects.filter(user=self.request.user)

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)

        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def budget_status(request):
    """Get budget consumption status with alerts for current or specified month."""
    now = timezone.now()
    month = int(request.query_params.get('month', now.month))
    year = int(request.query_params.get('year', now.year))

    budgets = Budget.objects.filter(
        user=request.user, month=month, year=year
    ).select_related('category')

    result = []
    for budget in budgets:
        spent = Transaction.objects.filter(
            user=request.user,
            category=budget.category,
            type='expense',
            date__month=month,
            date__year=year
        ).aggregate(total=Sum('amount'))['total'] or 0

        limit = float(budget.limit_amount)
        spent = float(spent)
        percentage = (spent / limit * 100) if limit > 0 else 0

        alert = None
        if percentage >= 100:
            alert = 'exceeded'
        elif percentage >= 80:
            alert = 'warning'

        result.append({
            'id': budget.id,
            'category_id': budget.category.id,
            'category_name': budget.category.name,
            'category_icon': budget.category.icon,
            'limit_amount': limit,
            'spent': spent,
            'remaining': max(0, limit - spent),
            'percentage': round(percentage, 1),
            'alert': alert,
            'month': month,
            'year': year,
        })

    return Response(result)
