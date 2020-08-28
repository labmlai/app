import time
from pathlib import Path
from threading import Lock
from typing import Optional

from PIL import Image
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait

from .. import settings


class WebDriver:
    driver: Optional[webdriver.Firefox]

    def __init__(self):
        self.lock = Lock()
        self.driver = None

    def _init_driver(self):
        options = Options()
        options.headless = True
        self.driver = webdriver.Firefox(
            executable_path=str(settings.DATA_PATH.parent / 'geckodriver'),
            options=options)
        time.sleep(0.5)
        # self.driver.set_window_size(3000, 3000)
        # self.driver.get(settings.WEB_URL)
        # element = WebDriverWait(self.driver, 10).until(
        #     expected_conditions.presence_of_element_located((By.TAG_NAME, 'body'))
        # )
        #
        # for i in range(10):
        #     element.send_keys(Keys.CONTROL + '+')

    def chart_image(self, run_uuid, step):
        url = f'{settings.WEB_URL}/chart/?run_uuid={run_uuid}'
        page_image_path = str(
            Path(settings.DATA_PATH / 'images' / f'{run_uuid}.{step}.chartPageImage.png'))
        div_image_path = str(Path(settings.DATA_PATH / 'images' / f'{run_uuid}.{step}.chart.png'))
        div_id = 'chart'

        return self._screenshot_div(url, page_image_path, div_image_path, div_id)

    def run(self, run_uuid):
        url = f'{settings.WEB_URL}/run/?run_uuid={run_uuid}'
        page_image_path = str(Path(settings.DATA_PATH / 'images' / f'{run_uuid}.runPageImage.png'))
        div_image_path = str(Path(settings.DATA_PATH / 'images' / f'{run_uuid}.run.png'))
        div_id = 'run'

        return self._screenshot_div(url, page_image_path, div_image_path, div_id)

    def _screenshot_div(self, url, page_image_path, div_image_path, div_id):
        with self.lock:
            if self.driver is None:
                self._init_driver()
            self.driver.get(url)
            # self.driver.execute_script("document.body.style.MozTransform='scale(2)';")
            try:
                element = WebDriverWait(self.driver, 10).until(
                    expected_conditions.presence_of_element_located((By.ID, div_id))
                )
            except TimeoutException:
                return None

            # Just to make sure the content is rendered
            time.sleep(0.1)
            location = element.location
            size = element.size

            self.driver.save_screenshot(page_image_path)

            # crop image
            x = location['x']
            y = location['y']
            width = x + size['width']
            height = y + size['height']

            im = Image.open(page_image_path)
            im = im.crop((int(x), int(y), int(width), int(height)))
            im.save(div_image_path)

            return div_image_path

    def __quit_driver(self):
        self.driver.quit()


WEB_DRIVER = WebDriver()
