from labml import lab
from selenium import webdriver
from selenium.webdriver.common.by import By

from selenium.webdriver.firefox.options import Options
from selenium.webdriver.support import expected_conditions
from selenium.webdriver.support.wait import WebDriverWait

options = Options()
options.headless = True
driver = webdriver.Firefox(executable_path=str(lab.get_path() / 'geckodriver'),
                           options=options)


def screenshot():
    driver.get('http://localhost:3000/chart')
    driver.save_screenshot('screenshot.png')


def screenshot_div():
    from PIL import Image

    driver.get('https://web.lab-ml.com/chart?run_uuid=6e8a1a44d21711ea8099f318d43ad04c')
    element = WebDriverWait(driver, 10).until(
        expected_conditions.presence_of_element_located((By.ID, "sample-chart"))
    )
    # element = driver.find_element_by_id("sample-chart")
    location = element.location
    size = element.size
    driver.save_screenshot("pageImage.png")

    # crop image
    x = location['x']
    y = location['y']
    width = location['x'] + size['width']
    height = location['y'] + size['height']
    im = Image.open('pageImage.png')
    im = im.crop((int(x), int(y), int(width), int(height)))
    im.save('chart.png')

    print('done')
    # driver.quit()


if __name__ == '__main__':
    # screenshot()
    screenshot_div()
