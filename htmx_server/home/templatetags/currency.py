from django import template

register = template.Library()


@register.filter
def tzs(value):
    try:
        v = float(value)
    except (TypeError, ValueError):
        return value
    return f"TZS {v:,.0f}"
