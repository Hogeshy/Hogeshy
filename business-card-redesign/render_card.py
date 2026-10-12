from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).parent
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path='/usr/bin/chromium')
    page=browser.new_page(viewport={'width':650,'height':2150}, device_scale_factor=2)
    page.goto((root/'card_layout.html').as_uri())
    page.wait_for_load_state('networkidle')
    page.locator('.front').screenshot(path=str(root/'hogeshy-business-card-front.png'))
    page.locator('.back').screenshot(path=str(root/'hogeshy-business-card-back.png'))
    browser.close()
print('rendered')
