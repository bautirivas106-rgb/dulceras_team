"""Template views for server-rendered pages."""
from django.shortcuts import render

TENANT_SLUG = 'dulceras-team'


def _get_tenant():
    from tenants.models import Tenant
    return Tenant.objects.filter(slug=TENANT_SLUG, is_active=True).first()


# ── Public ─────────────────────────────────────────────────────────────────────

def landing(request):
    tenant = _get_tenant()
    products, reviews = [], []
    if tenant:
        from catalog.models import Product
        from customers.models import Review
        raw = list(
            Product.objects
            .filter(tenant=tenant, is_active=True)
            .select_related('category')
            .prefetch_related('variants')
            .order_by('sort_order', 'name')[:9]
        )
        for p in raw:
            prices = [float(v.price) for v in p.variants.all() if v.is_active and float(v.price) > 0]
            p.min_price = min(prices) if prices else None
        products = raw
        reviews = list(Review.objects.filter(tenant=tenant, is_approved=True)[:12])
    return render(request, 'landing/home.html', {'products': products, 'reviews': reviews})


def catalog(request):
    tenant = _get_tenant()
    categories, products = [], []
    if tenant:
        from catalog.models import Category, Product
        categories = list(Category.objects.filter(tenant=tenant, is_active=True).order_by('name'))
        raw = list(
            Product.objects
            .filter(tenant=tenant, is_active=True)
            .select_related('category')
            .prefetch_related('variants')
            .order_by('sort_order', 'name')
        )
        for p in raw:
            active_variants = [v for v in p.variants.all() if v.is_active]
            prices = [float(v.price) for v in active_variants if float(v.price) > 0]
            p.min_price = min(prices) if prices else None
            p.active_variants = active_variants
        products = raw
    return render(request, 'catalog/catalog.html', {
        'categories': categories,
        'products': products,
    })


def checkout(request):
    return render(request, 'checkout/checkout.html')


def register_tenant(request):
    return render(request, 'register/register.html')


# ── Customer account ───────────────────────────────────────────────────────────

def cuenta_login(request):
    return render(request, 'cuenta/login.html', {'tenant_slug': TENANT_SLUG})


def cuenta_registro(request):
    return render(request, 'cuenta/registro.html', {'tenant_slug': TENANT_SLUG})


def cuenta_pedidos(request):
    return render(request, 'cuenta/orders.html', {'tenant_slug': TENANT_SLUG})


# ── Admin panel (tenant admin / staff) ────────────────────────────────────────

def admin_login(request):
    return render(request, 'admin_panel/login.html')


def admin_dashboard(request):
    return render(request, 'admin_panel/dashboard.html')


def admin_orders(request):
    return render(request, 'admin_panel/orders.html')


def admin_order_detail(request, order_id):
    return render(request, 'admin_panel/order_detail.html', {'order_id': order_id})


def admin_customers(request):
    return render(request, 'admin_panel/customers.html')


def admin_catalog(request):
    return render(request, 'admin_panel/catalog.html')


def admin_calendar(request):
    return render(request, 'admin_panel/calendar.html')


def admin_reports(request):
    return render(request, 'admin_panel/reports.html')


def admin_settings(request):
    return render(request, 'admin_panel/settings.html')


def admin_billing(request):
    return render(request, 'admin_panel/billing.html')


def admin_coupons(request):
    return render(request, 'admin_panel/coupons.html')


# ── Superadmin ─────────────────────────────────────────────────────────────────

def superadmin_metrics(request):
    return render(request, 'superadmin/metrics.html')


def superadmin_tenants(request):
    return render(request, 'superadmin/tenants.html')


def superadmin_tenant_detail(request, tenant_id):
    return render(request, 'superadmin/tenant_detail.html', {'tenant_id': tenant_id})


def superadmin_plans(request):
    return render(request, 'superadmin/plans.html')
