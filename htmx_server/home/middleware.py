from django.template.loader import render_to_string
from django.http import HttpResponse


class HtmxBaseMiddleware:
    """
    Wraps HTML fragment responses in base.html for direct (non-HTMX) page requests.
    HTMX requests get the raw fragment as usual.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if self._should_wrap(request, response):
            content = response.content.decode('utf-8')
            full_page = render_to_string(
                'base_with_content.html',
                {'content': content},
                request=request,
            )
            return HttpResponse(full_page, content_type='text/html; charset=utf-8')

        return response

    @staticmethod
    def _should_wrap(request, response):
        if request.method != 'GET':
            return False
        if request.headers.get('HX-Request'):
            return False
        if response.status_code != 200:
            return False
        if 'text/html' not in response.get('Content-Type', ''):
            return False
        # Skip already-complete pages (login, signup, print, PDF, admin, etc.)
        preview = response.content[:400].decode('utf-8', errors='ignore')
        if '<!DOCTYPE' in preview or '<html' in preview:
            return False
        return True
