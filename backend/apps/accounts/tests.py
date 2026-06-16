from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase


class LoginAPITests(APITestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(
            username='marco',
            password='marco',
        )

    def test_login_com_credenciais_validas_cria_sessao(self):
        response = self.client.post(
            '/api/v1/accounts/login/',
            {'username': 'marco', 'password': 'marco'},
            format='json',
            HTTP_HOST='localhost',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'marco')
        self.assertIn('sessionid', self.client.cookies)

        me_response = self.client.get('/api/v1/accounts/me/', HTTP_HOST='localhost')

        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.data['username'], 'marco')

    def test_login_com_credenciais_invalidas_retorna_erro(self):
        response = self.client.post(
            '/api/v1/accounts/login/',
            {'username': 'marco', 'password': 'senha-errada'},
            format='json',
            HTTP_HOST='localhost',
        )

        self.assertEqual(response.status_code, 400)
