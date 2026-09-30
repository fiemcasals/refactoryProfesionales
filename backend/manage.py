#!/usr/bin/env python
"""Utilidad de línea de comandos de Django para este proyecto."""
import os
import sys


def main():
    # Por defecto, settings de desarrollo (local). Producción debe exportar
    # DJANGO_SETTINGS_MODULE=config.settings y DJANGO_SECRET_KEY.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings_dev')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError('No se pudo importar Django.') from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
