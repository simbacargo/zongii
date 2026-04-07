
from django.contrib import admin
from django.urls import include, path
from home.urls import urlpatterns as home_urlpatterns
urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include(home_urlpatterns)),
    
]

from django.conf import settings
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
