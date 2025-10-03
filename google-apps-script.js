// Google Apps Script for Lulu-K.com Forms Handler
// Copy this code to Google Apps Script Editor
// Deploy as Web App with "Anyone" access

const SHEET_ID = '1EoqYXiIDOgkYJ0-WMiz7mJRYFnyHYwPnA0IcvtwGzBA';
const EMAIL_TO = 'lulu.kitchen.il@gmail.com';

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Log the submission
    logToSheet(data);

    // Send email based on type
    if (data.type === 'order') {
      sendOrderEmail(data);
    } else if (data.type === 'contact') {
      sendContactEmail(data);
    } else if (data.type === 'review') {
      sendReviewEmail(data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'נשלח בהצלחה' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'API is running' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function logToSheet(data) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet;

  if (data.type === 'order') {
    sheet = ss.getSheetByName('Orders') || ss.insertSheet('Orders');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['תאריך', 'שם', 'טלפון', 'מייל', 'עיר', 'כתובת', 'תאריך משלוח', 'שעת משלוח', 'אמצעי תשלום', 'פריטים', 'סכום', 'הערות']);
    }

    const items = data.cartItems.map(item =>
      `${item.menuItem.name_he} x${item.quantity} (${item.menuItem.price * item.quantity}₪)`
    ).join(', ');

    sheet.appendRow([
      new Date().toLocaleString('he-IL'),
      data.orderDetails.phone,
      data.orderDetails.phone,
      data.orderDetails.email,
      data.orderDetails.city,
      data.orderDetails.address,
      data.orderDetails.deliveryDate,
      data.orderDetails.deliveryTime,
      data.orderDetails.paymentMethod,
      items,
      data.total + '₪',
      data.orderDetails.notes || ''
    ]);

  } else if (data.type === 'contact') {
    sheet = ss.getSheetByName('Contact') || ss.insertSheet('Contact');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['תאריך', 'שם', 'טלפון', 'מייל', 'תאריך מועדף', 'שעה מועדפת', 'הודעה']);
    }

    sheet.appendRow([
      new Date().toLocaleString('he-IL'),
      data.name,
      data.phone,
      data.email || '',
      data.preferredDate || '',
      data.preferredTime || '',
      data.message
    ]);

  } else if (data.type === 'review') {
    sheet = ss.getSheetByName('Reviews') || ss.insertSheet('Reviews');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['תאריך', 'שם', 'מייל', 'דירוג', 'המלצה עברית', 'המלצה אנגלית']);
    }

    sheet.appendRow([
      new Date().toLocaleString('he-IL'),
      data.name,
      data.email || '',
      data.rating,
      data.reviewHe || '',
      data.reviewEn || ''
    ]);
  }
}

function sendOrderEmail(data) {
  const items = data.cartItems.map(item => {
    const addOns = item.selectedAddOns && item.selectedAddOns.length > 0
      ? '\n  תוספות: ' + item.selectedAddOns.map(a => `${a.name_he} (+${a.price}₪)`).join(', ')
      : '';
    return `• ${item.menuItem.name_he} x${item.quantity} - ${(item.menuItem.price * item.quantity)}₪${addOns}`;
  }).join('\n');

  const subject = `הזמנה חדשה מ-${data.orderDetails.phone}`;
  const body = `
הזמנה חדשה התקבלה באתר!

📞 פרטי התקשרות:
טלפון: ${data.orderDetails.phone}
מייל: ${data.orderDetails.email}

📍 פרטי משלוח:
עיר: ${data.orderDetails.city}
כתובת: ${data.orderDetails.address}
תאריך: ${data.orderDetails.deliveryDate}
שעה: ${data.orderDetails.deliveryTime}

💳 אמצעי תשלום: ${data.orderDetails.paymentMethod}

🛒 פריטים:
${items}

💰 סיכום:
סכום ביניים: ${data.subtotal}₪
משלוח: ${data.shipping}₪
סה"כ: ${data.total}₪

${data.orderDetails.notes ? '📝 הערות:\n' + data.orderDetails.notes : ''}

---
נשלח מאתר Lulu-K.com
  `.trim();

  MailApp.sendEmail({
    to: EMAIL_TO,
    subject: subject,
    body: body
  });
}

function sendContactEmail(data) {
  const subject = `הודעת יצירת קשר מ-${data.name}`;
  const body = `
הודעת יצירת קשר חדשה התקבלה באתר!

📞 פרטי יצירת קשר:
שם: ${data.name}
טלפון: ${data.phone}
${data.email ? 'מייל: ' + data.email : ''}

${data.preferredDate ? '📅 תאריך מועדף: ' + data.preferredDate : ''}
${data.preferredTime ? '⏰ שעה מועדפת: ' + data.preferredTime : ''}

💬 הודעה:
${data.message}

---
נשלח מאתר Lulu-K.com
  `.trim();

  MailApp.sendEmail({
    to: EMAIL_TO,
    subject: subject,
    body: body
  });
}

function sendReviewEmail(data) {
  const subject = `המלצה חדשה מ-${data.name} - ${data.rating} כוכבים`;
  const body = `
המלצה חדשה התקבלה באתר!

👤 שם: ${data.name}
${data.email ? '📧 מייל: ' + data.email : ''}
⭐ דירוג: ${data.rating}/5

📝 המלצה (עברית):
${data.reviewHe || 'לא צוין'}

📝 המלצה (אנגלית):
${data.reviewEn || 'לא צוין'}

---
נשלח מאתר Lulu-K.com
  `.trim();

  MailApp.sendEmail({
    to: EMAIL_TO,
    subject: subject,
    body: body
  });
}
