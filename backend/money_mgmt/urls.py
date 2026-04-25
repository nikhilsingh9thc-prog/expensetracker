"""money_mgmt URL Configuration"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.conf import settings
from django.db import connection
import os


def health_check(request):
    """
    Health-check endpoint — used by Render & UptimeRobot to keep server warm.
    Returns 200 if DB is reachable, 503 otherwise.
    """
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        db_ok = False

    code = 200 if db_ok else 503
    return JsonResponse({'status': 'ok' if db_ok else 'db_error', 'db': db_ok}, status=code)


def favicon_view(request):
    """Return 204 No Content for favicon.ico so browsers don't get a 500."""
    return HttpResponse(status=204)


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
    try:
        with open(index_path, 'rb') as f:
            content = f.read()
        return HttpResponse(content, content_type='text/html; charset=utf-8')
    except OSError as e:
        return HttpResponse(
            f"<h1>Error reading frontend</h1><p>{e}</p>",
            status=503,
            content_type='text/html',
        )


urlpatterns = [
    path('admin/', admin.site.urls),
    # Health check — keeps server warm
    path('health/', health_check),
    # Prevent 500 on missing favicon/icon requests
    path('favicon.ico', favicon_view),
    path('favicon.svg', favicon_view),
    path('vite.svg', favicon_view),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('transactions.urls')),
    path('api/', include('budgets.urls')),
    path('api/', include('analytics.urls')),
    path('api/', include('helpdesk.urls')),
    path('api/', include('savings.urls')),
    # Serve React SPA for all frontend routes
    path('', spa_view),
    re_path(r'^(?!api/|admin/|static/|health/)(?P<path>.+)$', spa_view),
]
