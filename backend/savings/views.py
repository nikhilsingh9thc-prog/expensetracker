from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SavingsGoal, SavingsLog
from .serializers import SavingsGoalSerializer, SavingsLogSerializer
from transactions.models import Transaction
from django.db.models import Sum
from datetime import date

class SavingsGoalViewSet(viewsets.ModelViewSet):
    serializer_class = SavingsGoalSerializer

    def get_queryset(self):
        return SavingsGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def log_progress(self, request, pk=None):
        """
        Logs daily progress. 
        Input: {'amount_saved': 500, 'extra_spending': 200}
        """
        goal = self.get_object()
        amount_saved = request.data.get('amount_saved', 0)
        extra_spending = request.data.get('extra_spending', 0)
        log_date = request.data.get('date', date.today().isoformat())

        # Calculate daily expense from transactions for that date
        daily_expense = Transaction.objects.filter(
            user=request.user, 
            date=log_date, 
            type='expense'
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        log, created = SavingsLog.objects.update_or_create(
            goal=goal,
            date=log_date,
            defaults={
                'amount_saved': amount_saved,
                'daily_expense': daily_expense,
                'gap': extra_spending
            }
        )

        # Update current_saved in goal
        total_saved = goal.logs.aggregate(Sum('amount_saved'))['amount_saved__sum'] or 0
        goal.current_saved = total_saved
        if goal.current_saved >= goal.target_amount:
            goal.is_completed = True
        else:
            goal.is_completed = False
        goal.save()

        return Response(SavingsGoalSerializer(goal).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        goals = self.get_queryset()
        total_target = goals.aggregate(Sum('target_amount'))['target_amount__sum'] or 0
        total_saved = goals.aggregate(Sum('current_saved'))['current_saved__sum'] or 0
        
        return Response({
            "total_target": total_target,
            "total_saved": total_saved,
            "active_goals": goals.filter(is_completed=False).count(),
            "completed_goals": goals.filter(is_completed=True).count(),
        })
