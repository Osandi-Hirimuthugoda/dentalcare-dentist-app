import sys
import os
import time
import pytest
import urllib.request
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.remote.webdriver import WebDriver

sys.path.insert(0, os.path.dirname(__file__))

SELENIUM_REMOTE_URL = os.environ.get("SELENIUM_REMOTE_URL", "")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")


def pytest_html_report_title(report):
    report.title = "DentalCare+ Automation Test Report"


def pytest_configure(config):
    config._metadata = {
        "Project": "DentalCare+",
        "Test Type": "Selenium UI Automation",
        "Environment": "Docker",
        "Frontend": FRONTEND_URL,
    }


def pytest_html_results_summary(prefix, summary, postfix):
    prefix.extend(["<p>DentalCare+ — Automated UI Test Suite</p>"])


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Capture screenshot on failure and embed in report data."""
    outcome = yield
    report = outcome.get_result()
    report.description = str(item.function.__doc__ or "")
    
    if report.when == "call" and report.failed:
        # Check if driver is available in the test item
        if "driver" in item.funcargs:
            driver = item.funcargs["driver"]
            os.makedirs("reports/screenshots", exist_ok=True)
            timestamp = str(int(time.time()))
            screenshot_path = f"reports/screenshots/fail_{item.name}_{timestamp}.png"
            driver.save_screenshot(screenshot_path)
            # Store path in report for dashboard aggregator
            report.screenshot = screenshot_path


def _wait_for_selenium(url: str, retries: int = 10, delay: float = 3.0):
    """Wait until the Selenium hub is ready before creating a driver."""
    status_url = url.replace("/wd/hub", "/wd/hub/status")
    for i in range(retries):
        try:
            with urllib.request.urlopen(status_url, timeout=5) as resp:
                if resp.status == 200:
                    return
        except Exception:
            pass
        time.sleep(delay)
    raise RuntimeError(f"Selenium hub not ready after {retries} retries: {url}")


def _make_driver() -> webdriver.Chrome | WebDriver:
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1400,900")
    # Default to headless in common environments
    if os.environ.get("HEADLESS", "true").lower() == "true":
        options.add_argument("--headless=new")

    if SELENIUM_REMOTE_URL:
        _wait_for_selenium(SELENIUM_REMOTE_URL)
        driver = webdriver.Remote(
            command_executor=SELENIUM_REMOTE_URL,
            options=options,
        )
    else:
        # Local execution detection
        driver = webdriver.Chrome(options=options)

    driver.implicitly_wait(10)
    return driver


@pytest.fixture(scope="session")
def driver():
    """Shared driver for faster session-based tests."""
    d = _make_driver()
    yield d
    d.quit()


@pytest.fixture(scope="function")
def fresh_driver():
    """Isolated driver for critical clean-slate tests."""
    d = _make_driver()
    yield d
    d.quit()
