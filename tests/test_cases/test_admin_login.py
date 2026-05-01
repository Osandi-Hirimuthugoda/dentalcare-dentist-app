"""
Admin login flow tests.
Run: pytest tests/test_cases/test_admin_login.py -v
"""
import os
import logging
import pytest
from pages.admin_login_page import AdminLoginPage

logger = logging.getLogger(__name__)

ADMIN_EMAIL    = os.environ.get("ADMIN_EMAIL", "admin@dentalcare.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")


class TestAdminLogin:

    def test_admin_login_page_loads(self, fresh_driver):
        page = AdminLoginPage(fresh_driver)
        logger.info("Opening admin login page")
        page.open()
        logger.info(f"Current URL: {fresh_driver.current_url}")
        assert "Admin Login" in fresh_driver.page_source
        logger.info("Admin login page loaded successfully")

    def test_wrong_credentials_show_error(self, fresh_driver):
        page = AdminLoginPage(fresh_driver)
        page.open()
        logger.info("Entering wrong credentials: wrong@email.com / wrongpass")
        page.login("wrong@email.com", "wrongpass")
        error = page.get_error() if page.is_error_shown() else "none"
        logger.info(f"Error message: {error}")
        assert page.is_error_shown()
        logger.info("Error message displayed correctly")

    def test_successful_admin_login(self, fresh_driver):
        page = AdminLoginPage(fresh_driver)
        page.open()
        logger.info(f"Logging in as admin: {ADMIN_EMAIL}")
        page.login(ADMIN_EMAIL, ADMIN_PASSWORD)
        page.wait_for_url("admin-dashboard", timeout=10)
        logger.info(f"Redirected to: {fresh_driver.current_url}")
        assert "admin-dashboard" in fresh_driver.current_url
        logger.info("Admin login successful")

    def test_admin_role_saved_in_localstorage(self, fresh_driver):
        page = AdminLoginPage(fresh_driver)
        page.open()
        page.login(ADMIN_EMAIL, ADMIN_PASSWORD)
        page.wait_for_url("admin-dashboard", timeout=10)
        role = fresh_driver.execute_script("return localStorage.getItem('role')")
        logger.info(f"Role in localStorage: {role}")
        assert role == "admin"
        logger.info("Admin role correctly saved in localStorage")
