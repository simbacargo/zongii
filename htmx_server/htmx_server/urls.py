
from django.contrib import admin
from django.urls import include, path
from home.urls import urlpatterns as home_urlpatterns
from home.api_urls import urlpatterns as api_urlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(api_urlpatterns)),
    path('', include(home_urlpatterns)),
]

from django.conf import settings
from django.views.static import serve
from django.urls import re_path

urlpatterns += [
    re_path(r'^inventory/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
]
