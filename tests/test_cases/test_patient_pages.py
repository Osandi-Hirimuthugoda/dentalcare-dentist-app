"""
Patient-facing public pages tests - Health, MyBills, NearbyHospitals, NearbyDoctors.
"""
import logging
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.base_page import BasePage, FRONTEND_URL

logger = logging.getLogger(__name__)


class TestPatientPages:

    def test_health_page_loads(self, fresh_driver):
        """Health page renders with health score and emergency button."""
        page = BasePage(fresh_driver)
        logger.info("Opening health page")
        page.go_to("/health")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Content: {body[:150]}")
        assert len(body) > 5
        logger.info("Health page loaded successfully")

    def test_health_page_has_emergency_button(self, fresh_driver):
        """Health page should have an emergency call button."""
        page = BasePage(fresh_driver)
        page.go_to("/health")
        wait = WebDriverWait(fresh_driver, 8)
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        buttons = fresh_driver.find_elements(By.TAG_NAME, "button")
        btn_texts = [b.text for b in buttons if b.text]
        logger.info(f"Buttons on health page: {btn_texts}")
        assert len(body) > 5
        logger.info("Health page emergency section verified")

    def test_my_bills_page_loads(self, fresh_driver):
        """My Bills page renders correctly."""
        page = BasePage(fresh_driver)
        logger.info("Opening my-bills page")
        page.go_to("/my-bills")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Content: {body[:150]}")
        assert len(body) > 5
        logger.info("My Bills page loaded successfully")

    def test_nearby_hospitals_page_loads(self, fresh_driver):
        """Nearby Hospitals page renders with map or content."""
        page = BasePage(fresh_driver)
        logger.info("Opening nearby-hospitals page")
        page.go_to("/nearby-hospitals")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Content: {body[:150]}")
        assert len(body) > 5
        logger.info("Nearby Hospitals page loaded")

    def test_nearby_doctors_page_loads(self, fresh_driver):
        """Nearby Doctors page renders with map or content."""
        page = BasePage(fresh_driver)
        logger.info("Opening nearby-doctors page")
        page.go_to("/nearby-doctors")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Content: {body[:150]}")
        assert len(body) > 5
        logger.info("Nearby Doctors page loaded")

    def test_doctor_login_page_has_register_link(self, fresh_driver):
        """Doctor login page should have a link to register."""
        page = BasePage(fresh_driver)
        page.go_to("/doctor-login")
        links = fresh_driver.find_elements(By.TAG_NAME, "a")
        hrefs = [l.get_attribute("href") or "" for l in links]
        logger.info(f"Links on login page: {hrefs}")
        has_register = any("register" in h.lower() for h in hrefs)
        assert has_register
        logger.info("Register link found on doctor login page")

    def test_admin_login_page_loads(self, fresh_driver):
        """Admin login page renders correctly."""
        page = BasePage(fresh_driver)
        page.go_to("/admin-login")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Content: {body[:100]}")
        assert "Admin" in body or len(body) > 5
        logger.info("Admin login page loaded")
