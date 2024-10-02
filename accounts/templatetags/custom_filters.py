from django import template
from django.forms import BoundField

register = template.Library()

@register.filter(name='add_class')
def add_class(field, css_class):
    # Ensure the object is a form field before attempting to modify it
    if isinstance(field, BoundField):
        return field.as_widget(attrs={"class": css_class})
    return field  # If it's not a form field, just return it unchanged
