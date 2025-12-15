export function passwordResetTemplate(resetLink: string) {
  return `
    <div style="font-family: Arial, sans-serif; background: #f6f6f6; padding: 32px;">
      <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px 24px;">
        <h2 style="color: #d7263d; text-align: center; margin-bottom: 16px;">Recupera tu contraseña</h2>
        <p style="font-size: 16px; color: #333; text-align: center;">Hola,<br>Recibimos una solicitud para restablecer tu contraseña.<br>Haz clic en el botón de abajo para continuar:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetLink}" style="background: #d7263d; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 16px; font-weight: bold; display: inline-block;">Restablecer contraseña</a>
        </div>
        <p style="font-size: 13px; color: #888; text-align: center;">Si no solicitaste este cambio, puedes ignorar este correo.<br>El enlace expirará en 1 hora.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
        <p style="font-size: 12px; color: #bbb; text-align: center;">Rápido y Sabroso &copy; 2025</p>
      </div>
    </div>
  `;
}
