"""money_mgmt URL Configuration"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.http import HttpResponse
from django.conf import settings
import os

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
    path('api/auth/', include('accounts.urls')),
    path('api/', include('transactions.urls')),
    path('api/', include('budgets.urls')),
    path('api/', include('analytics.urls')),
    path('api/', include('helpdesk.urls')),
    # Serve React SPA:
    # path('') handles the root URL "/"
    # re_path handles ALL other non-api/admin/static paths (login, dashboard, etc.)
    path('', spa_view),
    re_path(r'^(?!api/|admin/|static/)(?P<path>.+)$', spa_view),
]
