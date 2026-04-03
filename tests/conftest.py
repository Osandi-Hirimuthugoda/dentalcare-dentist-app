import sys
import os
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.remote.webdriver import WebDriver

# Add tests/ to path so 'pages' package is importable from test_cases/
sys.path.insert(0, os.path.dirname(__file__))

# When running in Docker, use remote Selenium Grid
# When running locally, use local Chrome
SELENIUM_REMOTE_URL = os.environ.get("SELENIUM_REMOTE_URL", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


def _make_driver() -> webdriver.Chrome | WebDriver:
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1400,900")
    options.add_argument("--headless=new")  # always headless in Docker

    if SELENIUM_REMOTE_URL:
        # Docker mode - connect to selenium/standalone-chrome container
        driver = webdriver.Remote(
            command_executor=SELENIUM_REMOTE_URL,
            options=options,
        )
    else:
        # Local mode - use local Chrome
        options.add_argument("--remote-debugging-port=9222")
        driver = webdriver.Chrome(options=options)

    driver.implicitly_wait(8)
    return driver


@pytest.fixture(scope="session")
def driver():
    d = _make_driver()
    yield d
    d.quit()


@pytest.fixture(scope="function")
def fresh_driver():
    d = _make_driver()
    yield d
    d.quit()
