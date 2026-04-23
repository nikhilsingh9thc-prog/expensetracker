from django.db.models import Sum, Count
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from transactions.models import Transaction


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def financial_summary(request):
    """Monthly/yearly summary of income, expenses, and balance."""
    now = timezone.now()
    month = int(request.query_params.get('month', now.month))
    year = int(request.query_params.get('year', now.year))
    
    base_qs = Transaction.objects.filter(user=request.user)

    # Monthly summary
    monthly_qs = base_qs.filter(date__month=month, date__year=year)
    monthly_income = monthly_qs.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
    monthly_expense = monthly_qs.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0

    # Yearly summary
    yearly_qs = base_qs.filter(date__year=year)
    yearly_income = yearly_qs.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
    yearly_expense = yearly_qs.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0

    # All-time balance
    total_income = base_qs.filter(type='income').aggregate(total=Sum('amount'))['total'] or 0
    total_expense = base_qs.filter(type='expense').aggregate(total=Sum('amount'))['total'] or 0

    return Response({
        'month': month,
        'year': year,
        'monthly': {
            'income': float(monthly_income),
            'expense': float(monthly_expense),
            'balance': float(monthly_income - monthly_expense),
        },
        'yearly': {
            'income': float(yearly_income),
            'expense': float(yearly_expense),
            'balance': float(yearly_income - yearly_expense),
        },
        'all_time': {
            'income': float(total_income),
            'expense': float(total_expense),
            'balance': float(total_income - total_expense),
        },
        'transaction_count': base_qs.count(),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def category_breakdown(request):
    """Expense breakdown by category for a given month/year."""
    now = timezone.now()
    month = int(request.query_params.get('month', now.month))
    year = int(request.query_params.get('year', now.year))

    breakdown = (
        Transaction.objects.filter(
            user=request.user,
            type='expense',
            date__month=month,
            date__year=year,
        )
        .values('category__id', 'category__name', 'category__icon')
        .annotate(total=Sum('amount'), count=Count('id'))
        .order_by('-total')
    )

    result = []
    for item in breakdown:
        result.append({
            'category_id': item['category__id'],
            'category_name': item['category__name'] or 'Uncategorized',
            'category_icon': item['category__icon'] or '📁',
            'total': float(item['total']),
            'count': item['count'],
        })

    return Response(result)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spending_trends(request):
    """Monthly income and expense trends over the last 12 months."""
    now = timezone.now()
    months_back = int(request.query_params.get('months', 12))

    trends = (
        Transaction.objects.filter(user=request.user)
        .annotate(month_trunc=TruncMonth('date'))
        .values('month_trunc', 'type')
        .annotate(total=Sum('amount'))
        .order_by('month_trunc')
    )

    # Organize into monthly buckets
    monthly_data = {}
    for item in trends:
        month_key = item['month_trunc'].strftime('%Y-%m')
        if month_key not in monthly_data:
            monthly_data[month_key] = {'month': month_key, 'income': 0, 'expense': 0}
        monthly_data[month_key][item['type']] = float(item['total'])

    # Sort and limit
    sorted_data = sorted(monthly_data.values(), key=lambda x: x['month'])
    return Response(sorted_data[-months_back:])
