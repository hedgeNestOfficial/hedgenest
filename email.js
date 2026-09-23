exports.emailTemplate = (name, otp)=>{
return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>your otp?</title>
<body>
    <div class="main-section">
        <div class="upper-div">
            <div class="upper-div-1">
                <h1>Email OTP Verification</h1>
                <h3>Hello, ${name}</h3>
                <p>Below is your one time passcode that you need to use to complete your authentication. The verification code will be valid for 7 minutes. Please do not share this code with anyone.</p>
            </div>
            <div class="upper-div-2">
                <h2> ${otp} </h2>
            </div>
            <div class="upper-div-3">
                <p>If you are having any issues with your account, please don't hesitate to contact us.</p>
                <p>Enjoy the smartest way to protect your money from inflation, save consistently and access beginner-friendly investments; all in one place!</p>
            </div>
        </div>
        <div class="downer-div">
            <p>If you would like to know more about our services, please also refer to Helpcenter</p>
            <p>Hedgenest Team</p>
        </div>
    </div>
</body>
</html>`
}


exports.transactionPinTemplate = (name, otp)=>{
return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>your otp?</title>
<body>
    <div class="main-section">
        <div class="upper-div">
            <div class="upper-div-1">
                <h1>OTP Verification</h1>
                <h3>Hello, ${name}</h3>
                <p>Below is your one time passcode that you need to verify your email. The verification code will be valid for 7 minutes. Please do not share this code with anyone.</p>
            </div>
            <div class="upper-div-2">
                <h2> ${otp} </h2>
            </div>
            <div class="upper-div-3">
                <p>Please ignore if you didn't request for it, and cheange your password for more security.</p>
            </div>
        </div>
    </div>
</body>
</html>`
}


exports.resetPasswordTemplate = (name, otp)=> {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your HedgeNest Password</title>
    <style>
        /* Mobile Styles */
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .otp-code { font-size: 32px !important; letter-spacing: 6px !important; }
            .content { padding: 30px 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <!-- Main Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                        
                        <!-- Brand Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                                <h1 style="margin: 0; color: #ddad0f; font-size: 24px; font-weight: 800; letter-spacing: 1px;">HedgeNest</h1>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">
                                <h2 style="margin: 0 0 15px; font-size: 22px; font-weight: 700; color: #1a1a1a;">Password Reset</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 25px; color: #666666;">
                                    Hi ${name}, we received a request to reset your password. Use the code below to proceed:
                                </p>
                                
                                <!-- OTP Box -->
                                <div style="background-color: #f8fafc; border: 2px dashed #bebb11; border-radius: 12px; padding: 25px; margin: 20px 0;">
                                    <span class="otp-code" style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: bold; letter-spacing: 10px; color: #1a1a1a; display: block;">
                                        ${otp}
                                    </span>
                                </div>

                                <p style="font-size: 14px; color: #999999; margin-top: 25px; line-height: 1.4;">
                                    This code is valid for <strong>7 minutes</strong>. <br>
                                    If you didn't request this, please ignore this email or contact support if you're concerned about your account security.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #fafafa; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0;">&copy; 2026 HedgeNest App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #111111; text-decoration: none;">Help Center</a> • 
                                    <a href="#" style="color: #090908; text-decoration: none;">Security Tips</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

    `
}


exports.resetPasswordSuccessfulTemplate = (name)=> {
    return `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Successful</title>
    <style>
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .content { padding: 30px 20px !important; }
            .cta-button { width: 100% !important; box-sizing: border-box; text-align: center; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                                <h1 style="margin: 0; color: #e2c60f; font-size: 24px; font-weight: 800; letter-spacing: 1px;">HEDGENEST</h1>
                            </td>
                        </tr>

                        <!-- Success Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">
                                <!-- Success Icon (Simple Circle Check) -->
                                <div style="margin-bottom: 20px; font-size: 50px; color: #dde400;">✓</div>
                                
                                <h2 style="margin: 0 0 15px; font-size: 22px; font-weight: 700; color: #1a1a1a;">Password Reset Successful</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 30px; color: #666666;">
                                    Hi ${name}, your password for <strong>HEDGENEST</strong> has been successfully updated. You can now log back into your account using your new credentials.
                                </p>
                                
                                <!-- CTA Button -->
                                <a href="https://hedgenest.com" class="cta-button" style="display: inline-block; background-color: #d7e91b; color: #ffffff; padding: 16px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                    Log In to HEDGENEST
                                </a>

                                <!-- Security Warning -->
                                <p style="font-size: 13px; color: #999999; margin-top: 40px; line-height: 1.4; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                                    <strong>Didn't do this?</strong> If you did not reset your password, please secure your account immediately by contacting our support team.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #fafafa; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0;">&copy; 2026 HEDGENEST App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #b4c30d; text-decoration: none;">Security Settings</a> • 
                                    <a href="#" style="color: #b2d01b; text-decoration: none;">Contact Support</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

    `
}

exports.resetPinTemplate = (name, otp)=> {
    return `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your HedgeNest Pin</title>
    <style>
        /* Mobile Styles */
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .otp-code { font-size: 32px !important; letter-spacing: 6px !important; }
            .content { padding: 30px 20px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <!-- Main Card -->
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 500px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
                        
                        <!-- Brand Header -->
                        <tr>
                            <td align="center" style="padding: 30px 20px; background-color: #ffffff; border-bottom: 1px solid #eeeeee;">
                                <h1 style="margin: 0; color: #ddad0f; font-size: 24px; font-weight: 800; letter-spacing: 1px;">HedgeNest</h1>
                            </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                            <td class="content" style="padding: 40px; text-align: center; color: #333333;">
                                <h2 style="margin: 0 0 15px; font-size: 22px; font-weight: 700; color: #1a1a1a;">Change Pin</h2>
                                <p style="font-size: 16px; line-height: 1.5; margin: 0 0 25px; color: #666666;">
                                    Hi ${name}, we received a request to change your pin. Use the code below to proceed:
                                </p>
                                
                                <!-- OTP Box -->
                                <div style="background-color: #f8fafc; border: 2px dashed #bebb11; border-radius: 12px; padding: 25px; margin: 20px 0;">
                                    <span class="otp-code" style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: bold; letter-spacing: 10px; color: #1a1a1a; display: block;">
                                        ${otp}
                                    </span>
                                </div>

                                <p style="font-size: 14px; color: #999999; margin-top: 25px; line-height: 1.4;">
                                    This code is valid for <strong>7 minutes</strong>. <br>
                                    If you didn't request this, please ignore this email or contact support if you're concerned about your account security.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 25px; background-color: #fafafa; font-size: 12px; color: #aaaaaa;">
                                <p style="margin: 0;">&copy; 2026 HedgeNest App. All rights reserved.</p>
                                <p style="margin: 8px 0 0;">
                                    <a href="#" style="color: #111111; text-decoration: none;">Help Center</a> • 
                                    <a href="#" style="color: #090908; text-decoration: none;">Security Tips</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>

    `
}

exports.waitlistVerificationTemplate = ({ name, verifyUrl }) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Hedgenest Waitlist Email</title>
    <style>
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .content { padding: 28px 20px !important; }
            .verify-button { width: 100% !important; box-sizing: border-box; text-align: center; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.06);">
                        
                        <!-- Header / Brand -->
                        <tr>
                            <td align="center" style="padding: 32px 20px 24px; background: linear-gradient(135deg, #111827 0%, #1e293b 100%);">
                                <h1 style="margin: 0; color: #ddad0f; font-size: 26px; font-weight: 800; letter-spacing: 1px;">HedgeNest</h1>
                                <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">SMART SAVINGS &amp; INVESTMENT</p>
                            </td>
                        </tr>

                        <!-- Main Content -->
                        <tr>
                            <td class="content" style="padding: 40px 32px; text-align: left; color: #1e293b;">
                                <div style="display: inline-block; background-color: #fef3c7; color: #b45309; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px;">
                                    Waitlist Verification
                                </div>
                                <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.3;">
                                    You’re almost in
                                </h2>
                                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 14px; color: #475569;">
                                    Hi <strong>${name}</strong>,
                                </p>
                                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 16px; color: #475569;">
                                    Thanks for joining the <strong>Hedgenest</strong> waitlist.
                                </p>
                                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 28px; color: #475569;">
                                    We need you to verify your email address to secure your spot and start protecting what matters.
                                </p>

                                <!-- Button CTA -->
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 10px 0 24px;">
                                    <tr>
                                        <td align="center">
                                            <a href="${verifyUrl}" class="verify-button" style="display: inline-block; background: linear-gradient(135deg, #ddad0f 0%, #ca8a04 100%); color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(221, 173, 15, 0.35); text-align: center;">
                                                Verify my email
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Expiry & Fallback link -->
                                <p style="font-size: 13px; color: #64748b; margin: 24px 0 8px; line-height: 1.5;">
                                    Button not working? Copy and paste this link into your browser:
                                </p>
                                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; word-break: break-all; font-size: 12px; color: #64748b; font-family: monospace;">
                                    <a href="${verifyUrl}" style="color: #ca8a04; text-decoration: none;">${verifyUrl}</a>
                                </div>

                                <p style="font-size: 13px; color: #94a3b8; margin: 24px 0 0; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px;">
                                    This verification link is valid for 24 hours. If you didn't request to join the Hedgenest waitlist, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                                <p style="margin: 0;">&copy; 2026 HedgeNest App. All rights reserved.</p>
                                <p style="margin: 6px 0 0;">
                                    Enjoy the smartest way to protect your money from inflation and grow your wealth.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`;
};

exports.waitlistWelcomeTemplate = ({ name, waitlistPosition, totalWaitlistCount, referralCode, referralLink, signupBonus = 0, referralReward = "1 USDT" }) => {
  const formattedTotal = totalWaitlistCount ? Number(totalWaitlistCount).toLocaleString() : waitlistPosition;
  const rewardDisplay = typeof referralReward === "number" ? `${referralReward} USDT` : referralReward;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>You’re in. Spot secured! 🎉 - HedgeNest</title>
    <style>
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0px !important; }
            .content { padding: 28px 20px !important; }
            .stats-col { width: 100% !important; display: block !important; margin-bottom: 12px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f7f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <center>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f7f6;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="container" style="width: 100%; max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 20px rgba(0,0,0,0.06);">
                        
                        <!-- Header -->
                        <tr>
                            <td align="center" style="padding: 32px 20px 24px; background: linear-gradient(135deg, #111827 0%, #1e293b 100%);">
                                <h1 style="margin: 0; color: #ddad0f; font-size: 26px; font-weight: 800; letter-spacing: 1px;">HedgeNest</h1>
                                <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px; font-weight: 500; letter-spacing: 0.5px;">SMART SAVINGS &amp; INVESTMENT</p>
                            </td>
                        </tr>

                        <!-- Main Body -->
                        <tr>
                            <td class="content" style="padding: 40px 32px; text-align: center; color: #1e293b;">
                                <!-- Success Checkmark -->
                                <div style="display: inline-block; width: 64px; height: 64px; line-height: 64px; background: #ecfdf5; border: 2px solid #10b981; border-radius: 50%; color: #10b981; font-size: 30px; font-weight: bold; margin-bottom: 16px;">
                                    ✓
                                </div>
                                <h2 style="margin: 0 0 10px; font-size: 24px; font-weight: 800; color: #0f172a;">
                                    You’re in. Spot secured! 🎉
                                </h2>
                                <p style="font-size: 15px; line-height: 1.6; margin: 0 0 28px; color: #64748b;">
                                    Hi <strong>${name}</strong>, your email is verified and your spot is officially locked in.
                                </p>

                                <!-- Position Hero Card -->
                                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; padding: 28px 20px; color: #ffffff; margin-bottom: 28px; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.15);">
                                    <p style="margin: 0; color: #ddad0f; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Your waitlist position</p>
                                    <h1 style="margin: 8px 0; font-size: 54px; font-weight: 900; color: #ffffff; letter-spacing: -1px;">#${waitlistPosition}</h1>
                                    <p style="margin: 0 0 12px; color: #94a3b8; font-size: 14px;">Out of <strong>${formattedTotal}</strong> people on the waitlist.</p>
                                    <p style="margin: 12px 0 0; color: #cbd5e1; font-size: 13px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-style: italic;">
                                        We’ll reach out when <strong>HedgeNest</strong> is ready for you.
                                    </p>
                                </div>

                                <!-- Referral Reward Card -->
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 28px;">
                                    <tr>
                                        <td class="stats-col" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: center;">
                                            <p style="margin: 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">Referral Reward</p>
                                            <h3 style="margin: 6px 0 0; font-size: 22px; color: #ca8a04; font-weight: 800;">${rewardDisplay} <span style="font-size: 13px; color: #64748b; font-weight: 400;">Raffle Entry / Friend</span></h3>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Move Up Section -->
                                <div style="background-color: #fffbeb; border: 1.5px dashed #fde68a; border-radius: 14px; padding: 24px; text-align: left; margin-bottom: 28px;">
                                    <h3 style="margin: 0 0 8px; font-size: 16px; color: #92400e; font-weight: 700;">
                                        🚀 Want to win 1 USDT & move up the waitlist?
                                    </h3>
                                    <p style="margin: 0 0 16px; font-size: 13px; color: #78350f; line-height: 1.5;">
                                        Share your personal referral link with friends. For every friend who joins using your link, you get an extra entry into our exclusive <strong>1 USDT</strong> raffle draw. The more friends you refer, the higher your chances of winning!
                                    </p>
                                    
                                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e;">Your Referral Code:</p>
                                    <div style="background-color: #ffffff; border: 1px solid #fcd34d; border-radius: 8px; padding: 10px; font-size: 18px; font-weight: 800; font-family: monospace; color: #0f172a; text-align: center; letter-spacing: 2px; margin-bottom: 12px;">
                                        ${referralCode}
                                    </div>

                                    <p style="margin: 0 0 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #92400e;">Your Referral Link:</p>
                                    <div style="background-color: #ffffff; border: 1px solid #fcd34d; border-radius: 8px; padding: 10px; font-size: 12px; word-break: break-all; color: #b45309; text-align: center;">
                                        <a href="${referralLink}" style="color: #b45309; text-decoration: underline; font-weight: 600;">${referralLink}</a>
                                    </div>
                                </div>

                                <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
                                    We'll notify you as soon as your access is ready. Stay tuned for early launch invites!
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td align="center" style="padding: 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
                                <p style="margin: 0;">&copy; 2026 HedgeNest App. All rights reserved.</p>
                                <p style="margin: 6px 0 0;">
                                    <a href="#" style="color: #ca8a04; text-decoration: none;">Help Center</a> • 
                                    <a href="#" style="color: #ca8a04; text-decoration: none;">Terms of Service</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`;
};