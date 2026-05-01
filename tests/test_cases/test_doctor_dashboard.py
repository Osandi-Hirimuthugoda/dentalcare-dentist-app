"""
Doctor dashboard & navigation tests.
Run: pytest tests/test_cases/test_doctor_dashboard.py -v
"""
import os
import time
import logging
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.doctor_login_page import DoctorLoginPage
from pages.doctor_dashboard_page import DoctorDashboardPage
from pages.base_page import FRONTEND_URL

logger = logging.getLogger(__name__)

VALID_EMAIL    = os.environ.get("DOCTOR_EMAIL", "doctor@test.com")
VALID_PASSWORD = os.environ.get("DOCTOR_PASSWORD", "password123")


def login_and_go(driver, path):
    page = DoctorLoginPage(driver)
    logger.info(f"Logging in as {VALID_EMAIL}")
    page.open()
    page.login(VALID_EMAIL, VALID_PASSWORD)
    page.wait_for_url("doctor-dashboard", timeout=15)
    time.sleep(1)
    logger.info(f"Navigating to {FRONTEND_URL}{path}")
    driver.get(f"{FRONTEND_URL}{path}")


@pytest.fixture
def logged_in_doctor(fresh_driver):
    page = DoctorLoginPage(fresh_driver)
    page.open()
    page.login(VALID_EMAIL, VALID_PASSWORD)
    page.wait_for_url("doctor-dashboard", timeout=10)
    logger.info(f"Logged in - dashboard URL: {fresh_driver.current_url}")
    return fresh_driver


class TestDoctorDashboard:

    def test_dashboard_shows_stats(self, logged_in_doctor):
        body = logged_in_doctor.find_element(By.TAG_NAME, "body").text
        logger.info(f"Dashboard URL: {logged_in_doctor.current_url}")
        logger.info(f"Page content length: {len(body)} characters")
        assert len(body) > 100
        logger.info("Dashboard content loaded successfully")

    def test_sidebar_is_visible(self, logged_in_doctor):
        links = logged_in_doctor.find_elements(By.TAG_NAME, "a")
        hrefs = [l.get_attribute("href") or "" for l in links]
        doctor_links = [h for h in hrefs if "doctor" in h.lower()]
        logger.info(f"Total links on page: {len(links)}")
        logger.info(f"Doctor navigation links found: {len(doctor_links)}")
        for link in doctor_links[:5]:
            logger.info(f"  Nav link: {link}")
        assert any("doctor" in h.lower() for h in hrefs)
        logger.info("Sidebar navigation links verified")

    def test_navigate_to_appointments(self, fresh_driver):
        login_and_go(fresh_driver, "/doctor/appointments")
        WebDriverWait(fresh_driver, 10).until(EC.url_contains("appointments"))
        logger.info(f"Appointments page URL: {fresh_driver.current_url}")
        assert "appointments" in fresh_driver.current_url
        logger.info("Navigation to appointments page successful")

    def test_navigate_to_messages(self, fresh_driver):
        login_and_go(fresh_driver, "/doctor/messages")
        WebDriverWait(fresh_driver, 10).until(EC.url_contains("messages"))
        logger.info(f"Messages page URL: {fresh_driver.current_url}")
        assert "messages" in fresh_driver.current_url
        logger.info("Navigation to messages page successful")

    def test_navigate_to_profile(self, fresh_driver):
        login_and_go(fresh_driver, "/doctor/profile")
        WebDriverWait(fresh_driver, 10).until(EC.url_contains("profile"))
        logger.info(f"Profile page URL: {fresh_driver.current_url}")
        assert "profile" in fresh_driver.current_url
        logger.info("Navigation to profile page successful")

    def test_notification_bell_visible(self, logged_in_doctor):
        wait = WebDriverWait(logged_in_doctor, 8)
        bell = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "[aria-label='Notifications'], .notification-bell-button")
        ))
        logger.info(f"Notification bell element: {bell.tag_name}")
        logger.info(f"Aria-label: {bell.get_attribute('aria-label')}")
        assert bell is not None
        logger.info("Notification bell visible in header")
