"""
Admin dashboard & pages tests.
"""
import os
import time
import logging
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.admin_login_page import AdminLoginPage
from pages.base_page import FRONTEND_URL

logger = logging.getLogger(__name__)

ADMIN_EMAIL    = os.environ.get("ADMIN_EMAIL", "admin@dentalcare.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")


def admin_login_and_go(driver, path):
    page = AdminLoginPage(driver)
    logger.info(f"Logging in as admin: {ADMIN_EMAIL}")
    page.open()
    page.login(ADMIN_EMAIL, ADMIN_PASSWORD)
    page.wait_for_url("admin-dashboard", timeout=10)
    time.sleep(1)
    logger.info(f"Navigating to {FRONTEND_URL}{path}")
    driver.get(f"{FRONTEND_URL}{path}")


@pytest.fixture
def logged_in_admin(fresh_driver):
    page = AdminLoginPage(fresh_driver)
    page.open()
    page.login(ADMIN_EMAIL, ADMIN_PASSWORD)
    page.wait_for_url("admin-dashboard", timeout=10)
    logger.info(f"Admin logged in: {fresh_driver.current_url}")
    return fresh_driver


class TestAdminDashboard:

    def test_admin_dashboard_loads(self, logged_in_admin):
        body = logged_in_admin.find_element(By.TAG_NAME, "body").text
        logger.info(f"Dashboard URL: {logged_in_admin.current_url}")
        logger.info(f"Content length: {len(body)} chars")
        assert len(body) > 100
        logger.info("Admin dashboard loaded with content")

    def test_admin_sidebar_visible(self, logged_in_admin):
        links = logged_in_admin.find_elements(By.TAG_NAME, "a")
        hrefs = [l.get_attribute("href") or "" for l in links]
        admin_links = [h for h in hrefs if "admin" in h.lower()]
        logger.info(f"Admin nav links found: {len(admin_links)}")
        for link in admin_links[:5]:
            logger.info(f"  {link}")
        assert len(admin_links) > 0
        logger.info("Admin sidebar navigation verified")

    def test_navigate_to_doctors(self, fresh_driver):
        admin_login_and_go(fresh_driver, "/admin/doctors")
        WebDriverWait(fresh_driver, 10).until(EC.url_contains("doctors"))
        logger.info(f"Doctors page URL: {fresh_driver.current_url}")
        assert "doctors" in fresh_driver.current_url
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Doctors page content: {body[:100]}")
        logger.info("Admin doctors page loaded")

    def test_navigate_to_patients(self, fresh_driver):
        admin_login_and_go(fresh_driver, "/admin/patients")
        WebDriverWait(fresh_driver, 10).until(EC.url_contains("patients"))
        logger.info(f"Patients page URL: {fresh_driver.current_url}")
        assert "patients" in fresh_driver.current_url
        logger.info("Admin patients page loaded")

    def test_navigate_to_appointments(self, fresh_driver):
        admin_login_and_go(fresh_driver, "/admin/appointments")
        WebDriverWait(fresh_driver, 10).until(EC.url_contains("appointments"))
        logger.info(f"Appointments page URL: {fresh_driver.current_url}")
        assert "appointments" in fresh_driver.current_url
        logger.info("Admin appointments page loaded")

    def test_navigate_to_hospitals(self, fresh_driver):
        admin_login_and_go(fresh_driver, "/admin/hospitals")
        WebDriverWait(fresh_driver, 10).until(EC.url_contains("hospitals"))
        logger.info(f"Hospitals page URL: {fresh_driver.current_url}")
        assert "hospitals" in fresh_driver.current_url
        logger.info("Admin hospitals page loaded")

    def test_navigate_to_activity(self, fresh_driver):
        admin_login_and_go(fresh_driver, "/admin/activity")
        WebDriverWait(fresh_driver, 10).until(EC.url_contains("activity"))
        logger.info(f"Activity page URL: {fresh_driver.current_url}")
        assert "activity" in fresh_driver.current_url
        logger.info("Admin activity page loaded")

    def test_navigate_to_register_doctor(self, fresh_driver):
        admin_login_and_go(fresh_driver, "/admin/register-doctor")
        WebDriverWait(fresh_driver, 10).until(EC.url_contains("register"))
        logger.info(f"Register doctor page URL: {fresh_driver.current_url}")
        assert "register" in fresh_driver.current_url
        logger.info("Admin register doctor page loaded")
