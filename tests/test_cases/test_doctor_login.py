"""
Doctor login flow tests.
Run: pytest tests/test_cases/test_doctor_login.py -v
"""
import os
import pytest
from selenium.webdriver.common.by import By
from pages.doctor_login_page import DoctorLoginPage

VALID_EMAIL    = os.environ.get("DOCTOR_EMAIL", "doctor@test.com")
VALID_PASSWORD = os.environ.get("DOCTOR_PASSWORD", "password123")


class TestDoctorLogin:

    def test_login_page_loads(self, fresh_driver):
        """Login page renders correctly."""
        page = DoctorLoginPage(fresh_driver)
        page.open()

        assert "Doctor Login" in fresh_driver.page_source
        assert page.is_visible(*page.EMAIL_INPUT)
        assert page.is_visible(*page.PASSWORD_INPUT)
        assert page.is_visible(*page.LOGIN_BUTTON)

    def test_empty_form_shows_validation(self, fresh_driver):
        """Submitting empty form should not navigate away."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        page.click(*page.LOGIN_BUTTON)

        # HTML5 required validation keeps us on the same page
        assert "doctor-login" in fresh_driver.current_url

    def test_wrong_password_shows_error(self, fresh_driver):
        """Wrong credentials show an error message."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        page.login(VALID_EMAIL, "wrongpassword999")

        assert page.is_error_shown(), "Error message should appear for wrong credentials"
        error_text = page.get_error()
        assert len(error_text) > 0

    def test_invalid_email_format(self, fresh_driver):
        """Invalid email format should not submit."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        page.type_into(*page.EMAIL_INPUT, "notanemail")
        page.type_into(*page.PASSWORD_INPUT, "password123")
        page.click(*page.LOGIN_BUTTON)

        # HTML5 email validation keeps us on the page
        assert "doctor-login" in fresh_driver.current_url

    def test_successful_login_redirects_to_dashboard(self, fresh_driver):
        """Valid credentials redirect to doctor dashboard."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        page.login(VALID_EMAIL, VALID_PASSWORD)

        page.wait_for_url("doctor-dashboard", timeout=10)
        assert "doctor-dashboard" in fresh_driver.current_url

    def test_token_saved_in_localstorage_after_login(self, fresh_driver):
        """After login, token should be in localStorage."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        page.login(VALID_EMAIL, VALID_PASSWORD)
        page.wait_for_url("doctor-dashboard", timeout=10)

        token = fresh_driver.execute_script("return localStorage.getItem('token')")
        assert token is not None and len(token) > 10

    def test_doctor_data_saved_in_localstorage(self, fresh_driver):
        """After login, doctor object should be in localStorage."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        page.login(VALID_EMAIL, VALID_PASSWORD)
        page.wait_for_url("doctor-dashboard", timeout=10)

        import json
        doctor_raw = fresh_driver.execute_script("return localStorage.getItem('doctor')")
        assert doctor_raw is not None
        doctor = json.loads(doctor_raw)
        assert "email" in doctor or "_id" in doctor
