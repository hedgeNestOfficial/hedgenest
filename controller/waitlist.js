const { waitlistModel } = require("../model/waitlist");
const crypto = require("crypto");
const { sendEmail } = require("../utils/brevo");
const {
  waitlistVerificationTemplate,
  waitlistWelcomeTemplate,
} = require("../email");
const {
  renderWaitlistSuccessPage,
  renderWaitlistErrorPage,
} = require("../utils/waitlistLandingPage");

const getBackendUrl = (req) => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL;
  const host = req?.get ? req.get("host") : null;
  const protocol = req?.protocol || "http";
  if (host) return `${protocol}://${host}`;
  return "http://localhost:3333";
};

const getFrontendUrl = () => {
  return (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "https://hedge-nest.vercel.app"
  ).replace(/\/+$/, "");
};

const getFrontendReferralLink = (referralCode) => {
  const base = getFrontendUrl();
  const waitlistPath = base.endsWith("/waitlist") ? base : `${base}/waitlist`;
  return `${waitlistPath}?ref=${referralCode}`;
};

const getFrontendVerifyUrl = (token, email) => {
  const baseUrl = (
    process.env.FRONTEND_VERIFY_URL ||
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    "http://localhost:5173/"
  ).trim();

  const cleanBase = baseUrl.replace(/\/+$/, "");
  const urlPath = cleanBase.split("/").length > 3 ? cleanBase : `${cleanBase}/`;
  const separator = urlPath.includes("?") ? "&" : "?";
  return `${urlPath}${separator}token=${token}&email=${encodeURIComponent(email)}`;
};

const generateReferralCode = async () => {
  let isUnique = false;
  let code = "";
  while (!isUnique) {
    const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
    code = `HN-${randomHex}`;
    const existing = await waitlistModel.findOne({ referralCode: code });
    if (!existing) {
      isUnique = true;
    }
  }
  return code;
};

exports.joinWaitlist = async (req, res) => {
  try {
    const { firstName, lastName, email, amountRange, referralCode } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered on waitlist
    const existingWaitlistUser = await waitlistModel.findOne({
      email: normalizedEmail,
    });

    if (existingWaitlistUser) {
      if (!existingWaitlistUser.isVerified) {
        return res.status(400).json({
          success: false,
          message:
            "Email is already registered on the waitlist but not verified yet. Please check your inbox or request a new verification link.",
          isVerified: false,
        });
      }
      return res.status(400).json({
        success: false,
        message: "Email is already registered on the waitlist",
      });
    }

    // Connect to referring user if a valid referral code was provided
    let referredBy = null;
    let referredByCode = null;

    if (referralCode && typeof referralCode === "string" && referralCode.trim()) {
      const cleanRefCode = referralCode.trim();
      const referrer = await waitlistModel.findOne({ referralCode: cleanRefCode });
      if (referrer) {
        referredBy = referrer._id;
        referredByCode = referrer.referralCode;
      }
      // If code doesn't match any user, succeeds with null
    }

    const userReferralCode = await generateReferralCode();
    const referralReward = "1 USDT";
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const formattedFirstName =
      firstName.trim().charAt(0).toUpperCase() + firstName.trim().slice(1);
    const formattedLastName =
      lastName.trim().charAt(0).toUpperCase() + lastName.trim().slice(1);

    const waitlistUser = new waitlistModel({
      firstName: formattedFirstName,
      lastName: formattedLastName,
      email: normalizedEmail,
      amountRange,
      referredBy,
      referredByCode,
      referralCode: userReferralCode,
      signupBonus: 0,
      referralReward,
      referralCount: 0,
      status: "pending",
      isVerified: false,
      verificationToken,
      verificationExpires,
    });

    await waitlistUser.save();

    const referralLink = getFrontendReferralLink(userReferralCode);
    const verifyUrl = getFrontendVerifyUrl(verificationToken, normalizedEmail);

    // Send Email 1: Verification Email with frontend verify URL
    try {
      const emailHtml = waitlistVerificationTemplate({
        name: waitlistUser.firstName,
        verifyUrl,
      });
      await sendEmail(
        waitlistUser.email,
        "You’re almost in - Verify your Hedgenest waitlist spot",
        emailHtml
      );
    } catch (mailError) {
      console.warn(
        "Could not send verification email (check Brevo API key):",
        mailError.message
      );
    }

    return res.status(201).json({
      success: true,
      message:
        "Successfully joined the waitlist. We have sent a verification email to secure your spot.",
      data: {
        firstName: waitlistUser.firstName,
        email: waitlistUser.email,
        referralCode: waitlistUser.referralCode,
        referralLink,
        verifyUrl,
        referralReward: waitlistUser.referralReward,
        referredBy: waitlistUser.referredBy,
        referredByCode: waitlistUser.referredByCode,
        isVerified: false,
        verificationToken,
      },
    });
  } catch (error) {
    console.error("Waitlist registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Error joining waitlist",
      error: error.message,
    });
  }
};

exports.verifyWaitlistEmail = async (req, res) => {
  const isHtmlRequest =
    req.method === "GET" &&
    (!req.headers.accept || !req.headers.accept.includes("application/json"));

  try {
    const token = req.body?.token || req.query?.token;
    const email = (req.body?.email || req.query?.email || "").trim().toLowerCase();

    if (!token && !email) {
      if (isHtmlRequest) {
        return res
          .status(400)
          .send(
            renderWaitlistErrorPage({
              message: "Verification token is required.",
            })
          );
      }
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    let waitlistUser = null;

    if (token) {
      waitlistUser = await waitlistModel.findOne({ verificationToken: token });
    }

    // If token not found, check if already verified by email
    if (!waitlistUser && email) {
      const userByEmail = await waitlistModel.findOne({ email });
      if (userByEmail && userByEmail.isVerified) {
        const referralLink = getFrontendReferralLink(userByEmail.referralCode);
        const totalCount = await waitlistModel.countDocuments();

        if (isHtmlRequest) {
          return res.status(200).send(
            renderWaitlistSuccessPage({
              firstName: userByEmail.firstName,
              waitlistPosition: userByEmail.waitlistPosition || 1,
              totalWaitlistCount: totalCount,
              referralCode: userByEmail.referralCode,
              referralLink,
              signupBonus: 0,
              referralReward: userByEmail.referralReward || "1 USDT",
            })
          );
        }

        return res.status(200).json({
          success: true,
          message: "Email is already verified.",
          data: {
            firstName: userByEmail.firstName,
            email: userByEmail.email,
            waitlistPosition: userByEmail.waitlistPosition,
            totalWaitlistCount: totalCount,
            referralCode: userByEmail.referralCode,
            referralLink,
            referralReward: userByEmail.referralReward || "1 USDT",
            referralCount: userByEmail.referralCount || 0,
            isVerified: true,
          },
        });
      }
    }

    if (!waitlistUser) {
      if (isHtmlRequest) {
        return res.status(400).send(
          renderWaitlistErrorPage({
            message:
              "Invalid or expired verification link. Please request a new verification email.",
          })
        );
      }
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    if (
      waitlistUser.verificationExpires &&
      Date.now() > waitlistUser.verificationExpires
    ) {
      if (isHtmlRequest) {
        return res.status(400).send(
          renderWaitlistErrorPage({
            message:
              "This verification link has expired (valid for 24 hours). Please request a new verification email.",
          })
        );
      }
      return res.status(400).json({
        success: false,
        message:
          "Verification link has expired. Please request a new verification email.",
      });
    }

    // Mark user as verified
    waitlistUser.isVerified = true;
    waitlistUser.status = "active";
    waitlistUser.verifiedAt = new Date();
    waitlistUser.verificationToken = null;
    waitlistUser.verificationExpires = null;

    // Calculate 1-indexed waitlist position among verified users
    const priorVerifiedCount = await waitlistModel.countDocuments({
      _id: { $ne: waitlistUser._id },
      isVerified: true,
      verifiedAt: { $lte: waitlistUser.verifiedAt },
    });
    const position = priorVerifiedCount + 1;

    waitlistUser.waitlistPosition = position;
    await waitlistUser.save();

    // Option B: Increment referrer's referralCount upon email verification
    if (waitlistUser.referredBy) {
      await waitlistModel.findByIdAndUpdate(waitlistUser.referredBy, {
        $inc: { referralCount: 1 },
      });
    }

    const totalWaitlistCount = await waitlistModel.countDocuments();
    const referralLink = getFrontendReferralLink(waitlistUser.referralCode);

    // Send Email 2: Congratulations & Waitlist Spot Email
    try {
      const welcomeHtml = waitlistWelcomeTemplate({
        name: waitlistUser.firstName,
        waitlistPosition: position,
        totalWaitlistCount,
        referralCode: waitlistUser.referralCode,
        referralLink,
        signupBonus: 0,
        referralReward: waitlistUser.referralReward || "1 USDT",
      });

      await sendEmail(
        waitlistUser.email,
        `You’re in. Spot secured! 🎉 (#${position})`,
        welcomeHtml
      );
    } catch (mailError) {
      console.warn(
        "Could not send welcome email (check Brevo API key):",
        mailError.message
      );
    }

    // Render backend celebration landing page with graffiti / confetti animation
    if (isHtmlRequest) {
      const successHtml = renderWaitlistSuccessPage({
        firstName: waitlistUser.firstName,
        waitlistPosition: position,
        totalWaitlistCount,
        referralCode: waitlistUser.referralCode,
        referralLink,
        signupBonus: 0,
        referralReward: waitlistUser.referralReward || "1 USDT",
      });
      return res.status(200).send(successHtml);
    }

    // JSON response for API clients
    return res.status(200).json({
      success: true,
      message: "Email verified successfully! Your waitlist spot is secured.",
      data: {
        firstName: waitlistUser.firstName,
        email: waitlistUser.email,
        waitlistPosition: position,
        totalWaitlistCount,
        referralCode: waitlistUser.referralCode,
        referralLink,
        referralReward: waitlistUser.referralReward || "1 USDT",
        referralCount: waitlistUser.referralCount || 0,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Waitlist email verification error:", error);
    if (isHtmlRequest) {
      return res
        .status(500)
        .send(
          renderWaitlistErrorPage({ message: "An unexpected error occurred." })
        );
    }
    return res.status(500).json({
      success: false,
      message: "Error verifying waitlist email",
      error: error.message,
    });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const waitlistUser = await waitlistModel.findOne({ email: normalizedEmail });

    if (!waitlistUser) {
      return res.status(404).json({
        success: false,
        message: "Email not found on the waitlist",
      });
    }

    if (waitlistUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "This email address is already verified.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    waitlistUser.verificationToken = verificationToken;
    waitlistUser.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await waitlistUser.save();

    const verifyUrl = getFrontendVerifyUrl(verificationToken, normalizedEmail);

    try {
      const emailHtml = waitlistVerificationTemplate({
        name: waitlistUser.firstName,
        verifyUrl,
      });
      await sendEmail(
        waitlistUser.email,
        "You’re almost in - Verify your Hedgenest waitlist spot",
        emailHtml
      );
    } catch (mailError) {
      console.warn(
        "Could not send verification email (check Brevo API key):",
        mailError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Verification email resent successfully.",
      data: {
        email: waitlistUser.email,
        verificationToken,
      },
    });
  } catch (error) {
    console.error("Resend waitlist verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Error resending verification email",
      error: error.message,
    });
  }
};

