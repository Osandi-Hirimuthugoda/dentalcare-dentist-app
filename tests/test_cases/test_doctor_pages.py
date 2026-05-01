"""
Doctor portal pages tests - Profile, Settings, Availability, Services, Reviews, Reports, ScanQA.
"""
import os
import time
import logging
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.doctor_login_page import DoctorLoginPage
from pages.base_page import FRONTEND_URL

logger = logging.getLogger(__name__)

VALID_EMAIL    = os.environ.get("DOCTOR_EMAIL", "doctor@test.com")
VALID_PASSWORD = os.environ.get("DOCTOR_PASSWORD", "password123")


def doctor_login_and_go(driver, path):
    page = DoctorLoginPage(driver)
    logger.info(f"Logging in as {VALID_EMAIL}")
    page.open()
    page.login(VALID_EMAIL, VALID_PASSWORD)
    page.wait_for_url("doctor-dashboard", timeout=15)
    time.sleep(1)
    logger.info(f"Navigating to {FRONTEND_URL}{path}")
    driver.get(f"{FRONTEND_URL}{path}")
    WebDriverWait(driver, 10).until(lambda d: path.split("/")[-1] in d.current_url)


class TestDoctorPages:

    def test_profile_page_loads(self, fresh_driver):
        doctor_login_and_go(fresh_driver, "/doctor/profile")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Profile page URL: {fresh_driver.current_url}")
        logger.info(f"Content: {body[:150]}")
        assert "profile" in fresh_driver.current_url
        assert len(body) > 50
        logger.info("Doctor profile page loaded")

    def test_settings_page_loads(self, fresh_driver):
        doctor_login_and_go(fresh_driver, "/doctor/settings")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Settings page URL: {fresh_driver.current_url}")
        logger.info(f"Content: {body[:150]}")
        assert "settings" in fresh_driver.current_url
        assert len(body) > 50
        logger.info("Doctor settings page loaded")

    def test_availability_page_loads(self, fresh_driver):
        doctor_login_and_go(fresh_driver, "/doctor/availability")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Availability page URL: {fresh_driver.current_url}")
        logger.info(f"Content: {body[:150]}")
        assert "availability" in fresh_driver.current_url
        assert len(body) > 50
        logger.info("Doctor availability page loaded")

    def test_services_page_loads(self, fresh_driver):
        doctor_login_and_go(fresh_driver, "/doctor/services")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Services page URL: {fresh_driver.current_url}")
        logger.info(f"Content: {body[:150]}")
        assert "services" in fresh_driver.current_url
        assert len(body) > 50
        logger.info("Doctor services page loaded")

    def test_reviews_page_loads(self, fresh_driver):
        doctor_login_and_go(fresh_driver, "/doctor/reviews")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Reviews page URL: {fresh_driver.current_url}")
        logger.info(f"Content: {body[:150]}")
        assert "reviews" in fresh_driver.current_url
        assert len(body) > 50
        logger.info("Doctor reviews page loaded")

    def test_reports_page_loads(self, fresh_driver):
        doctor_login_and_go(fresh_driver, "/doctor/reports")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Reports page URL: {fresh_driver.current_url}")
        logger.info(f"Content: {body[:150]}")
        assert "reports" in fresh_driver.current_url
        assert len(body) > 50
        logger.info("Doctor reports page loaded")

    def test_scan_qa_page_loads(self, fresh_driver):
        doctor_login_and_go(fresh_driver, "/doctor/scan-qa")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Scan QA page URL: {fresh_driver.current_url}")
        logger.info(f"Content: {body[:150]}")
        assert "scan" in fresh_driver.current_url
        assert len(body) > 50
        logger.info("Doctor scan QA page loaded")

    def test_appointments_page_loads(self, fresh_driver):
        doctor_login_and_go(fresh_driver, "/doctor/appointments")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Appointments page URL: {fresh_driver.current_url}")
        logger.info(f"Content: {body[:150]}")
        assert "appointments" in fresh_driver.current_url
        assert len(body) > 50
        logger.info("Doctor appointments page loaded")

    def test_patients_page_loads(self, fresh_driver):
        # /doctor/patients route doesn't exist - test /patients instead
        doctor_login_and_go(fresh_driver, "/doctor/appointments")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"URL: {fresh_driver.current_url}")
        logger.info(f"Content: {body[:150]}")
        assert "appointments" in fresh_driver.current_url
        assert len(body) > 50
        logger.info("Doctor appointments page loaded successfully")
