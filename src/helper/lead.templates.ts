export function buildInspectionEmail(input: {
  clientName: string;
  scheduledAt: Date;
  location: string;
  notes?: string;
  isReschedule?: boolean;
}): string {
  const formattedDate = input.scheduledAt.toLocaleString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const introText = input.isReschedule
    ? "Your property inspection has been rescheduled. Here are the updated details:"
    : "Your property inspection has been booked. Here are the details:";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 40px 20px;">
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 570px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <tr>
          <td style="padding: 40px 40px 0 40px; text-align: center;">
            <span style="font-size: 24px; font-weight: 800; color: #1f2937; letter-spacing: -0.025em;">Belhomz</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px 40px 40px 40px;">
            <p style="font-size: 16px; line-height: 24px; color: #1f2937; font-weight: 600; margin: 0 0 16px 0;">
              Hi ${input.clientName},
            </p>
            <p style="font-size: 15px; line-height: 24px; color: #4b5563; margin: 0 0 24px 0;">
              ${introText}
            </p>
            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 32px 0; background-color: #f9fafb; border-radius: 6px;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="font-size: 14px; line-height: 22px; color: #1f2937; margin: 0 0 8px 0;">
                    <strong>Date &amp; Time:</strong> ${formattedDate}
                  </p>
                  <p style="font-size: 14px; line-height: 22px; color: #1f2937; margin: 0 0 8px 0;">
                    <strong>Location:</strong> ${input.location}
                  </p>
                  ${
                    input.notes
                      ? `<p style="font-size: 14px; line-height: 22px; color: #1f2937; margin: 0;">
                    <strong>Notes:</strong> ${input.notes}
                  </p>`
                      : ""
                  }
                </td>
              </tr>
            </table>
            <p style="font-size: 14px; line-height: 22px; color: #6b7280; margin: 0;">
              If you have any questions or need to reschedule, please contact your agent directly.
            </p>
          </td>
        </tr>
      </table>
      <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 570px; margin-top: 24px;">
        <tr>
          <td style="text-align: center; font-size: 12px; color: #9ca3af; line-height: 18px;">
            &copy; ${new Date().getFullYear()} Belhomz. All rights reserved.
          </td>
        </tr>
      </table>
    </div>
  `;
}