const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 1,
    args: ["--disable-notifications", "--start-fullscreen"]
  });
  const page = await browser.newPage();

  await page.goto('https://www.facebook.com/')
  await page.setViewport({ width: 1366, height: 768 });
  await page.type("#email", "hamza.ahmed.qbatch@gmail.com");
  await page.type("#pass", "Hamza@ahmed");
  await page.click('._6ltg > button')

  await new Promise(resolve => setTimeout(resolve, 2000));

  await autoScroll(page)

  await new Promise(resolve => setTimeout(resolve, 5000));

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

      }, 100);
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
