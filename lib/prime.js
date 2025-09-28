import { chromium } from 'playwright';
import si from 'systeminformation';
import assert from 'node:assert';
import validate from './validate.js';

async function prime(query) {
  validate(query);

  const display = (await si.graphics()).displays[0];
  const { resolutionX } = display;

  const browser = await chromium.launch({
    headless: false,
    args: [`--window-position=${resolutionX / 2},0`]
  });
  const context = await browser.newContext();

  const page = await context.newPage();
  await page.goto('https://www.dmv.ca.gov/wasapp/ipp2/initPers.do');
  await page.click('#btnContinue');
  await page.waitForNavigation();

  await page.selectOption('select[name="vehicleType"]', 'AUTO');
  await page.click('#plateDiv_R');
  await delay(2000);

  await page.click('#plateChar0');
  await delay(500);

  for (const character of query) {
    await delay(300);
    await page.keyboard.type(character);
  }

  return { browser, context, page };
}

function delay(time) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

export default prime;