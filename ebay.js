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

  await autoScroll(page)

  await new Promise(resolve => setTimeout(resolve, 5000));
  await page.$eval('#gh-ac', el => el.value = 'oneplus');
  await page.click('#gh-btn');
  await new Promise(resolve => setTimeout(resolve, 5000));

  let links = await page.evaluate(() => {
    const elements = document.querySelectorAll('.s-item__link');
    return Array.from(elements).map(element => element.getAttribute('href')); // as you see, now this function returns array of texts instead of Array of elements
  })

  const finalData = [];

  for (let i = 1; i < links.length; i++) {
    await page.goto(links[i],{waitUntil: 'load', timeout: 0})
    await new Promise(resolve => setTimeout(resolve, 1000));
    await autoScroll(page)

    console.log(i, links.length)
    if (i <= 100) {
      let extraLinks = await page.evaluate(() => {
        const elements = document.querySelectorAll('.merch-item-tile');
        return Array.from(elements).map(element => element.getAttribute('href')); // as you see, now this function returns array of texts instead of Array of elements
      })
      console.log('before', links.length)
      links = union(links, extraLinks)
      console.log(extraLinks.length)
      console.log('after', links.length)

      var json = JSON.stringify(links);
      fs.writeFile('links.json', json, 'utf8', function (err) {
        if (err) throw err;
        console.log('list - Save');
      });
    }

    console.log(links[i], i);

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

    var outputs = specsLabels.map(function (obj, index) {
      var myobj = {};
      myobj[obj] = specsValues[index];
      return myobj;
    });

    finalData.push(Object.assign({ 'price': price ,'title': title ,'link': links[i] , ...data[0]}, ...outputs))
    var json = JSON.stringify(finalData);
    fs.writeFile('data.json', json, 'utf8', function (err) {
      if (err) throw err;
      console.log('data - save');
    });

  }


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

        new Promise(resolve => setTimeout(resolve, 1000));

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }

      }, 10);
    });
  });
}

// {
// await page.goto('https://www.traversymedia.com/');

// await autoScroll(page)

// await page.screenshot({ path: 'example.png' });
// const html = await page.content()
// console.log(html)

// const title = await page.evaluate(() => document.title)
// const innerText = await page.evaluate(()=> document.body.innerText)s

// const links = await page.evaluate(() => Array.from(document.querySelectorAll('a'), (e) => e.href))
// const courses = await page.evaluate(() =>
//   Array.from(document.querySelectorAll('.cscourse-grid  .card'), (e) => ({
//     title: e.querySelector('.card-body h3').innerText,
//     level: e.querySelector('.card-body .level').innerText,
//     link: e.querySelector('.card-footer a').href,
//   }))
// );
// console.log(courses)
// }

function checkIfDuplicateExists(arr) {
  return new Set(arr).size !== arr.length
}
