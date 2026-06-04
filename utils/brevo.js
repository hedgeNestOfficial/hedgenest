const Brevo = require('@getbrevo/brevo')

exports.sendEmail = async (email, subject, html) => {
    try {
        const apikey = process.env.brevo_api_key;
        if (!apikey) {
            throw new Error("Brevo API key is missing");
        }

        const apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, apikey);
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = subject;
        sendSmtpEmail.to = [{ email: email }];
        sendSmtpEmail.sender = { name: process.env.BREVO_SENDER_NAME, email: process.env.BREVO_SENDER_EMAIL };
        sendSmtpEmail.htmlContent = html;
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`Email sent to: ${email}`);
    } catch (error) {
        console.log(error)
        throw new Error(`Email not sent to: ${email}`)
    }
};
