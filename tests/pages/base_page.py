import os
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


class BasePage:
    def __init__(self, driver, base_url=FRONTEND_URL):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 10)

    def go_to(self, path=""):
        self.driver.get(f"{self.base_url}{path}")

    def find(self, by, value):
        return self.wait.until(EC.presence_of_element_located((by, value)))

    def find_clickable(self, by, value):
        return self.wait.until(EC.element_to_be_clickable((by, value)))

    def type_into(self, by, value, text, clear=True):
        el = self.find(by, value)
        if clear:
            el.clear()
        el.send_keys(text)

    def click(self, by, value):
        self.find_clickable(by, value).click()

    def get_text(self, by, value):
        return self.find(by, value).text

    def is_visible(self, by, value, timeout=5):
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return True
        except Exception:
            return False

    def wait_for_url(self, partial_url, timeout=10):
        WebDriverWait(self.driver, timeout).until(
            EC.url_contains(partial_url)
        )

    def clear_local_storage(self):
        self.driver.execute_script("window.localStorage.clear()")
