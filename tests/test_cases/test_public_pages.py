"""
Public pages tests - Home, Nearby Hospitals, Nearby Doctors, Doctor Register.
"""
import logging
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.base_page import BasePage, FRONTEND_URL

logger = logging.getLogger(__name__)


class TestPublicPages:

    def test_home_page_loads(self, fresh_driver):
        page = BasePage(fresh_driver)
        logger.info("Opening home page")
        page.go_to("/")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Page content length: {len(body)} chars")
        assert len(body) >= 1
        logger.info(f"Home page content: '{body}'")
        logger.info("Home page loaded successfully")

    def test_nearby_hospitals_page_loads(self, fresh_driver):
        page = BasePage(fresh_driver)
        logger.info("Opening nearby hospitals page")
        page.go_to("/nearby-hospitals")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Page content: {body[:100]}")
        assert len(body) > 10
        logger.info("Nearby hospitals page loaded")

    def test_nearby_doctors_page_loads(self, fresh_driver):
        page = BasePage(fresh_driver)
        logger.info("Opening nearby doctors page")
        page.go_to("/nearby-doctors")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Page content: {body[:100]}")
        assert len(body) > 10
        logger.info("Nearby doctors page loaded")

    def test_doctor_register_page_loads(self, fresh_driver):
        page = BasePage(fresh_driver)
        logger.info("Opening doctor register page")
        page.go_to("/doctor-register")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Page content: {body[:100]}")
        assert len(body) > 10
        logger.info("Doctor register page loaded")

    def test_404_page_loads(self, fresh_driver):
        page = BasePage(fresh_driver)
        logger.info("Opening non-existent page")
        page.go_to("/this-page-does-not-exist")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"404 page content: {body[:100]}")
        assert len(body) > 10
        logger.info("404 page handled correctly")

    def test_unauthenticated_redirect_doctor(self, fresh_driver):
        """Accessing protected doctor page without login redirects."""
        page = BasePage(fresh_driver)
        logger.info("Accessing doctor dashboard without login")
        fresh_driver.get(f"{FRONTEND_URL}/doctor-dashboard")
        WebDriverWait(fresh_driver, 8).until(
            lambda d: "doctor-login" in d.current_url or "doctor-dashboard" in d.current_url
        )
        logger.info(f"Redirected to: {fresh_driver.current_url}")
        assert "doctor-login" in fresh_driver.current_url
        logger.info("Unauthenticated access correctly redirected to login")

    def test_unauthenticated_redirect_admin(self, fresh_driver):
        """Accessing protected admin page without login redirects."""
        page = BasePage(fresh_driver)
        logger.info("Accessing admin dashboard without login")
        fresh_driver.get(f"{FRONTEND_URL}/admin-dashboard")
        WebDriverWait(fresh_driver, 8).until(
            lambda d: "admin-login" in d.current_url or "admin-dashboard" in d.current_url
        )
        logger.info(f"Redirected to: {fresh_driver.current_url}")
        assert "admin-login" in fresh_driver.current_url
        logger.info("Unauthenticated admin access correctly redirected")
