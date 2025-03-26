import payloadConfig from "@payload-config";
import nodemailer from "next-auth/providers/nodemailer";
import { getPayload } from "payload";

export const nodemailerProvider = nodemailer({
  server: "smtp://dummy:587",
  from: "payload-authjs@example.com",
  sendVerificationRequest: async ({ identifier, url }) => {
    const payload = await getPayload({
      config: payloadConfig,
    });

    // Send the email using payload
    await payload.sendEmail({
      to: identifier,
      subject: "Sign in to your account",
      text: `To sign in to your account, click the link below: ${url}`,
    });
  },
});
