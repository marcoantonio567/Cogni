import os

from django.core.exceptions import ImproperlyConfigured

from .base import *

DEBUG = False


def env_list(name):
    return [
        value.strip()
        for value in os.environ.get(name, '').split(',')
        if value.strip()
    ]


def env_origin_from_host(name):
    value = os.environ.get(name, '').strip()
    if not value:
        return ''
    if value.startswith(('http://', 'https://')):
        return value
    return f'https://{value}'


SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY')
if not SECRET_KEY:
    raise ImproperlyConfigured('DJANGO_SECRET_KEY deve ser definida em producao.')

ALLOWED_HOSTS = [
    *env_list('DJANGO_ALLOWED_HOSTS'),
    *env_list('VERCEL_URL'),
]
if not ALLOWED_HOSTS:
    raise ImproperlyConfigured('DJANGO_ALLOWED_HOSTS deve ser definida em producao.')

VERCEL_ORIGIN = env_origin_from_host('VERCEL_URL')

CORS_ALLOWED_ORIGINS = [
    *env_list('DJANGO_CORS_ALLOWED_ORIGINS'),
    *([VERCEL_ORIGIN] if VERCEL_ORIGIN else []),
]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [
    *env_list('DJANGO_CSRF_TRUSTED_ORIGINS'),
    *([VERCEL_ORIGIN] if VERCEL_ORIGIN else []),
]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SAMESITE = 'None'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
