export async function sendVerificationEmail(params: { to: string; url: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set, skipping verification email");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Drop <onboarding@resend.dev>",
      to: params.to,
      subject: "Verifica tu email en Drop",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Verifica tu email</h1>
          <p style="color: #555; line-height: 1.6;">
            Gracias por registrarte en Drop. Haz clic en el siguiente botón para verificar tu correo electrónico:
          </p>
          <a href="${params.url}"
             style="display: inline-block; margin: 24px 0; padding: 12px 24px;
                    background: #4f46e5; color: white; text-decoration: none;
                    border-radius: 8px; font-weight: 600;">
            Verificar email
          </a>
          <p style="color: #999; font-size: 14px;">
            O copia este link en tu navegador:<br>
            <span style="color: #4f46e5;">${params.url}</span>
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 32px;">
            Si no creaste una cuenta en Drop, ignora este mensaje.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("Failed to send verification email:", response.status, body);
  }
}
