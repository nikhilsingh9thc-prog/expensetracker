"""money_mgmt URL Configuration"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse, JsonResponse
from django.conf import settings
from django.db import connection
import os


def health_check(request):
    """
    Health-check endpoint used by Render and UptimeRobot to keep the
    service warm. Also verifies the DB connection is alive.
    """
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False

    status = 200 if db_ok else 503
    return JsonResponse({'status': 'ok' if db_ok else 'db_error', 'db': db_ok}, status=status)


def spa_view(request):
    """Serve the React SPA index.html for all non-API routes."""
    index_path = os.path.join(settings.FRONTEND_BUILD_DIR, 'index.html')
    if not os.path.exists(index_path):
        return HttpResponse(
            "<h1>Frontend Not Built</h1>"
            "<p>The React frontend has not been built yet. "
            "Check your Render build logs.</p>"
            f"<p>Expected: <code>{index_path}</code></p>",
            status=503,
            content_type='text/html',
        )
    with open(index_path, 'rb') as f:
        return HttpResponse(f.read(), content_type='text/html')


urlpatterns = [
    path('admin/', admin.site.urls),
    # Health check — used by Render & UptimeRobot to keep server warm
    path('health/', health_check),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('transactions.urls')),
    path('api/', include('budgets.urls')),
    path('api/', include('analytics.urls')),
    path('api/', include('helpdesk.urls')),
    # Serve React SPA for all frontend routes
    path('', spa_view),
    re_path(r'^(?!api/|admin/|static/|health/)(?P<path>.+)$', spa_view),
]
