from django import template

register = template.Library()


@register.filter
def tzs(value):
    try:
        v = float(value)
    except (TypeError, ValueError):
        return value
    if v >= 1_000_000:
        formatted = f"{v / 1_000_000:.1f}".rstrip('0').rstrip('.')
        return f"TZS {formatted}M"
    if v >= 1_000:
        formatted = f"{v / 1_000:.1f}".rstrip('0').rstrip('.')
        return f"TZS {formatted}K"
    return f"TZS {v:,.0f}"
