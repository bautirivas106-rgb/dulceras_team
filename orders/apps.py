import threading
from django.apps import AppConfig


class OrdersConfig(AppConfig):
    name = 'orders'

    def ready(self):
        _schedule_cleanup()


def _cleanup_job():
    try:
        from django.utils import timezone
        from datetime import timedelta
        from orders.models import Order
        from payments.models import PaymentIntent

        cutoff = timezone.now() - timedelta(hours=48)
        qs = Order.objects.filter(
            status__in=[Order.CANCELLED, Order.DELIVERED],
            updated_at__lt=cutoff,
        )
        count = qs.count()
        if count:
            PaymentIntent.objects.filter(order__in=qs).delete()
            qs.delete()
            print(f'[cleanup] {count} pedido(s) eliminado(s) automáticamente.')
    except Exception as e:
        print(f'[cleanup] Error: {e}')
    finally:
        _schedule_cleanup()


def _schedule_cleanup():
    t = threading.Timer(3600, _cleanup_job)  # corre cada 1 hora
    t.daemon = True
    t.start()
