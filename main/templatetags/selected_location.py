from django import template

register = template.Library()

@register.simple_tag
def selectedLocation(location):
    finalLocation = location.capitalize()
    return finalLocation