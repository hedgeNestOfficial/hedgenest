const BrevoClient = require("@getbrevo/brevo");

const brevoClient = new BrevoClient.TransactionalEmailsApi()
brevoClient.setApiKey(BrevoClient.TransactionalEmailsApiApiKeys.apiKey, process.env.brevo_api_key);

const brevo = async (userEmail, userName,html) => {
    const sendSmtpEmail = new BrevoClient.SendSmtpEmail()
    const data = {
        htmlContent: `<html><head></head><body><p>Hello ${userName} ,</p>Welcome to Hedgenest!.</p></body></html>`,
        sender: {
            email: "iyanu9491@gmail.com",
            name: " Hedgenest",
        },
        subject: "Hello from Hedgenest!",
    };
    sendSmtpEmail.to = [{
        email: userEmail
    }] 
    sendSmtpEmail.subject = data.subject
    sendSmtpEmail.htmlContent = html
    sendSmtpEmail.sender = data.sender
   
    await brevoClient.sendTransacEmail(sendSmtpEmail);
}

module.exports = {brevo}