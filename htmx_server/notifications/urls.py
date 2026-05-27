from django.urls import path
from . import views

urlpatterns = [
    path('notifications/',                   views.notification_list,  name='notification_list'),
    path('notifications/badge/',             views.notification_badge, name='notification_badge'),
    path('notifications/mark-all-read/',     views.mark_all_read,      name='mark_all_read'),
    path('notifications/<int:pk>/mark-read/', views.mark_read,          name='mark_read'),
]
