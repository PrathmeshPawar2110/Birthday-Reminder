const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const schedule = require('node-schedule');

// Configuration
const FRIEND_PHONE_NUMBER = '919930582782'; // Without + or 'whatsapp:'
const FRIEND_NAME = 'Ishita';
const BIRTHDAY_DATE = '2026-02-21'; // YYYY-MM-DD

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Generate QR code for first-time authentication
client.on('qr', (qr) => {
    console.log('Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// When client is ready
client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    console.log('Birthday countdown bot started...');
    scheduleMessages();
});

// Function to calculate days until birthday
function getDaysUntilBirthday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const birthday = new Date(BIRTHDAY_DATE);
    birthday.setHours(0, 0, 0, 0);
    
    const timeDiff = birthday - today;
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    return daysLeft;
}

// Function to create message based on days left
function createMessage(daysLeft) {
    if (daysLeft === 0) {
        return `🎉🎂 HAPPY BIRTHDAY ${FRIEND_NAME.toUpperCase()}! 🎂🎉\n\nWishing you the most amazing day filled with joy, laughter, and unforgettable memories! 🎈✨`;
    } else if (daysLeft === 1) {
        return `⏰ Tomorrow is the BIG DAY, ${FRIEND_NAME}! 🎉\n\nJust 1 more day until your birthday! Get ready to celebrate! 🎂🎈`;
    } else if (daysLeft > 0) {
        return `⏰ Birthday Countdown for ${FRIEND_NAME}! ⏰\n\n🎂 ${daysLeft} days until your special day! 🎈\n\nCan't wait to celebrate with you! 🎉`;
    }
    return null; // Birthday passed
}

// Function to send birthday message
async function sendBirthdayMessage() {
    try {
        const daysLeft = getDaysUntilBirthday();
        
        if (daysLeft < 0) {
            console.log('Birthday has passed. Stopping countdown.');
            return;
        }
        
        const message = createMessage(daysLeft);
        if (!message) return;
        
        const chatId = `${FRIEND_PHONE_NUMBER}@c.us`;
        await client.sendMessage(chatId, message);
        
        console.log(`✅ Message sent! Days left: ${daysLeft}`);
        console.log(`Time: ${new Date().toLocaleString()}`);
        
    } catch (error) {
        console.error('❌ Error sending message:', error);
    }
}

// Function to send initial welcome message
async function sendWelcomeMessage() {
    try {
        const welcomeMessage = `Hi ${FRIEND_NAME} this is a Birthday Reminder Server build by me. With Love Prathmesh ❤️`;
        
        const chatId = `${FRIEND_PHONE_NUMBER}@c.us`;
        await client.sendMessage(chatId, welcomeMessage);
        
        console.log('✅ Welcome message sent!');
        console.log(`Time: ${new Date().toLocaleString()}`);
        
    } catch (error) {
        console.error('❌ Error sending welcome message:', error);
    }
}

// Schedule messages for midnight every day
function scheduleMessages() {
    // Schedule for midnight (00:00)
    const rule = new schedule.RecurrenceRule();
    rule.hour = 0;
    rule.minute = 0;
    rule.second = 0;
    
    schedule.scheduleJob(rule, () => {
        console.log('\n🕐 Midnight - Sending birthday countdown...');
        sendBirthdayMessage();
    });
    
    console.log('✅ Daily messages scheduled for midnight (00:00)');
    
    // Send initial welcome message
    console.log('\n📱 Sending welcome message now...');
    sendWelcomeMessage();
}

// Error handling
client.on('auth_failure', () => {
    console.error('Authentication failed!');
});

client.on('disconnected', (reason) => {
    console.log('Client was disconnected:', reason);
});

// Initialize the client
console.log('Starting WhatsApp Birthday Countdown Bot...');
console.log('=========================================');
client.initialize();

// Keep the process running
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    client.destroy();
    process.exit(0);
});