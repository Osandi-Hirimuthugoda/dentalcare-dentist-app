"""
Master E2E Management Flow: Admin -> Onboard Doctor -> Doctor Login & Action.
This test verifies the cross-role functional integrity of the medical platform.
"""
import os
import time
import uuid
import logging
import pytest
from pages.admin_login_page import AdminLoginPage
from pages.doctor_login_page import DoctorLoginPage
from selenium.webdriver.common.by import By

logger = logging.getLogger(__name__)

ADMIN_EMAIL    = os.environ.get("ADMIN_EMAIL", "admin@dentalcare.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")

class TestE2EManagementFlow:

    def test_full_doctor_onboarding_lifecycle(self, driver):
        """
        End-to-End lifecycle test:
        1. Admin logs in.
        2. Admin registers a new doctor.
        3. Doctor logs in with new credentials.
        4. Doctor verifies dashboard access.
        """
        # --- PHASE 1: Admin Onboarding ---
        admin_page = AdminLoginPage(driver)
        admin_page.open()
        
        logger.info(f"Step 1: Admin logging in as {ADMIN_EMAIL}")
        admin_page.login(ADMIN_EMAIL, ADMIN_PASSWORD)
        admin_page.wait_for_url("admin-dashboard")
        
        # Navigate to registration
        logger.info("Step 2: Navigating to Doctor Registration")
        admin_page.open("/admin/register-doctor")
        
        # Generate dynamic credentials
        unique_id = str(uuid.uuid4())[:8]
        doc_email = f"doc_{unique_id}@testing.com"
        doc_name  = f"Dr. Automation {unique_id}"
        doc_pass  = "TestPass123!"
        
        logger.info(f"Step 3: Registering new doctor: {doc_email}")
        driver.find_element(By.NAME, "fullName").send_keys(doc_name)
        driver.find_element(By.NAME, "email").send_keys(doc_email)
        driver.find_element(By.NAME, "password").send_keys(doc_pass)
        # specialization is a <select> element
        from selenium.webdriver.support.ui import Select as SeleniumSelect
        spec_el = driver.find_element(By.NAME, "specialization")
        SeleniumSelect(spec_el).select_by_index(1)
        driver.find_element(By.NAME, "licenseNumber").send_keys(f"LIC-{unique_id.upper()}")
        # experience is required
        driver.find_element(By.NAME, "experience").send_keys("3")
        driver.find_element(By.NAME, "phone").send_keys("0771234567")
        
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        
        # Wait for success or redirect back to list
        time.sleep(2) 
        logger.info("Registration submitted")

        # --- PHASE 2: Doctor Verification ---
        # Clear session to act as doctor
        logger.info("Step 4: Clearing admin session for doctor login")
        admin_page.clear_session()
        
        doc_page = DoctorLoginPage(driver)
        doc_page.open()
        
        logger.info(f"Step 5: Doctor logging in as {doc_email}")
        doc_page.login(doc_email, doc_pass)
        
        # Verify dashboard access - new accounts may take longer to redirect
        try:
            doc_page.wait_for_url("doctor-dashboard", timeout=25)
        except Exception:
            # Fallback: check if we're on any doctor page
            current = driver.current_url
            logger.warning(f"Timeout waiting for dashboard, current URL: {current}")
            assert "doctor" in current or "dashboard" in current, \
                f"Expected doctor dashboard, got: {current}"
        logger.info(f"Doctor redirected to: {driver.current_url}")
        
        assert "doctor-dashboard" in driver.current_url
        logger.info("Phase 6: Verifying dashboard content")
        
        welcome_text = driver.find_element(By.TAG_NAME, "body").text
        assert doc_name.split()[1] in welcome_text or "Overview" in welcome_text
        
        logger.info("E2E Onboarding Lifecycle Completed Successfully!")
