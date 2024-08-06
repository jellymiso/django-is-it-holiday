from django.urls import path
from . import views
from django.conf import settings


urlpatterns = [
    path('', views.home, name='Events Calendar'),
    path('chronosphere/', views.chronosphere, name='The Chronosphere') if settings.DEBUG == True else None, #for testing
    path('wormhole/', views.wormhole, name='Wormhole'), 
    path('singularity/', views.singularity, name='Singularity'), 
    path('visage/', views.visage, name='Visage'), 
    # path('chronoverse/', views.chronoverse, name='Chronoverse'), 
]

if None in urlpatterns: urlpatterns.remove(None)
