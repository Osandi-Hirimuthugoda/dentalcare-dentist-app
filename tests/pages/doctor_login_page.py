from selenium.webdriver.common.by import By
from .base_page import BasePage


class DoctorLoginPage(BasePage):
    # Selectors - matching DoctorLogin.js
    EMAIL_INPUT    = (By.CSS_SELECTOR, "input[type='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[type='password']")
    LOGIN_BUTTON   = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MSG      = (By.CSS_SELECTOR, ".error-message")

    def open(self):
        self.go_to("/doctor-login")
        return self

    def login(self, email, password):
        self.type_into(*self.EMAIL_INPUT, email)
        self.type_into(*self.PASSWORD_INPUT, password)
        self.click(*self.LOGIN_BUTTON)
        return self

    def get_error(self):
        return self.get_text(*self.ERROR_MSG)

    def is_error_shown(self):
        return self.is_visible(*self.ERROR_MSG)
