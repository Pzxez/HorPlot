import puppeteer from 'puppeteer';

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));

    console.log("Navigating to localhost...");
    await page.goto('http://localhost:5174/');
    await new Promise(r => setTimeout(r, 2000));

    let content = await page.content();
    if (content.includes('เข้าสู่ระบบ')) {
        console.log('SUCCESS 1: Auth Screen is visible for guest. TermsModal didn\'t block guests!');
    } else if (content.includes('Terms of Service') || content.includes('ข้อตกลงและเงื่อนไขการใช้บริการ')) {
        console.log('FAILURE 1: TermsModal IS BLOCKING GUESTS!');
    } else {
        console.log('WARNING 1: Unrecognized screen loaded for guest.');
    }

    // Try to test the 'Nothing Happens' bug by signing up.
    console.log("Switching to Signup Tab...");
    const buttons = await page.$$('button');
    for (let btn of buttons) {
        let text = await page.evaluate(el => el.textContent, btn);
        if (text.includes('สมัครสมาชิก')) {
            await btn.click();
            break;
        }
    }
    await new Promise(r => setTimeout(r, 1000));

    const emailInput = await page.$('input[type="email"]');
    const passInput = await page.$('input[type="password"]');

    if (emailInput && passInput) {
        const email = `testuser_${Date.now()}@example.com`;
        console.log(`Typing email: ${email}`);
        await emailInput.type(email);
        await passInput.type('password123');

        console.log("Clicking create account...");
        const submitBtns = await page.$$('button');
        let clicked = false;
        for (let btn of submitBtns) {
            let text = await page.evaluate(el => el.textContent, btn);
            if (text.includes('สร้างบัญชีผู้ใช้')) {
                await btn.click();
                clicked = true;
                break;
            }
        }

        if (!clicked) console.log("Could not find submit button!");

        console.log("Waiting 5 seconds for Firebase auth and DB fetch...");
        await new Promise(r => setTimeout(r, 5000));

        let content2 = await page.content();
        if (content2.includes('ข้อตกลงและเงื่อนไขการใช้บริการ') || content2.includes('Terms')) {
            console.log('SUCCESS 2: TermsModal appeared successfully after signup!');

            console.log("Signing canvas...");
            const canvas = await page.$('canvas');
            if (canvas) {
                const box = await canvas.boundingBox();
                await page.mouse.move(box.x + 10, box.y + 10);
                await page.mouse.down();
                await page.mouse.move(box.x + 100, box.y + 50);
                await page.mouse.up();
            }

            console.log("Clicking checkbox...");
            const checkbox = await page.$('input[type="checkbox"]');
            if (checkbox) {
                await checkbox.click();
            }

            console.log("Scrolling modal to bottom...");
            const scrollable = await page.$('.custom-scrollbar');
            if (scrollable) {
                await page.evaluate(el => { el.scrollTop = el.scrollHeight; }, scrollable);
                await page.evaluate(el => { el.dispatchEvent(new Event('scroll')); }, scrollable);
            }

            await new Promise(r => setTimeout(r, 1000));

            console.log("Looking for Confirm button...");
            const confirmBtns = await page.$$('button');
            for (let btn of confirmBtns) {
                let text = await page.evaluate(el => el.textContent, btn);
                if (text.includes('ยืนยันและเข้าใช้งาน') || text.includes('Confirm & Start Writing')) {
                    const isDisabled = await page.evaluate(el => el.disabled, btn);
                    if (isDisabled) {
                        console.log('FAILURE 2: Confirm button is disabled! Checkbox, Canvas, or Scroll logic failed.');
                    } else {
                        console.log('Clicking Confirm button...');
                        await btn.click();
                    }
                    break;
                }
            }

            console.log("Waiting 3 seconds for server response...");
            await new Promise(r => setTimeout(r, 3000));

            const finalContent = await page.content();
            if (finalContent.includes('เลือกนิยายของคุณ') || finalContent.includes('Select Your Novel')) {
                console.log('SUCCESS 3: Modal disappeared and redirected to Dashboard!');
            } else if (finalContent.includes('ข้อตกลงและเงื่อนไขการใช้บริการ')) {
                console.log('FAILURE 3: Nothing happened! Still stuck on TermsModal.');
            } else {
                console.log('WARNING 3: Rendered something unexpected.');
            }
        } else {
            console.log('FAILURE 2: TermsModal did not appear after signup. Instead got:', content2.slice(0, 500));
        }
    } else {
        console.log("Could not find email/pass inputs.");
    }

    await browser.close();
    console.log("Test finished.");
})();
