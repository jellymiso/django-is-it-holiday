from django import template
from datetime import datetime, timedelta
from django.utils.dateformat import format

register = template.Library()

def ordinal(n: int) -> str:
    return f"{n:d}{'tsnrhtdd'[(n//10%10!=1)*(n%10<4)*n%10::4]}"

@register.simple_tag
def daysFromNow(dateFormat, days_from_now = 0):
    newDay = datetime.now() + timedelta(days_from_now)
    return format(newDay, dateFormat)