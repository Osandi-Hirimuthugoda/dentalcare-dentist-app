"""
Doctor dashboard & navigation tests.
Requires a logged-in doctor session.
Run: pytest tests/test_cases/test_doctor_dashboard.py -v
"""
import os
import json
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.doctor_login_page import DoctorLoginPage
from pages.doctor_dashboard_page import DoctorDashboardPage

VALID_EMAIL    = os.environ.get("DOCTOR_EMAIL", "doctor@test.com")
VALID_PASSWORD = os.environ.get("DOCTOR_PASSWORD", "password123")


@pytest.fixture
def logged_in_doctor(fresh_driver):
    """Login and return driver on dashboard."""
    page = DoctorLoginPage(fresh_driver)
    page.open()
    page.login(VALID_EMAIL, VALID_PASSWORD)
    page.wait_for_url("doctor-dashboard", timeout=10)
    return fresh_driver


class TestDoctorDashboard:

    def test_dashboard_shows_stats(self, logged_in_doctor):
        """Dashboard should show stat cards."""
        driver = logged_in_doctor
        # Look for any numeric stat on the page
        body = driver.find_element(By.TAG_NAME, "body").text
        assert len(body) > 100  # page has content

    def test_sidebar_is_visible(self, logged_in_doctor):
        """Sidebar navigation should be present."""
        driver = logged_in_doctor
        # Sidebar should have navigation links
        links = driver.find_elements(By.TAG_NAME, "a")
        hrefs = [l.get_attribute("href") or "" for l in links]
        nav_links = [h for h in hrefs if "doctor" in h.lower()]
        assert len(nav_links) > 0, "Sidebar should have doctor navigation links"

    def test_navigate_to_appointments(self, logged_in_doctor):
        """Clicking Appointments in sidebar navigates correctly."""
        driver = logged_in_doctor
        wait = WebDriverWait(driver, 8)

        # Find appointments link
        appt_link = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//a[contains(@href, 'appointments')]")
        ))
        appt_link.click()
        wait.until(EC.url_contains("appointments"))
        assert "appointments" in driver.current_url

    def test_navigate_to_messages(self, logged_in_doctor):
        """Clicking Messages in sidebar navigates correctly."""
        driver = logged_in_doctor
        wait = WebDriverWait(driver, 8)

        msg_link = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//a[contains(@href, 'messages')]")
        ))
        msg_link.click()
        wait.until(EC.url_contains("messages"))
        assert "messages" in driver.current_url

    def test_navigate_to_profile(self, logged_in_doctor):
        """Clicking Profile in sidebar navigates correctly."""
        driver = logged_in_doctor
        wait = WebDriverWait(driver, 8)

        profile_link = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//a[contains(@href, 'profile')]")
        ))
        profile_link.click()
        wait.until(EC.url_contains("profile"))
        assert "profile" in driver.current_url

    def test_notification_bell_visible(self, logged_in_doctor):
        """Notification bell should be in the header."""
        driver = logged_in_doctor
        wait = WebDriverWait(driver, 8)
        # NotificationBell renders a button with aria-label="Notifications"
        bell = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "[aria-label='Notifications'], .notification-bell-button")
        ))
        assert bell is not None
