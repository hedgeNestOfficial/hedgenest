const Brevo = require('@getbrevo/brevo')

exports.sendEmail = async (payload) => {
    try {
        const apikey = process.env.brevo_api_key;
        const apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apikey);
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = payload.subject;
        sendSmtpEmail.to = [{ email: payload.email }];
        sendSmtpEmail.sender = { name: process.env.BREVO_SENDER_NAME, email: process.env.BREVO_SENDER_EMAIL };
        sendSmtpEmail.htmlContent = payload.html;
        const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Email sent to: ${payload.email}`);
    } catch (error) {
        console.log(error)
        throw new Error(`Email not sent to: ${payload.email}`)
    }
};