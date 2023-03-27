const puppeteer = require('puppeteer');
const union = require('lodash/union')
var fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 1,
    args: ["--disable-notifications", "--start-fullscreen"]
  });
  const page = await browser.newPage();

  await page.goto('https://www.ebay.com/', { timeout: 0 })

  await page.setViewport({ width: 1366, height: 768 });

  await new Promise(resolve => setTimeout(resolve, 2000));

  await new Promise(resolve => setTimeout(resolve, 5000));
  await page.$eval('#gh-ac', el => el.value = 'oneplus');
  await page.click('#gh-btn');
  await new Promise(resolve => setTimeout(resolve, 5000));
  await autoScroll(page)

  var finalData = []

  var links = await page.evaluate(() => {
    const elements = document.querySelectorAll('.s-item__link');
    return Array.from(elements).map(element => element.getAttribute('href')); // as you see, now this function returns array of texts instead of Array of elements
  })

  for (let i = 0; i < 20; i += 1) {

    await new Promise(resolve => setTimeout(resolve, 5000));
    await autoScroll(page)

    let linkTmp = await page.evaluate(() => {
      const elements = document.querySelectorAll('.s-item__link');
      return Array.from(elements).map(element => element.getAttribute('href')); // as you see, now this function returns array of texts instead of Array of elements
    })

    links.push.apply(links, linkTmp)
    await page.click(
      '.pagination__next'
    );
  }

  links = [...new Set(links)]

  var json = JSON.stringify(links);
  fs.writeFile('links_final_version.json', json, 'utf8', function (err) {
    if (err) throw err;
    console.log('list - Save');
  });

  for (let i = 1; i < links.length; i += 1) {
    try {
      await page.goto(links[i]);
      await new Promise(resolve => setTimeout(resolve, 5000));
      await autoScroll(page)

      const price = await page.$eval('.x-price-primary', a => a.innerText)
      const title = await page.$eval('.x-item-title__mainTitle', a => a.innerText)

      const specsLabels = await page.evaluate(() => {
        const elements = document.querySelectorAll('.ux-labels-values__labels');
        return Array.from(elements).map(element => element.innerText); // as you see, now this function returns array of texts instead of Array of elements
      })
      const specsValues = await page.evaluate(() => {
        const elements = document.querySelectorAll('.ux-labels-values__values');
        return Array.from(elements).map(element => element.innerText); // as you see, now this function returns array of texts instead of Array of elements
      })

      var result = {};
      specsLabels.forEach((key, i) => result[key] = specsValues[i]);

      result['title'] = title;
      result['price'] = price;
      finalData.push(result)
    } catch (error) {
      console.log(links[i], i, error)
    }
  }
  console.log(finalData)
  var json = JSON.stringify(finalData);
  fs.writeFile('data_final_version.json', json, 'utf8', function (err) {
    if (err) throw err;
    console.log('data - save');
  });
  await browser.close();
})();

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      var totalHeight = 0;
      var distance = 100;

      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        new Promise(resolve => setTimeout(resolve, 2000));

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }

      }, 10);
    });
  });
}
