from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from .models import Notification


@login_required
def notification_list(request):
    notifs = Notification.objects.filter(recipient=request.user)
    return render(request, 'notifications.html', {'notifications': notifs})


@login_required
def notification_badge(request):
    """Returns just the badge span — polled by the sidebar every 60 s."""
    count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    return render(request, 'partials/notification_badge.html', {'count': count})


@login_required
@require_POST
def mark_read(request, pk):
    notif = get_object_or_404(Notification, pk=pk, recipient=request.user)
    notif.is_read = True
    notif.save(update_fields=['is_read'])
    next_url = request.POST.get('next') or 'notification_list'
    if next_url.startswith('/'):
        return redirect(next_url)
    return redirect(next_url)


@login_required
@require_POST
def mark_all_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    messages.success(request, "All notifications marked as read.")
    return redirect('notification_list')
