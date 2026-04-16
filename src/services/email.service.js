const { Resend } = require("resend");
const { SMTPConfig } = require("../config/config");

class EmailService {
  #resend;

  constructor() {
    try {
      const apiKey = process.env.RESEND_API_KEY || SMTPConfig.resendApiKey ;

      if (!apiKey || apiKey === "undefined") {
        console.error("CRITICAL: Resend API Key is missing!");
      }

      this.#resend = new Resend(apiKey);
      console.log("Resend Email Service initialized...");
    } catch (exception) {
      console.error("Initialization Error:", exception);
      throw {
        message: "Resend initialization failed",
        status: "RESEND_INIT_ERROR",
      };
    }
  }

  sendEmail = async ({
    to,
    sub,
    msg,
    cc = null,
    bcc = null,
    attachments = null,
  }) => {
    try {
      const payload = {
        from: "onboarding@resend.dev", 
        to:"bishwoshah.it@gmail.com",
        subject: sub,
        html: msg,
      };

      if (cc) payload.cc = cc;
      if (bcc) payload.bcc = bcc;
      
      if (attachments) payload.attachments = attachments;

      const { data, error } = await this.#resend.emails.send(payload);

      if (error) {
        console.error("Resend API returned an error:", error);
        throw error;
      }

      return data;
    } catch (exception) {
      console.error("Email Service Error Details:", exception);
      throw {
        message: exception.message || "Email sending failed",
        status: "EMAIL_SENDING_ERROR",
      };
    }
  };
}

const emailSvc = new EmailService();
module.exports = emailSvc;