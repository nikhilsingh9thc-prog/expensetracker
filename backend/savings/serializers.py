from rest_framework import serializers
from .models import SavingsGoal, SavingsLog

class SavingsLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavingsLog
        fields = '__all__'

class SavingsGoalSerializer(serializers.ModelSerializer):
    logs = SavingsLogSerializer(many=True, read_only=True)
    remaining_amount = serializers.SerializerMethodField()
    gap_info = serializers.SerializerMethodField()

    class Meta:
        model = SavingsGoal
        fields = [
            'id', 'user', 'name', 'target_amount', 'deadline', 
            'daily_saving_target', 'current_saved', 'is_completed', 
            'created_at', 'updated_at', 'remaining_amount', 'gap_info', 'logs'
        ]
        read_only_fields = ['user', 'current_saved', 'is_completed']

    def get_remaining_amount(self, obj):
        return obj.target_amount - obj.current_saved

    def get_gap_info(self, obj):
        # Calculate total gap from logs
        total_gap = sum(log.gap for log in obj.logs.all())
        if total_gap <= 0:
            return {"has_gap": False, "total_gap": 0}
        
        # Gap recovery logic
        # Option A: Extra days needed if we stick to daily target
        extra_days = 0
        if obj.daily_saving_target and obj.daily_saving_target > 0:
            extra_days = float(total_gap / obj.daily_saving_target)
        
        # Option B: Extra per day for next 10 days (example)
        extra_per_day = float(total_gap / 10)
        
        return {
            "has_gap": True,
            "total_gap": float(total_gap),
            "extra_days_needed": round(extra_days, 1),
            "recovery_suggestion": f"Save ₹{round(extra_per_day, 2)} extra daily for 10 days to recover."
        }
