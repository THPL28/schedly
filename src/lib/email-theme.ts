export const EMAIL_PALETTE = {
  primary: '#6366f1',
  primaryHover: '#4f46e5',
  primarySoft: '#eef2ff',
  background: '#fbfbfc',
  surface: '#ffffff',
  foreground: '#0f172a',
  muted: '#64748b',
  mutedLight: '#f8fafc',
  border: '#e2e8f0',
  success: '#10b981',
  successSoft: '#ecfdf5',
  successBorder: '#a7f3d0',
}

type EmailAction = {
  label: string
  url: string
}

type RenderEmailLayoutOptions = {
  contentHtml: string
  description: string
  eyebrow?: string
  footerHtml?: string
  primaryAction?: EmailAction
  secondaryAction?: EmailAction
  title: string
}

export function renderEmailPanel(
  contentHtml: string,
  tone: 'default' | 'primary' | 'success' = 'default'
) {
  const backgroundByTone = {
    default: EMAIL_PALETTE.mutedLight,
    primary: EMAIL_PALETTE.primarySoft,
    success: EMAIL_PALETTE.successSoft,
  }

  const borderByTone = {
    default: EMAIL_PALETTE.border,
    primary: '#c7d2fe',
    success: EMAIL_PALETTE.successBorder,
  }

  return `
    <div style="background: ${backgroundByTone[tone]}; padding: 28px; border-radius: 24px; border: 1px solid ${borderByTone[tone]};">
      ${contentHtml}
    </div>
  `
}

export function renderEmailLayout({
  contentHtml,
  description,
  eyebrow,
  footerHtml,
  primaryAction,
  secondaryAction,
  title,
}: RenderEmailLayoutOptions) {
  return `
    <div style="background: ${EMAIL_PALETTE.background}; padding: 32px 16px; color: ${EMAIL_PALETTE.foreground}; font-family: Arial, Helvetica, sans-serif;">
      <div style="max-width: 640px; margin: 0 auto; background: ${EMAIL_PALETTE.surface}; border: 1px solid ${EMAIL_PALETTE.border}; border-radius: 32px; padding: 36px 28px; box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.08);">
        <div style="text-align: center; margin-bottom: 28px;">
          ${eyebrow ? `<p style="margin: 0 0 12px 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 800; color: ${EMAIL_PALETTE.primary};">${eyebrow}</p>` : ''}
          <h1 style="margin: 0 0 10px 0; font-size: 30px; line-height: 1.1; color: ${EMAIL_PALETTE.foreground};">${title}</h1>
          <p style="margin: 0 auto; max-width: 480px; font-size: 15px; line-height: 1.7; color: ${EMAIL_PALETTE.muted};">${description}</p>
        </div>

        ${contentHtml}

        ${(primaryAction || secondaryAction) ? `
          <div style="margin: 32px 0 12px; text-align: center;">
            ${primaryAction ? `
              <a href="${primaryAction.url}" style="display: inline-block; background: ${EMAIL_PALETTE.primary}; color: #ffffff; padding: 14px 26px; border-radius: 14px; text-decoration: none; font-size: 14px; font-weight: 700; box-shadow: 0 10px 24px -8px rgba(99, 102, 241, 0.35);">
                ${primaryAction.label}
              </a>
            ` : ''}
            ${secondaryAction ? `
              <div style="margin-top: 14px;">
                <a href="${secondaryAction.url}" style="display: inline-block; color: ${EMAIL_PALETTE.muted}; text-decoration: none; border-bottom: 1px solid ${EMAIL_PALETTE.border}; padding-bottom: 2px; font-size: 13px; font-weight: 600;">
                  ${secondaryAction.label}
                </a>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <hr style="border: 0; border-top: 1px solid ${EMAIL_PALETTE.border}; margin: 32px 0 18px;">
        <div style="font-size: 12px; line-height: 1.7; color: ${EMAIL_PALETTE.muted}; text-align: center;">
          ${footerHtml || 'Você recebeu esta mensagem porque existe uma atividade recente na sua conta do Schedly.'}
        </div>
      </div>
    </div>
  `
}