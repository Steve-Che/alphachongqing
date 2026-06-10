type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email] 未配置 RESEND_API_KEY / EMAIL_FROM，跳过发送");
      console.info("[email] to:", to, "subject:", subject);
    }
    return { sent: false as const, reason: "not_configured" as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[email] Resend error:", res.status, body);
    return { sent: false as const, reason: "provider_error" as const };
  }

  return { sent: true as const };
}
