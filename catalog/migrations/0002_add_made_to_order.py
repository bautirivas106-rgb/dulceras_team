from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('catalog', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='made_to_order',
            field=models.BooleanField(
                default=True,
                help_text='Si está activo, se fabrica bajo pedido (sin control de stock). '
                          'Si está desactivado, requiere stock disponible para poder ordenarse.',
            ),
        ),
    ]
