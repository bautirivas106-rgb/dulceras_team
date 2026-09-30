from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from orders.models import Order


class Command(BaseCommand):
    help = 'Borra pedidos cancelados o entregados con más de 48 horas de antigüedad.'

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(hours=48)
        qs = Order.objects.filter(
            status__in=[Order.CANCELLED, Order.DELIVERED],
            updated_at__lt=cutoff,
        )
        count = qs.count()
        qs.delete()
        self.stdout.write(self.style.SUCCESS(f'Eliminados {count} pedidos viejos.'))
