"""
Doctor login flow tests.
Run: pytest tests/test_cases/test_doctor_login.py -v
"""
import os
import logging
import pytest
from selenium.webdriver.common.by import By
from pages.doctor_login_page import DoctorLoginPage

logger = logging.getLogger(__name__)

VALID_EMAIL    = os.environ.get("DOCTOR_EMAIL", "doctor@test.com")
VALID_PASSWORD = os.environ.get("DOCTOR_PASSWORD", "password123")


class TestDoctorLogin:

    def test_login_page_loads(self, fresh_driver):
        """Login page renders correctly."""
        page = DoctorLoginPage(fresh_driver)
        logger.info("Opening doctor login page")
        page.open()
        logger.info(f"Current URL: {fresh_driver.current_url}")
        logger.info("Checking email input is visible")
        assert page.is_visible(*page.EMAIL_INPUT)
        logger.info("Checking password input is visible")
        assert page.is_visible(*page.PASSWORD_INPUT)
        logger.info("Checking login button is visible")
        assert page.is_visible(*page.LOGIN_BUTTON)
        assert "Doctor Login" in fresh_driver.page_source
        logger.info("Login page loaded successfully - all elements present")

    def test_empty_form_shows_validation(self, fresh_driver):
        """Submitting empty form should not navigate away."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        logger.info("Clicking login button without entering credentials")
        page.click(*page.LOGIN_BUTTON)
        logger.info(f"URL after empty submit: {fresh_driver.current_url}")
        assert "doctor-login" in fresh_driver.current_url
        logger.info("Validation passed - stayed on login page")

    def test_wrong_password_shows_error(self, fresh_driver):
        """Wrong credentials show an error message."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        logger.info(f"Entering email: {VALID_EMAIL}")
        logger.info("Entering wrong password: wrongpassword999")
        page.login(VALID_EMAIL, "wrongpassword999")
        error = page.get_error() if page.is_error_shown() else "none"
        logger.info(f"Error message displayed: {error}")
        assert page.is_error_shown()
        logger.info("Error message shown correctly for wrong credentials")

    def test_invalid_email_format(self, fresh_driver):
        """Invalid email format should not submit."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        logger.info("Entering invalid email format: notanemail")
        page.type_into(*page.EMAIL_INPUT, "notanemail")
        page.type_into(*page.PASSWORD_INPUT, "password123")
        page.click(*page.LOGIN_BUTTON)
        logger.info(f"URL after invalid email: {fresh_driver.current_url}")
        assert "doctor-login" in fresh_driver.current_url
        logger.info("HTML5 email validation blocked submission")

    def test_successful_login_redirects_to_dashboard(self, fresh_driver):
        """Valid credentials redirect to doctor dashboard."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        logger.info(f"Logging in with: {VALID_EMAIL}")
        page.login(VALID_EMAIL, VALID_PASSWORD)
        page.wait_for_url("doctor-dashboard", timeout=10)
        logger.info(f"Redirected to: {fresh_driver.current_url}")
        assert "doctor-dashboard" in fresh_driver.current_url
        logger.info("Login successful - redirected to dashboard")

    def test_token_saved_in_localstorage_after_login(self, fresh_driver):
        """After login, token should be in localStorage."""
        page = DoctorLoginPage(fresh_driver)
        page.open()
        page.login(VALID_EMAIL, VALID_PASSWORD)
        page.wait_for_url("doctor-dashboard", timeout=10)
        token = fresh_driver.execute_script("return localStorage.getItem('token')")
        logger.info(f"Token found in localStorage: {'Yes' if token else 'No'}")
        logger.info(f"Token length: {len(token) if token else 0} characters")
        assert token is not None and len(token) > 10
        logger.info("JWT token correctly saved in localStorage")

    def test_doctor_data_saved_in_localstorage(self, fresh_driver):
        """After login, doctor object should be in localStorage."""
        import json
        page = DoctorLoginPage(fresh_driver)
        page.open()
        page.login(VALID_EMAIL, VALID_PASSWORD)
        page.wait_for_url("doctor-dashboard", timeout=10)
        doctor_raw = fresh_driver.execute_script("return localStorage.getItem('doctor')")
        doctor = json.loads(doctor_raw)
        logger.info(f"Doctor email in localStorage: {doctor.get('email', 'N/A')}")
        logger.info(f"Doctor ID: {doctor.get('_id', 'N/A')}")
        assert "email" in doctor or "_id" in doctor
        logger.info("Doctor data correctly saved in localStorage")
