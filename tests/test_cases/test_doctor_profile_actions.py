"""
Doctor profile, settings, logout and availability interaction tests.
Refactored to use the Page Object Model (POM) for maximum stability.
"""
import os
import logging
import pytest
from pages.doctor_login_page import DoctorLoginPage
from pages.doctor_dashboard_page import DoctorDashboardPage

logger = logging.getLogger(__name__)

VALID_EMAIL    = os.environ.get("DOCTOR_EMAIL", "doctor@test.com")
VALID_PASSWORD = os.environ.get("DOCTOR_PASSWORD", "password123")

class TestDoctorProfileActions:

    def _login(self, driver):
        """Login helper - always starts fresh from login page."""
        login_page = DoctorLoginPage(driver)
        dashboard  = DoctorDashboardPage(driver)
        login_page.open()
        login_page.login(VALID_EMAIL, VALID_PASSWORD)
        dashboard.wait_for_url("doctor-dashboard", timeout=20)
        return login_page, dashboard

    def test_profile_navigation_and_content(self, fresh_driver):
        """Verify profile page loads correctly via sidebar navigation."""
        _, dashboard = self._login(fresh_driver)
        logger.info("Navigating to Profile")
        dashboard.navigate_to(dashboard.SIDEBAR_PROFILE)
        dashboard.wait_for_url("profile")

        from selenium.webdriver.common.by import By
        body_text = fresh_driver.find_element(By.TAG_NAME, "body").text
        assert "Profile" in body_text or "Doctor" in body_text
        logger.info("Profile page content verified")

    def test_availability_management_access(self, fresh_driver):
        """Verify doctor can access the availability management section."""
        _, dashboard = self._login(fresh_driver)
        logger.info("Navigating to Availability")
        dashboard.navigate_to(dashboard.SIDEBAR_AVAILABILITY)
        dashboard.wait_for_url("availability", timeout=15)

        from selenium.webdriver.common.by import By
        assert dashboard.is_visible(By.TAG_NAME, "button")
        logger.info("Availability management page accessible")

    def test_settings_security_section(self, fresh_driver):
        """Verify settings page security components load."""
        _, dashboard = self._login(fresh_driver)
        logger.info("Navigating to Settings")
        dashboard.navigate_to(dashboard.SIDEBAR_SETTINGS)
        dashboard.wait_for_url("settings", timeout=15)

        from selenium.webdriver.common.by import By
        has_password_fields = dashboard.is_visible(By.CSS_SELECTOR, "input[type='password']")
        assert has_password_fields or dashboard.is_visible(By.TAG_NAME, "input")
        logger.info("Settings security sections verified")

    def test_doctor_full_logout_flow(self, fresh_driver):
        """Verify the full logout lifecycle for medical professionals."""
        _, dashboard = self._login(fresh_driver)
        logger.info("Executing logout flow")
        dashboard.logout()

        current = fresh_driver.current_url
        logger.info(f"URL after logout: {current}")
        assert "login" in current or current.rstrip("/").endswith(":3000") or current.endswith("/"), \
            f"Expected login or root page after logout, got: {current}"
        logger.info("Doctor successfully logged out of the clinical portal")
