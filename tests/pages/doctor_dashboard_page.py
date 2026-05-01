from selenium.webdriver.common.by import By
from .base_page import BasePage


class DoctorDashboardPage(BasePage):
    # Sidebar nav links
    SIDEBAR_DASHBOARD    = (By.XPATH, "//a[contains(@href, 'dashboard') or contains(., 'Dashboard')]")
    SIDEBAR_MESSAGES     = (By.XPATH, "//a[contains(@href, 'messages') or contains(., 'Messages')]")
    SIDEBAR_APPOINTMENTS = (By.XPATH, "//a[contains(@href, 'appointments') or contains(., 'Appointments')]")
    SIDEBAR_REPORTS      = (By.XPATH, "//a[contains(@href, 'reports') or contains(., 'Reports')]")
    SIDEBAR_PROFILE      = (By.XPATH, "//a[contains(@href, 'profile') or contains(., 'Profile')]")
    SIDEBAR_AVAILABILITY = (By.XPATH, "//a[contains(@href, 'availability') or contains(., 'Availability')]")
    SIDEBAR_SERVICES     = (By.XPATH, "//a[contains(@href, 'services') or contains(., 'Services')]")
    SIDEBAR_REVIEWS      = (By.XPATH, "//a[contains(@href, 'reviews') or contains(., 'Reviews')]")
    SIDEBAR_SCAN_QA      = (By.XPATH, "//a[contains(@href, 'scan-qa') or contains(., 'Scan Q&A')]")
    SIDEBAR_SETTINGS     = (By.XPATH, "//a[contains(@href, 'settings') or contains(., 'Settings')]")
    LOGOUT_BUTTON = (By.XPATH, "//button[contains(text(),'Logout') or contains(text(),'logout') or contains(text(),'LOG OUT')]")

    # Dashboard content
    WELCOME_HEADING = (By.XPATH, "//*[contains(@class, 'heading') or contains(@class, 'title') or self::h1 or self::h2]")

    def open(self):
        super().open("/doctor-dashboard")
        return self

    def is_loaded(self):
        return self.is_visible(*self.WELCOME_HEADING)

    def navigate_to(self, menu_locator):
        self.click(*menu_locator)
        return self

    def logout(self):
        # Scroll sidebar to bottom to reveal logout button, then click via JS
        try:
            logout_btn = self.driver.find_element(*self.LOGOUT_BUTTON)
            self.driver.execute_script("arguments[0].scrollIntoView(true);", logout_btn)
            self.driver.execute_script("arguments[0].click();", logout_btn)
        except Exception:
            self.click(*self.LOGOUT_BUTTON)
        # Logout redirects to "/" (root/onboarding), not /login
        import time
        time.sleep(2)
