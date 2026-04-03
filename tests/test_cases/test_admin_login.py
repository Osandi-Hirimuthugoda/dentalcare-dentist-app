"""
Admin login flow tests.
Run: pytest tests/test_cases/test_admin_login.py -v
"""
import os
import pytest
from pages.admin_login_page import AdminLoginPage

ADMIN_EMAIL    = os.environ.get("ADMIN_EMAIL", "admin@dentalcare.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")


class TestAdminLogin:

    def test_admin_login_page_loads(self, fresh_driver):
        page = AdminLoginPage(fresh_driver)
        page.open()
        assert "Admin Login" in fresh_driver.page_source

    def test_wrong_credentials_show_error(self, fresh_driver):
        page = AdminLoginPage(fresh_driver)
        page.open()
        page.login("wrong@email.com", "wrongpass")
        assert page.is_error_shown()

    def test_successful_admin_login(self, fresh_driver):
        page = AdminLoginPage(fresh_driver)
        page.open()
        page.login(ADMIN_EMAIL, ADMIN_PASSWORD)
        page.wait_for_url("admin-dashboard", timeout=10)
        assert "admin-dashboard" in fresh_driver.current_url

    def test_admin_role_saved_in_localstorage(self, fresh_driver):
        page = AdminLoginPage(fresh_driver)
        page.open()
        page.login(ADMIN_EMAIL, ADMIN_PASSWORD)
        page.wait_for_url("admin-dashboard", timeout=10)

        role = fresh_driver.execute_script("return localStorage.getItem('role')")
        assert role == "admin"
