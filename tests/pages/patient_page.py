from selenium.webdriver.common.by import By
from .base_page import BasePage


class PatientLoginPage(BasePage):
    EMAIL_INPUT    = (By.CSS_SELECTOR, "input[type='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[type='password']")
    LOGIN_BUTTON   = (By.CSS_SELECTOR, "button[type='submit']")

    def open(self):
        self.go_to("/")
        return self
