const puppeteer = require('puppeteer');
const { faker } = require('@faker-js/faker');

async function runAutomation() {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    
    for (let i = 1; i <= 10; i++) {
        console.log(Starting user application /10...);
        const page = await browser.newPage();
        
        try {
            await page.goto('http://localhost/public_html/index.php', { waitUntil: 'networkidle0' });

            const user = {
                firstName: faker.person.firstName(),
                lastName: faker.person.lastName(),
                email: faker.internet.email(),
                phone: faker.phone.number(),
                passport: faker.number.int({ min: 10000000, max: 99999999 }).toString(),
                nationality: 'United States',
            };

            let isPaymentSection = false;
            
            // Wait for initial UI
            await page.waitForSelector('.chat-messages');
            
            while (!isPaymentSection) {
                // Determine if we're at payment by looking for Razorpay/Stripe script or the payment button
                const isPayment = await page.evaluate(() => {
                    const payBtn = document.querySelector('button[onclick="initiatePayment()"]') || document.querySelector('button.payment-btn');
                    return !!payBtn;
                });

                if (isPayment) {
                    console.log(User  reached payment section.);
                    isPaymentSection = true;
                    break;
                }

                // Handle file upload requests if any
                 const fileUploadNeeded = await page.evaluate(() => {
                    const latestMsg = Array.from(document.querySelectorAll('.bot-message')).pop()?.innerText.toLowerCase() || '';
                    return latestMsg.includes('upload') || latestMsg.includes('document');
                });

                if (fileUploadNeeded) {
                   const fileInput = await page.input[type="file"];
                   if(fileInput) {
                       // Would need a dummy file here if required. For now, skipping.
                       console.log('Skipping file upload for now.');
                   }
                }


                // Check if quick replies exist
                const quickReplyBtns = await page.EOF('.suggestion-btn, .quick-reply-btn'); // Replace with actual quick reply class
                if (quickReplyBtns.length > 0) {
                    await quickReplyBtns[0].click(); // Click the first option like "Yes"
                    await new Promise(r => setTimeout(r, 1000));
                    continue;
                }
                
                // Get the last bot message text to determine what to fill
                const lastBotMsg = await page.evaluate(() => {
                    const msgs = document.querySelectorAll('.chat-message.bot .msg-bubble');
                    return msgs[msgs.length - 1]?.innerText || '';
                });

                const msgLower = lastBotMsg.toLowerCase();
                let typingText = "Test Answer";

                if (msgLower.includes('name')) typingText = ${user.firstName} ;
                else if (msgLower.includes('email')) typingText = user.email;
                else if (msgLower.includes('phone') || msgLower.includes('number')) typingText = user.phone;
                else if (msgLower.includes('passport')) typingText = user.passport;
                else if (msgLower.includes('national')) typingText = user.nationality;
                else if (msgLower.includes('country')) typingText = user.nationality;

                // Wait for the input field
                await page.waitForSelector('#msgInput', { visible: true, timeout: 5000 });
                await page.type('#msgInput', typingText);
                
                // Click send
                await page.click('#sendBtn');

                // Wait for the next bot message to appear before continuing
                await new Promise(r => setTimeout(r, 1500)); // Basic wait
            }

        } catch (error) {
            console.error(Error with user :, error.message);
        } finally {
            await page.close();
        }
    }

    console.log('All 10 applications completed.');
    await browser.close();
}

runAutomation();
