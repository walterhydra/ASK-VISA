const puppeteer = require('puppeteer');
const { faker } = require('@faker-js/faker');

const TARGET_URL = 'http://localhost:8000/index.php'; // Adjust if your local server URL is different
const NUM_USERS = 10;

async function runChatSession(browser, userIndex) {
    console.log(`Starting session for user ${userIndex}...`);
    const page = await browser.newPage();
    
    try {
        await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        
        let paymentReached = false;
        
        // Polling loop to interact with whatever input is currently visible/active
        for (let i = 0; i < 30; i++) { // Limit iterations to prevent infinite loop
            await new Promise(r => setTimeout(r, 2000)); // Wait for chat animations
            
            // Check if we reached the payment section
            const paymentVisible = await page.evaluate(() => {
                const text = document.body.innerText.toLowerCase();
                return text.includes('payment') || text.includes('pay now') || document.querySelector('#razorpay-btn, .payment-btn') !== null;
            });
            
            if (paymentVisible) {
                console.log(`User ${userIndex} reached payment section. Stopping.`);
                paymentReached = true;
                break;
            }

            // Look for actionable inputs
            const context = await page.evaluate(() => {
                const results = { type: null, optionsText: [], lastQuestion: "" };
                
                // Get the last bot message
                const msgs = document.querySelectorAll('.bot-message, .message.bot');
                if (msgs.length > 0) {
                    results.lastQuestion = msgs[msgs.length - 1].innerText.toLowerCase();
                }

                // 1. Check for visible select options
                const options = Array.from(document.querySelectorAll('.select-option'));
                const visibleOptions = options.filter(opt => {
                    const rect = opt.getBoundingClientRect();
                    return rect.height > 0 && rect.width > 0 && !opt.classList.contains('clicked');
                });
                
                if (visibleOptions.length > 0) {
                    results.type = 'click_option';
                    results.optionsText = visibleOptions.map(o => o.innerText.trim());
                    return results;
                }
                
                // 2. Check for date input
                const dateInput = document.querySelector('#dateInput');
                const sendBtn = document.querySelector('#sendBtn');
                
                if (dateInput && dateInput.offsetParent !== null && !dateInput.disabled) {
                    results.type = 'date';
                    return results;
                }
                
                // 3. Check for text input
                const msgInput = document.querySelector('#msgInput');
                if (msgInput && msgInput.offsetParent !== null && !msgInput.disabled) {
                    results.type = 'text';
                    return results;
                }
                
                // 4. Check for file input
                const fileInput = document.querySelector('#fileInput');
                if (fileInput && fileInput.offsetParent !== null && !fileInput.disabled) {
                    results.type = 'file';
                    return results;
                }
                
                return results;
            });

            if (context.type === 'click_option') {
                 const optionsHandle = await page.$$('.select-option:not(.clicked)');
                 let clicked = false;
                 
                 // If the question is about country, look for Thailand
                 if (context.lastQuestion.includes('country') || context.lastQuestion.includes('where')) {
                     for (let j = 0; j < optionsHandle.length; j++) {
                         const text = context.optionsText[j];
                         if (text && text.toLowerCase().includes('thailand')) {
                             await optionsHandle[j].click();
                             console.log(`User ${userIndex}: Selected Thailand`);
                             clicked = true;
                             break;
                         }
                     }
                 }
                 
                 // Fallback: click the first available option
                 if (!clicked) {
                     for (const opt of optionsHandle) {
                         const isVisible = await opt.isIntersectingViewport();
                         if (isVisible) {
                             const text = await opt.evaluate(el => el.innerText);
                             await opt.click();
                             console.log(`User ${userIndex}: Clicked an option (${text})`);
                             break;
                         }
                     }
                 }
            } else if (context.type === 'date') {
                 const randomDate = '1990-05-' + Math.floor(Math.random() * 28 + 1).toString().padStart(2, '0');
                 await page.type('#dateInput', randomDate);
                 await page.click('#sendBtn');
                 console.log(`User ${userIndex}: Entered date ${randomDate}`);
            } else if (context.type === 'text') {
                 let answerText = faker.lorem.words(3);
                 if (context.lastQuestion.includes('country')) {
                     answerText = 'Thailand';
                 } else if (context.lastQuestion.includes('name')) {
                     answerText = faker.person.fullName();
                 } else if (context.lastQuestion.includes('email')) {
                     answerText = faker.internet.email();
                 } else if (context.lastQuestion.includes('passport')) {
                     answerText = faker.string.alphanumeric(8).toUpperCase();
                 }
                 
                 await page.type('#msgInput', answerText);
                 await page.click('#sendBtn');
                 console.log(`User ${userIndex}: Entered text: ${answerText}`);
            } else if (context.type === 'file') {
                 // Skip file upload if possible, or we could handle it if needed
                 console.log(`User ${userIndex}: Encountered file input - attempting to skip or placeholder`);
                 // To actually upload: await elementHandle.uploadFile('/path/to/file');
                 // For now, if there's a text fallback or skip button we'd click it
            } else {
                console.log(`User ${userIndex}: Waiting for input...`);
            }
        }
        
        if (!paymentReached) {
            console.log(`User ${userIndex} did not reach payment within limit.`);
        }
        
    } catch (e) {
        console.error(`Error for user ${userIndex}:`, e.message);
    } finally {
        await page.close();
    }
}

async function start() {
    const browser = await puppeteer.launch({ 
        headless: false, // Set to false so you can watch it
        defaultViewport: null,
        args: ['--start-maximized'] 
    });
    
    for (let i = 1; i <= NUM_USERS; i++) {
        await runChatSession(browser, i);
    }
    
    console.log('Automated 10 users completed.');
    await browser.close();
}

start();
