from selenium.webdriver.common.by import By
from .base_page import BasePage


class DoctorDashboardPage(BasePage):
    # Sidebar nav links
    SIDEBAR_MESSAGES     = (By.XPATH, "//a[contains(@href, 'messages') or contains(., 'Messages')]")
    SIDEBAR_APPOINTMENTS = (By.XPATH, "//a[contains(@href, 'appointments') or contains(., 'Appointments')]")
    SIDEBAR_REPORTS      = (By.XPATH, "//a[contains(@href, 'reports') or contains(., 'Reports')]")
    SIDEBAR_PROFILE      = (By.XPATH, "//a[contains(@href, 'profile') or contains(., 'Profile')]")

    # Dashboard content
    WELCOME_HEADING = (By.XPATH, "//*[contains(@class, 'heading') or contains(@class, 'title') or self::h1 or self::h2]")

    def open(self):
        self.go_to("/doctor-dashboard")
        return self

    def is_loaded(self):
        return self.is_visible(*self.WELCOME_HEADING)

    def go_to_messages(self):
        self.click(*self.SIDEBAR_MESSAGES)

    def go_to_appointments(self):
        self.click(*self.SIDEBAR_APPOINTMENTS)
