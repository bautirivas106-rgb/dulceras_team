from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from django.utils import timezone
from datetime import timedelta
from tenants.models import Plan, Subscription, Tenant, BusinessProfile, DeliveryZone
from catalog.models import Category, Product, ProductVariant

User = get_user_model()


TENANT_SLUG = 'dulceras-team'

CATEGORIES = [
    {'name': 'Cookies estilo NY',   'slug': 'cookies-ny',         'description': 'Cookies gigantes con chips de chocolate, estilo Nueva York.'},
    {'name': 'Budines',             'slug': 'budines',             'description': 'Budines húmedos y esponjosos en distintos sabores.'},
    {'name': 'Tortas enteras',      'slug': 'tortas',              'description': 'Tortas completas para celebrar o darte un gusto enorme.'},
    {'name': 'Postres bajoneros',   'slug': 'postres-bajoneros',   'description': 'Postres cremosos para los momentos que piden algo especial.'},
    {'name': 'Brownie Box',         'slug': 'brownie-box',         'description': 'Brownies fudgy, densos y con costra crujiente.'},
    {'name': 'Chipá',               'slug': 'chipa',               'description': 'Chipá esponjoso, recién horneado, perfecto para cualquier hora.'},
]

PRODUCTS = [
    {
        'category_slug': 'cookies-ny',
        'name': 'Cookie Chocolate Chips',
        'description': 'Cookie enorme estilo NY con chips de chocolate belga. Crocante por fuera, suave y melosa por dentro.',
        'requires_advance_hours': 48,
        'variants': [
            {'name': 'Unidad',   'price': Decimal('850')},
            {'name': 'Caja x4', 'price': Decimal('3000')},
            {'name': 'Caja x6', 'price': Decimal('4300')},
        ],
    },
    {
        'category_slug': 'cookies-ny',
        'name': 'Cookie Doble Chocolate',
        'description': 'Masa de cacao con chips de chocolate blanco y negro. Intensidad pura.',
        'requires_advance_hours': 48,
        'variants': [
            {'name': 'Unidad',   'price': Decimal('900')},
            {'name': 'Caja x4', 'price': Decimal('3200')},
            {'name': 'Caja x6', 'price': Decimal('4600')},
        ],
    },
    {
        'category_slug': 'budines',
        'name': 'Budín de Limón',
        'description': 'Budín húmedo con glaseado de limón. Fresco, liviano y adictivo.',
        'requires_advance_hours': 48,
        'variants': [
            {'name': 'Pequeño (6 porciones)',  'price': Decimal('3800')},
            {'name': 'Grande (12 porciones)', 'price': Decimal('6500')},
        ],
    },
    {
        'category_slug': 'budines',
        'name': 'Budín de Banana y Nuez',
        'description': 'El clásico reconfortante con banana madura, nueces tostadas y canela.',
        'requires_advance_hours': 48,
        'variants': [
            {'name': 'Pequeño (6 porciones)',  'price': Decimal('4000')},
            {'name': 'Grande (12 porciones)', 'price': Decimal('7000')},
        ],
    },
    {
        'category_slug': 'tortas',
        'name': 'Torta de Chocolate',
        'description': 'Torta húmeda de chocolate con ganache y decoración artesanal. El postre que todos piden.',
        'requires_advance_hours': 72,
        'variants': [
            {'name': '1/4 (4-6 porciones)',    'price': Decimal('9000')},
            {'name': '1/2 (8-10 porciones)',   'price': Decimal('16000')},
            {'name': 'Entera (16-20 porciones)', 'price': Decimal('28000')},
        ],
    },
    {
        'category_slug': 'tortas',
        'name': 'Torta de Vainilla y Frutos Rojos',
        'description': 'Bizcochuelo de vainilla con crema y coulis de frutos rojos frescos.',
        'requires_advance_hours': 72,
        'variants': [
            {'name': '1/4 (4-6 porciones)',    'price': Decimal('9500')},
            {'name': '1/2 (8-10 porciones)',   'price': Decimal('17000')},
            {'name': 'Entera (16-20 porciones)', 'price': Decimal('30000')},
        ],
    },
    {
        'category_slug': 'postres-bajoneros',
        'name': 'Cheesecake de Dulce de Leche',
        'description': 'Base de galletitas, relleno cremoso y cobertura de dulce de leche repostero.',
        'requires_advance_hours': 48,
        'variants': [
            {'name': 'Porción individual', 'price': Decimal('1400')},
            {'name': 'Caja x4 porciones', 'price': Decimal('5200')},
        ],
    },
    {
        'category_slug': 'postres-bajoneros',
        'name': 'Tiramisú',
        'description': 'El clásico italiano con mascarpone, café y cacao amargo. Suave y reconfortante.',
        'requires_advance_hours': 48,
        'variants': [
            {'name': 'Porción individual', 'price': Decimal('1500')},
            {'name': 'Caja x4 porciones', 'price': Decimal('5500')},
        ],
    },
    {
        'category_slug': 'brownie-box',
        'name': 'Brownie Clásico',
        'description': 'Brownie fudgy de chocolate amargo con costra crujiente. El favorito de todos.',
        'requires_advance_hours': 48,
        'variants': [
            {'name': 'Caja x4', 'price': Decimal('3400')},
            {'name': 'Caja x6', 'price': Decimal('4800')},
        ],
    },
    {
        'category_slug': 'brownie-box',
        'name': 'Brownie con Chips de Chocolate Blanco',
        'description': 'Brownie de chocolate negro con chips de chocolate blanco. Dulce y con contraste.',
        'requires_advance_hours': 48,
        'variants': [
            {'name': 'Caja x4', 'price': Decimal('3600')},
            {'name': 'Caja x6', 'price': Decimal('5100')},
        ],
    },
    {
        'category_slug': 'chipa',
        'name': 'Chipá Tradicional',
        'description': 'Chipá esponjoso con queso, recién horneado. Crujiente por fuera y tierno por dentro.',
        'requires_advance_hours': 24,
        'variants': [
            {'name': 'Unidad',    'price': Decimal('450')},
            {'name': 'Bolsa x6', 'price': Decimal('2400')},
            {'name': 'Bolsa x12','price': Decimal('4500')},
        ],
    },
]

DELIVERY_ZONES = [
    {'name': 'Almagro',           'description': 'Envío gratuito en Almagro',            'price': Decimal('0')},
    {'name': 'CABA — Centro',     'description': 'Palermo, Recoleta, San Telmo y alrededores', 'price': Decimal('1500')},
    {'name': 'CABA — Norte',      'description': 'Belgrano, Núñez, Colegiales y alrededores',  'price': Decimal('1500')},
    {'name': 'CABA — Sur',        'description': 'Boedo, Caballito, Flores y alrededores',      'price': Decimal('1500')},
    {'name': 'CABA — Oeste',      'description': 'Villa del Parque, Devoto y alrededores',      'price': Decimal('1800')},
    {'name': 'GBA — Zona Norte',  'description': 'San Isidro, Vicente López y alrededores',     'price': Decimal('2800')},
    {'name': 'GBA — Zona Oeste',  'description': 'Morón, Ramos Mejía y alrededores',            'price': Decimal('2800')},
]


class Command(BaseCommand):
    help = 'Carga el seed data de Dulceras Team'

    def add_arguments(self, parser):
        parser.add_argument('--reset', action='store_true', help='Elimina y recrea todos los datos del tenant')
        parser.add_argument('--admin-password', default='admin1234', help='Contraseña del usuario admin (default: admin1234)')

    @transaction.atomic
    def handle(self, *args, **options):
        if options['reset']:
            Tenant.objects.filter(slug=TENANT_SLUG).delete()
            self.stdout.write(self.style.WARNING('Tenant Dulceras Team eliminado.'))

        # Plans
        PLANS = [
            {
                'slug': 'basico', 'name': 'Básico',
                'price_monthly': Decimal('0'),
                'description': 'Para empezar. Ideal para emprendimientos chicos.',
                'max_products': 10, 'max_users': 2, 'max_orders_per_day': 20,
                'has_mp_integration': False, 'has_whatsapp': False,
            },
            {
                'slug': 'pro', 'name': 'Pro',
                'price_monthly': Decimal('15000'),
                'description': 'Para negocios en crecimiento. Incluye Mercado Pago y WhatsApp.',
                'max_products': 50, 'max_users': 5, 'max_orders_per_day': 0,
                'has_mp_integration': True, 'has_whatsapp': True,
            },
            {
                'slug': 'enterprise', 'name': 'Enterprise',
                'price_monthly': Decimal('35000'),
                'description': 'Sin límites. Para negocios consolidados.',
                'max_products': 0, 'max_users': 0, 'max_orders_per_day': 0,
                'has_mp_integration': True, 'has_whatsapp': True,
            },
        ]
        for plan_data in PLANS:
            slug = plan_data.pop('slug')
            obj, created = Plan.objects.update_or_create(
                slug=slug,
                defaults=plan_data,
            )
            self.stdout.write(f"  {'+' if created else '~'} Plan: {obj.name} (${obj.price_monthly}/mes)")

        # Tenant
        pro_plan = Plan.objects.get(slug='pro')
        tenant, created = Tenant.objects.get_or_create(
            slug=TENANT_SLUG,
            defaults={'name': 'Dulceras Team', 'is_active': True, 'plan': pro_plan},
        )
        if not created and tenant.plan is None:
            tenant.plan = pro_plan
            tenant.save(update_fields=['plan'])
        self.stdout.write(f"{'Creado' if created else 'Existente'}: Tenant '{tenant.name}' (plan: {tenant.plan})")

        # Business profile
        profile, bp_created = BusinessProfile.objects.get_or_create(
            tenant=tenant,
            defaults={
                'address': 'Almagro, Ciudad Autónoma de Buenos Aires',
                'phone': '',
                'email': 'dulcerasteam@gmail.com',
                'whatsapp': '',
                'instagram': '@dulceras.team',
                'advance_hours_required': 48,
                'deposit_percentage': Decimal('50'),
                'primary_color': '#3D1A0E',
                'accent_color': '#E8889A',
                'bg_color': '#FDF6EC',
            },
        )
        if not bp_created:
            profile.primary_color = '#3D1A0E'
            profile.accent_color = '#E8889A'
            profile.bg_color = '#FDF6EC'
            profile.save(update_fields=['primary_color', 'accent_color', 'bg_color'])
        self.stdout.write(f"  {'+ ' if bp_created else '~ '}BusinessProfile")

        # Delivery zones
        for zone_data in DELIVERY_ZONES:
            obj, created = DeliveryZone.objects.get_or_create(
                tenant=tenant,
                name=zone_data['name'],
                defaults={
                    'description': zone_data['description'],
                    'price': zone_data['price'],
                    'is_active': True,
                },
            )
            self.stdout.write(f"  {'+' if created else '~'} Zona: {obj.name} (${obj.price})")

        # Categories
        category_map = {}
        for i, cat_data in enumerate(CATEGORIES):
            obj, created = Category.objects.get_or_create(
                tenant=tenant,
                slug=cat_data['slug'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'is_active': True,
                },
            )
            category_map[cat_data['slug']] = obj
            self.stdout.write(f"  {'+' if created else '~'} Categoría: {obj.name}")

        # Products & variants
        for i, prod_data in enumerate(PRODUCTS):
            category = category_map[prod_data['category_slug']]
            product, created = Product.objects.get_or_create(
                tenant=tenant,
                name=prod_data['name'],
                defaults={
                    'category': category,
                    'description': prod_data['description'],
                    'is_active': True,
                    'requires_advance_hours': prod_data['requires_advance_hours'],
                    'sort_order': i,
                },
            )
            self.stdout.write(f"  {'+' if created else '~'} Producto: {product.name}")

            for j, var_data in enumerate(prod_data['variants']):
                variant, v_created = ProductVariant.objects.get_or_create(
                    tenant=tenant,
                    product=product,
                    name=var_data['name'],
                    defaults={
                        'price': var_data['price'],
                        'stock_quantity': 0,
                        'is_active': True,
                        'sort_order': j,
                    },
                )
                self.stdout.write(f"      {'+' if v_created else '~'} {variant.name} — ${variant.price}")

        # Admin user
        admin_password = options['admin_password']
        if not User.objects.filter(username='admin', tenant=tenant).exists():
            User.objects.create_user(
                username='admin',
                password=admin_password,
                email='dulcerasteam@gmail.com',
                tenant=tenant,
                role=User.TENANT_ADMIN,
            )
            self.stdout.write(f"  + Usuario admin (contraseña: {admin_password})")
        else:
            self.stdout.write('  ~ Usuario admin ya existe')

        # Subscription
        sub, sub_created = Subscription.objects.get_or_create(
            tenant=tenant,
            defaults={
                'plan': pro_plan,
                'status': Subscription.ACTIVE,
                'current_period_end': timezone.now() + timedelta(days=365),
            },
        )
        if not sub_created and sub.status == Subscription.TRIAL:
            sub.status = Subscription.ACTIVE
            sub.plan = pro_plan
            sub.current_period_end = timezone.now() + timedelta(days=365)
            sub.save(update_fields=['status', 'plan', 'current_period_end', 'updated_at'])
        self.stdout.write(f"  {'+ ' if sub_created else '~ '}Subscription: {sub.status}")

        self.stdout.write(self.style.SUCCESS('\nSeed de Dulceras Team completado.'))
