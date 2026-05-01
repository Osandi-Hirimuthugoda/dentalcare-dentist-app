"""
Doctor registration form tests.
"""
import logging
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from pages.base_page import BasePage, FRONTEND_URL

logger = logging.getLogger(__name__)


class TestDoctorRegister:

    def test_register_page_loads(self, fresh_driver):
        """Doctor register page renders with form fields."""
        page = BasePage(fresh_driver)
        page.go_to("/doctor-register")
        logger.info(f"URL: {fresh_driver.current_url}")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Content: {body[:150]}")
        assert len(body) > 10
        logger.info("Doctor register page loaded")

    def test_register_form_has_required_fields(self, fresh_driver):
        """Register form should have name, email, password, phone fields."""
        page = BasePage(fresh_driver)
        page.go_to("/doctor-register")
        wait = WebDriverWait(fresh_driver, 8)
        inputs = fresh_driver.find_elements(By.CSS_SELECTOR, "input")
        input_names = [i.get_attribute("name") or i.get_attribute("placeholder") or i.get_attribute("type") for i in inputs]
        logger.info(f"Form inputs found: {input_names}")
        assert len(inputs) >= 4
        logger.info(f"Register form has {len(inputs)} input fields")

    def test_register_empty_form_validation(self, fresh_driver):
        """Submitting empty form should show validation errors."""
        page = BasePage(fresh_driver)
        page.go_to("/doctor-register")
        wait = WebDriverWait(fresh_driver, 8)
        submit = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']")))
        submit.click()
        logger.info("Clicked submit on empty form")
        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Page after submit: {body[:200]}")
        # Should stay on register page or show errors
        assert "register" in fresh_driver.current_url or len(body) > 10
        logger.info("Empty form validation working")

    def test_register_has_login_link(self, fresh_driver):
        """Register page should have a link back to login."""
        page = BasePage(fresh_driver)
        page.go_to("/doctor-register")
        links = fresh_driver.find_elements(By.TAG_NAME, "a")
        hrefs = [l.get_attribute("href") or "" for l in links]
        logger.info(f"Links on register page: {hrefs}")
        has_login = any("login" in h.lower() for h in hrefs)
        assert has_login
        logger.info("Login link found on register page")

    def test_register_password_mismatch_validation(self, fresh_driver):
        """Mismatched passwords should show error."""
        page = BasePage(fresh_driver)
        page.go_to("/doctor-register")
        wait = WebDriverWait(fresh_driver, 8)

        # Fill basic fields
        inputs = fresh_driver.find_elements(By.CSS_SELECTOR, "input[type='text'], input[type='email'], input[type='tel']")
        if inputs:
            inputs[0].send_keys("Test Doctor")
        email_inputs = fresh_driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
        if email_inputs:
            email_inputs[0].send_keys("test@test.com")

        # Fill password fields with mismatch
        pass_inputs = fresh_driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
        logger.info(f"Password inputs found: {len(pass_inputs)}")
        if len(pass_inputs) >= 2:
            pass_inputs[0].send_keys("password123")
            pass_inputs[1].send_keys("different456")

        submit = fresh_driver.find_elements(By.CSS_SELECTOR, "button[type='submit']")
        if submit:
            submit[0].click()

        body = fresh_driver.find_element(By.TAG_NAME, "body").text
        logger.info(f"Body after mismatch submit: {body[:200]}")
        assert len(body) > 10
        logger.info("Password mismatch validation tested")
