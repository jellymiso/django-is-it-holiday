import multiprocessing
from django.conf import settings

bind = "0.0.0.0:"+ settings.RUN_SERVER_PORT 
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "gthread"
threads = 2
timeout = 60