"""Tests de RF-02 (tramo backend). Una prueba por condición aplicable al backend."""
from django.test import TestCase
from django.urls import reverse

from accounts.models import User

EMAIL = 'qa@profesionales.local'
PASSWORD = 'Profesionales123'
MENSAJE_GENERICO = 'Credenciales no válidas.'


class HealthTest(TestCase):
    def test_criterio_1_salud_responde_200_sin_auth(self):
        r = self.client.get(reverse('health'))
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json(), {'status': 'ok'})


class LoginTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(email=EMAIL, password=PASSWORD)

    def test_criterio_3_valido_devuelve_token_y_email(self):
        r = self.client.post(
            reverse('login'), {'email': EMAIL, 'password': PASSWORD}, content_type='application/json'
        )
        self.assertEqual(r.status_code, 200)
        body = r.json()
        self.assertIn('token', body)
        self.assertTrue(body['token'])
        self.assertEqual(body['email'], EMAIL)

    def test_criterio_4_correo_inexistente_401_sin_token(self):
        r = self.client.post(
            reverse('login'),
            {'email': 'nadie@profesionales.local', 'password': PASSWORD},
            content_type='application/json',
        )
        self.assertEqual(r.status_code, 401)
        self.assertEqual(r.json().get('detail'), MENSAJE_GENERICO)
        self.assertNotIn('token', r.json())

    def test_criterio_4_password_mal_mismo_mensaje_que_inexistente(self):
        r_mal = self.client.post(
            reverse('login'), {'email': EMAIL, 'password': 'otra-clave'}, content_type='application/json'
        )
        r_nadie = self.client.post(
            reverse('login'),
            {'email': 'nadie@profesionales.local', 'password': PASSWORD},
            content_type='application/json',
        )
        self.assertEqual(r_mal.status_code, 401)
        self.assertNotIn('token', r_mal.json())
        # El núcleo del criterio 4: no distinguir.
        self.assertEqual(r_mal.json().get('detail'), r_nadie.json().get('detail'))
        self.assertEqual(r_mal.json().get('detail'), MENSAJE_GENERICO)

    def test_criterio_6_mayusculas_entran_igual(self):
        r = self.client.post(
            reverse('login'), {'email': 'QA@PROFESIONALES.LOCAL', 'password': PASSWORD},
            content_type='application/json',
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['email'], EMAIL)

    def test_criterio_6_se_guarda_en_minusculas(self):
        u = User.objects.get(email=EMAIL)
        self.assertEqual(u.email, EMAIL)

    def test_criterio_6_dos_mayusculas_distintas_son_la_misma_cuenta(self):
        with self.assertRaises(Exception):
            User.objects.create_user(email='QA@Profesionales.Local', password='x')

    def test_criterio_7_password_nunca_en_respuestas(self):
        ok = self.client.post(
            reverse('login'), {'email': EMAIL, 'password': PASSWORD}, content_type='application/json'
        )
        mal = self.client.post(
            reverse('login'), {'email': EMAIL, 'password': 'otra-clave'}, content_type='application/json'
        )
        for r in (ok, mal):
            self.assertNotIn('password', r.json())
            self.assertNotIn(PASSWORD, r.content.decode())

    def test_body_malformado_devuelve_400_con_detalle(self):
        r = self.client.post(reverse('login'), {'email': EMAIL}, content_type='application/json')
        self.assertEqual(r.status_code, 400)
        self.assertIn('password', r.json())
