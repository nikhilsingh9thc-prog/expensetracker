from django.db import models
from django.contrib.auth.models import User
from transactions.models import Category


class Budget(models.Model):
    """Monthly budget limit for a specific category."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    month = models.IntegerField()  # 1-12
    year = models.IntegerField()
    limit_amount = models.DecimalField(max_digits=12, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'category', 'month', 'year']
        ordering = ['-year', '-month']

    def __str__(self):
        return f"Budget: {self.category.name} - {self.month}/{self.year} - ₹{self.limit_amount}"
