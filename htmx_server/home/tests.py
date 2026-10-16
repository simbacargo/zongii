from datetime import date
from unittest.mock import patch

from django.contrib.auth.tokens import default_token_generator
from django.test import SimpleTestCase
from django.urls import URLPattern, URLResolver, get_resolver, reverse
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from authentication.models import User
from .models import Customer, Document, GatePass, Product, SaleOrder, SaleStatusHistory


# Every routed application view must have a resource counterpart. Multiple web
# screens (forms, fragments, confirmations) can use the same resource endpoint.
WEB_API_COUNTERPARTS = {
    'category_list': 'api-category-list',
    'category_create': 'api-category-list',
    'category_update': 'api-category-detail',
    'category_delete': 'api-category-detail',
    'business_list': 'api-business-list',
    'business_detail': 'api-business-detail',
    'business_create': 'api-business-list',
    'business_update': 'api-business-detail',
    'business_delete': 'api-business-detail',
    'product_list': 'api-product-list',
    'product_detail': 'api-product-detail',
    'product_create': 'api-product-list',
    'product_update': 'api-product-detail',
    'product_delete': 'api-product-detail',
    'customer_list': 'api-customer-list',
    'customer_detail': 'api-customer-detail',
    'customer_create': 'api-customer-list',
    'customer_update': 'api-customer-detail',
    'customer_delete': 'api-customer-detail',
    'customer_pay_balance': 'api-customer-pay',
    'customer_search': 'api-customer-list',
    'customer_quick_create': 'api-customer-list',
    'sale_list': 'api-sale-list',
    'sales_list': 'api-sale-list',
    'sale_detail': 'api-sale-detail',
    'sale_create': 'api-sale-list',
    'sale_create_htmx': 'api-sale-list',
    'sale_update': 'api-sale-detail',
    'sale_delete': 'api-sale-detail',
    'sale_approve': 'api-sale-approve',
    'sale_reject': 'api-sale-reject',
    'product_sell': 'api-sale-list',
    'checkout_submit': 'api-order-list',
    'checkout_product_search': 'api-product-list',
    'document_list': 'api-document-list',
    'document_create': 'api-document-list',
    'document_detail': 'api-document-detail',
    'document_status': 'api-document-status',
    'document_delete': 'api-document-detail',
    'document_pdf': 'api-document-pdf',
    'document_product_search': 'api-product-list',
    'dashboard': 'api-dashboard',
    'sale_order_list': 'api-order-list',
    'sale_order_detail': 'api-order-detail',
    'sale_order_accountant_review': 'api-order-accountant-review',
    'sale_order_verify': 'api-order-verify',
    'dispatch_order': 'api-order-dispatch',
    'picker_dashboard': 'api-picking-list',
    'picking_detail': 'api-picking-detail',
    'picking_accept': 'api-picking-accept',
    'picking_save': 'api-picking-submit',
    'gate_pass_detail': 'api-gatepass-detail',
    'gate_pass_print': 'api-gatepass-print',
    'stock_refill': 'api-stock-refill',
    'user_list': 'api-user-list',
    'user_create': 'api-user-list',
    'user_detail': 'api-user-detail',
    'user_update': 'api-user-detail',
    'user_toggle_active': 'api-user-toggle',
    'user_delete': 'api-user-detail',
    'signup': 'api-signup',
    'activate': 'api-activate',
    'login': 'api-token-obtain',
    'notification_list': 'api-notification-list',
    'notification_badge': 'api-notification-list',
    'mark_read': 'api-notification-read',
    'mark_all_read': 'api-notification-mark-all',
}

CLIENT_SIDE_VIEWS = {
    'manage_cart': 'Keep cart locally; POST items to api-order-list at checkout.',
    'document_item_row': 'Render a row locally; POST items to api-document-list.',
    'logout': 'Discard access/refresh tokens locally (JWT is stateless).',
}


class ApiCoverageTests(SimpleTestCase):
    def test_every_application_route_is_accounted_for(self):
        web_names = set()
        api_routes = {}

        def collect(patterns, prefix=''):
            for pattern in patterns:
                if isinstance(pattern, URLResolver):
                    # Framework admin and translation routes are not app views.
                    if pattern.app_name == 'admin' or str(pattern.pattern) == 'i18n/':
                        continue
                    collect(pattern.url_patterns, prefix + str(pattern.pattern))
                elif isinstance(pattern, URLPattern) and pattern.name:
                    if (prefix + str(pattern.pattern)).startswith('api/'):
                        api_routes[pattern.name] = pattern.callback
                    elif pattern.callback.__module__.startswith(('home.', 'authentication.', 'notifications.')) or pattern.name == 'login':
                        web_names.add(pattern.name)

        collect(get_resolver().url_patterns)
        accounted = set(WEB_API_COUNTERPARTS) | set(CLIENT_SIDE_VIEWS)
        self.assertEqual(web_names, accounted)
        for web_name, api_name in WEB_API_COUNTERPARTS.items():
            with self.subTest(view=web_name):
                self.assertIn(api_name, api_routes)
                self.assertTrue(hasattr(api_routes[api_name], 'cls'))


class ApiCounterpartTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='api-tester', password='test-pass-357!', email='tester@example.org',
        )

    def authenticate(self):
        token = RefreshToken.for_user(self.user).access_token
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')

    def test_signup_validates_and_cannot_grant_roles(self):
        payload = {
            'firstname': 'Test', 'lastname': 'Person', 'username': 'newperson',
            'email': 'new@example.org', 'password1': 'Strong-test-pass-357!',
            'password2': 'different', 'is_admin': True, 'is_superuser': True,
        }
        response = self.client.post(reverse('api-signup'), payload, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(username='newperson').exists())
        payload['password2'] = payload['password1']
        response = self.client.post(reverse('api-signup'), payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        user = User.objects.get(username='newperson')
        self.assertTrue(user.check_password(payload['password1']))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_admin or user.is_superuser or user.is_staff)
        self.assertNotIn('password', response.data)
        response = self.client.post(reverse('api-signup'), payload, format='json')
        self.assertEqual(response.status_code, 400)

    def test_activation_requires_valid_signed_token(self):
        self.user.is_active = False
        self.user.save(update_fields=['is_active'])
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))
        url = reverse('api-activate')
        for data in ({}, {'uid': 'invalid', 'token': 'invalid'}, {'uid': uid, 'token': 'invalid'}):
            self.assertEqual(self.client.post(url, data, format='json').status_code, 400)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)
        token = default_token_generator.make_token(self.user)
        response = self.client.post(url, {'uid': uid, 'token': token}, format='json')
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)

    def test_exports_require_jwt_and_missing_resources_return_404(self):
        for route in ('api-document-pdf', 'api-gatepass-print'):
            url = reverse(route, kwargs={'pk': 99999})
            self.assertEqual(self.client.get(url).status_code, 401)
            self.authenticate()
            self.assertEqual(self.client.get(url).status_code, 404)
            self.client.credentials()

    def test_document_pdf_download(self):
        customer = Customer.objects.create(name='PDF Customer')
        doc = Document.objects.create(customer=customer, issue_date=date.today())
        self.authenticate()
        # Exercise real template rendering and response headers without relying
        # on platform font/rendering libraries for this HTTP contract test.
        with patch('weasyprint.HTML') as html:
            html.return_value.write_pdf.return_value = b'%PDF-test'
            response = self.client.get(reverse('api-document-pdf', kwargs={'pk': doc.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn(doc.number, response['Content-Disposition'])
        self.assertEqual(response.content, b'%PDF-test')

    def test_gate_pass_print(self):
        order = SaleOrder.objects.create(created_by=self.user)
        gp = GatePass.objects.create(sale_order=order)
        self.authenticate()
        response = self.client.get(reverse('api-gatepass-print', kwargs={'pk': gp.pk}))
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, gp.gp_code)
        self.assertTrue(response['Content-Type'].startswith('text/html'))

    def test_product_search_covers_supplier_and_description(self):
        product = Product.objects.create(
            name='Special hammer', brand='Tools', part_number='HAM-1',
            supplier='UniqueVendor', description='Tungsten tipped',
        )
        for query in ('UniqueVendor', 'tungsten', 'UniqueVendor hammer'):
            response = self.client.get(reverse('api-product-list'), {'q': query})
            self.assertEqual(response.status_code, 200)
            self.assertEqual([row['id'] for row in response.data], [product.pk])

    def test_checkout_validates_before_creating_any_records(self):
        product = Product.objects.create(
            name='Checkout hammer', quantity_at_hand=4, min_price=10, max_price=20,
        )
        self.authenticate()
        url = reverse('api-order-list')
        valid_item = {'product': product.pk, 'quantity_sold': 2, 'price_per_unit': '15.00'}
        invalid_payloads = [
            {}, {'items': []}, {'items': ['invalid']},
            {'items': [{**valid_item, 'quantity_sold': 'abc'}]},
            {'items': [{**valid_item, 'price_per_unit': 'NaN'}]},
            {'items': [{**valid_item, 'product': 999999}]},
            {'items': [{**valid_item, 'quantity_sold': 5}]},
            {'items': [{**valid_item, 'price_per_unit': '9.00'}]},
            {'items': [{**valid_item, 'price_per_unit': '21.00'}]},
            {'items': [valid_item, valid_item, valid_item]},
            {'items': [valid_item], 'customer': 999999},
        ]
        for payload in invalid_payloads:
            with self.subTest(payload=payload):
                response = self.client.post(url, payload, format='json')
                self.assertEqual(response.status_code, 400, response.data)
                self.assertFalse(SaleOrder.objects.exists())
        with self.captureOnCommitCallbacks(execute=True), patch('notifications.utils.notify_accountants') as notify:
            response = self.client.post(url, {'items': [valid_item]}, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        order = SaleOrder.objects.get()
        self.assertEqual(order.sales.count(), 1)
        self.assertTrue(SaleStatusHistory.objects.filter(
            sale_order=order, from_status='', to_status=SaleOrder.PENDING_APPROVAL,
        ).exists())
        notify.assert_called_once()
        product.refresh_from_db()
        self.assertEqual(product.quantity_at_hand, 4)

    def test_resource_collections_are_accessible(self):
        self.user.is_admin = True
        self.user.save(update_fields=['is_admin'])
        self.authenticate()
        routes = [
            'api-profile', 'api-dashboard', 'api-category-list', 'api-product-list',
            'api-product-low-stock', 'api-customer-list', 'api-customer-debtors',
            'api-sale-list', 'api-business-list', 'api-order-list', 'api-order-stats',
            'api-document-list', 'api-picking-list', 'api-gatepass-list',
            'api-notification-list', 'api-user-list',
        ]
        for route in routes:
            with self.subTest(route=route):
                self.assertEqual(self.client.get(reverse(route)).status_code, 200)
