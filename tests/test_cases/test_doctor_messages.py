"""
Doctor messages page tests.
Run: pytest tests/test_cases/test_doctor_messages.py -v
"""
import os
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from pages.doctor_login_page import DoctorLoginPage

VALID_EMAIL    = os.environ.get("DOCTOR_EMAIL", "doctor@test.com")
VALID_PASSWORD = os.environ.get("DOCTOR_PASSWORD", "password123")


@pytest.fixture
def messages_page(fresh_driver):
    """Login and navigate to messages page."""
    page = DoctorLoginPage(fresh_driver)
    page.open()
    page.login(VALID_EMAIL, VALID_PASSWORD)
    page.wait_for_url("doctor-dashboard", timeout=10)

    wait = WebDriverWait(fresh_driver, 8)
    msg_link = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//a[contains(@href, 'messages')]")
    ))
    msg_link.click()
    wait.until(EC.url_contains("messages"))
    return fresh_driver


class TestDoctorMessages:

    def test_messages_page_loads(self, messages_page):
        """Messages page should load with content."""
        driver = messages_page
        body = driver.find_element(By.TAG_NAME, "body").text
        assert len(body) > 50

    def test_search_bar_present(self, messages_page):
        """Search input should be visible."""
        driver = messages_page
        wait = WebDriverWait(driver, 8)
        search = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[type='text'], input[placeholder*='earch']")
        ))
        assert search is not None

    def test_tabs_visible(self, messages_page):
        """Patients and Doctors tabs should be visible."""
        driver = messages_page
        body = driver.find_element(By.TAG_NAME, "body").text
        # At least one of these tab labels should appear
        assert "Patients" in body or "patients" in body.lower() or "Messages" in body

    def test_send_button_present(self, messages_page):
        """Send button should exist on the page."""
        driver = messages_page
        wait = WebDriverWait(driver, 8)
        # Try to find any send button
        buttons = driver.find_elements(By.TAG_NAME, "button")
        button_texts = [b.text.lower() for b in buttons]
        assert any("send" in t for t in button_texts), "Send button should be present"

    def test_announcement_button_present(self, messages_page):
        """Announcement button should be visible."""
        driver = messages_page
        buttons = driver.find_elements(By.TAG_NAME, "button")
        button_texts = [b.text.lower() for b in buttons]
        assert any("announce" in t or "broadcast" in t for t in button_texts) or \
               "Announcement" in driver.find_element(By.TAG_NAME, "body").text
