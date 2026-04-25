from django.db import models
from django.contrib.auth.models import User

class SavingsGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    name = models.CharField(max_length=255)
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    deadline = models.DateField(null=True, blank=True)
    daily_saving_target = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    current_saved = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - ₹{self.target_amount}"

class SavingsLog(models.Model):
    """Tracks daily contributions and gaps for a specific goal."""
    goal = models.ForeignKey(SavingsGoal, on_delete=models.CASCADE, related_name='logs')
    date = models.DateField()
    amount_saved = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    daily_expense = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    gap = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    class Meta:
        unique_together = ['goal', 'date']
        ordering = ['-date']

    def __str__(self):
        return f"{self.goal.name} Log - {self.date}"
