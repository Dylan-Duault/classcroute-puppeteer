const puppeteer = require('puppeteer');
require('dotenv').config();

const screenshot = 'screen.png';
(async () => {

    const browser = await puppeteer.launch({
        headless: false, // The browser is visible
        ignoreHTTPSErrors: true,
        defaultViewport: null,
        args: [`--window-size=1920,1080`],
    });

    const page = await browser.newPage()
    await page.goto('https://www.classcroute.com/');

    await page.waitForSelector("[title='Mon compte']");
    await page.click('[title="Mon compte"]');

    await page.waitForSelector('[name="flapLoginEmail"]');

    await page.type('[name="flapLoginEmail"]', process.env.CLASSCROUTE_USER);
    await page.type('[name="flapLoginPassword"]', process.env.CLASSCROUTE_PASSWORD);
    await page.keyboard.down("Enter");

    await page.waitForNavigation();

    const logged = await browser.newPage()
    await logged.goto("https://www.classcroute.com/product/menu-sandwich", {
        waitUntil: 'networkidle2'
    });

    await logged.waitForSelector('.product-card-wrapper');

    await logged.screenshot({path: screenshot})

    await clickOnArticleWithText(process.env.SANDWITCH, logged);
    await logged.waitFor(500);
    await clickOnArticleWithText(process.env.DRINK, logged);
    await logged.waitFor(500);
    await clickOnArticleWithText(process.env.DESSERT, logged);

    await clickOnElementFromText('a', 'Commander', logged);
    await logged.waitForNavigation({waitUntil: 'networkidle2'});

    await clickOnElementFromText('a', 'Continuer', logged);
    await logged.waitForNavigation({waitUntil: 'networkidle2'});
    // await logged.waitFor(3000);

    let hourSelect = await logged.$x('//div[contains(@class, "order-tunnel-container-content-addresses-wrapper-slot-hour")]/*/option[contains(text(), "' + process.env.TIME_OF_DELIVERY + '")]/parent::*');
    let hourOption = await logged.$x('//div[contains(@class, "order-tunnel-container-content-addresses-wrapper-slot-hour")]/*/option[contains(text(), "' + process.env.TIME_OF_DELIVERY + '")]');

    // use manually trigger change event
    await logged.evaluate((hourOption, hourSelect) => {
        console.log(hourOption);
        hourOption.selected = true;
        const event = new Event('change', {bubbles: true});
        hourSelect.dispatchEvent(event);
    }, hourOption[0], hourSelect[0]);

    await clickOnElementFromText('button', 'Valider', logged, 1);
    await logged.waitForNavigation({waitUntil: 'networkidle2'});

    await logged.evaluate(() => document.querySelector('[id="meanpayment4"]').click());
    await logged.evaluate(() => document.querySelector('[ng-model="cgv"]').click());
    await logged.evaluate(() => document.querySelector('[ng-model="cgv"]').click());

    const submit = await logged.$x('//div[contains(@class, "order-tunnel-container-content-payment-control")]/button');

    if (submit.length > 0 && process.env.CAN_BUY === true) {
        await submit[0].click();
        await logged.waitForNavigation({waitUntil: 'networkidle2'});
    } else {
        console.warn('The submit button could not be clicked, it was not found or process.env.CAN_BUY is not set to true.')
    }

    await logged.screenshot({path: screenshot, fullPage: true});

    browser.close();
})();

async function clickOnElementFromText(element, text, page, nth = 0) {
    const linkHandlers = await page.$x("//" + element + "[contains(text(), '" + text + "')]");

    if (linkHandlers.length > 0) {
        await linkHandlers[nth].click();
    } else {
        throw new Error("Could not find element" + element + " with text " + text + " in the DOM");
    }
}

async function clickOnArticleWithText(text, page) {
    const linkHandlers = await page.$x("//a[contains(text(), '" + text + "')]/parent::*/parent::*/parent::*/div/div/button")

    if (linkHandlers.length > 0) {
        await linkHandlers[0].click();
    } else {
        throw new Error("Could not find " + text + " in the DOM");
    }
}