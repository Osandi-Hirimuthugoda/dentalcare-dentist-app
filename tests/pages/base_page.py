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
        self.wait = WebDriverWait(driver, 15) # Increased timeout for dental app complexity

    def open(self, path=""):
        url = f"{self.base_url}{path}"
        self.driver.get(url)

    def go_to(self, path=""):
        """Alias for open() - navigate to a path."""
        self.open(path)

    def find(self, by, value):
        """Find element with explicit wait."""
        return self.wait.until(EC.visibility_of_element_located((by, value)))

    def find_all(self, by, value):
        """Find all elements matching locator."""
        return self.wait.until(EC.presence_of_all_elements_located((by, value)))

    def find_clickable(self, by, value):
        """Find element and ensure it is clickable."""
        return self.wait.until(EC.element_to_be_clickable((by, value)))

    def type_into(self, by, value, text, clear=True):
        """Standard input handling with clearing support."""
        el = self.find(by, value)
        if clear:
            el.click() # Ensure focus
            el.send_keys(Keys.CONTROL + "a")
            el.send_keys(Keys.BACKSPACE)
        el.send_keys(text)

    def click(self, by, value):
        """Robust click with fallback to JS click if intercepted."""
        try:
            self.find_clickable(by, value).click()
        except Exception:
            el = self.driver.find_element(by, value)
            self.driver.execute_script("arguments[0].click();", el)

    def get_text(self, by, value):
        """Retrieve visible text of an element."""
        return self.find(by, value).text

    def is_visible(self, by, value, timeout=5):
        """Boolean check for element visibility within a timeout."""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located((by, value))
            )
            return True
        except Exception:
            return False

    def wait_for_url(self, partial_url, timeout=10):
        """Wait until browser URL contains the specific string."""
        WebDriverWait(self.driver, timeout).until(
            EC.url_contains(partial_url)
        )

    def take_screenshot(self, name):
        """Saves a screenshot to the reports/screenshots directory."""
        os.makedirs("reports/screenshots", exist_ok=True)
        path = f"reports/screenshots/{name}.png"
        self.driver.save_screenshot(path)
        return path

    def clear_session(self):
        """Clean slate for next test."""
        self.driver.execute_script("window.localStorage.clear();")
        self.driver.execute_script("window.sessionStorage.clear();")
