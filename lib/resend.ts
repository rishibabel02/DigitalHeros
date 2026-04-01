import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@golfcharityplatform.com'

export async function sendSubscriptionConfirmation(email: string, name: string, plan: string) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Welcome to Golf Charity Platform! 🏌️',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#f0f0f5;padding:40px;border-radius:12px;">
        <h1 style="color:#a855f7;font-size:28px;margin-bottom:8px;">You're in!</h1>
        <p style="color:#a0a0b0;font-size:16px;">Hi ${name}, your <strong style="color:#f0f0f5;">${plan}</strong> subscription is now active.</p>
        <p style="color:#a0a0b0;">You can now enter your golf scores, participate in monthly draws, and support your chosen charity.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#a855f7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;">Go to Dashboard</a>
      </div>
    `,
  })
}

export async function sendDrawResultsEmail(email: string, name: string, drawMonth: string) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: `Draw Results Are In — ${drawMonth} 🎰`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#f0f0f5;padding:40px;border-radius:12px;">
        <h1 style="color:#a855f7;font-size:28px;">Results are in!</h1>
        <p style="color:#a0a0b0;">Hi ${name}, the ${drawMonth} draw results have been published.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display:inline-block;background:#a855f7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;">View Results</a>
      </div>
    `,
  })
}

export async function sendWinnerNotification(email: string, name: string, matchType: string, prizeAmount: number) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: `🏆 You won! ${matchType} Match`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#f0f0f5;padding:40px;border-radius:12px;">
        <h1 style="color:#f59e0b;font-size:28px;">Congratulations!</h1>
        <p style="color:#a0a0b0;">Hi ${name}, you've won the <strong style="color:#f0f0f5;">${matchType}</strong> match!</p>
        <p style="color:#a0a0b0;">Your prize: <strong style="color:#a855f7;font-size:20px;">£${(prizeAmount / 100).toFixed(2)}</strong></p>
        <p style="color:#a0a0b0;">Please upload your proof of scores to claim your prize.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" style="display:inline-block;background:#f59e0b;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;">Claim Prize</a>
      </div>
    `,
  })
}

export async function sendVerificationUpdate(email: string, name: string, status: 'approved' | 'rejected', adminNote?: string) {
  const approved = status === 'approved'
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: approved ? '✅ Prize Verified — Payment Processing' : '❌ Verification Update',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#f0f0f5;padding:40px;border-radius:12px;">
        <h1 style="color:${approved ? '#10b981' : '#ef4444'};font-size:28px;">${approved ? 'Verification Approved!' : 'Verification Update'}</h1>
        <p style="color:#a0a0b0;">Hi ${name}, your prize verification has been <strong>${status}</strong>.</p>
        ${adminNote ? `<p style="color:#a0a0b0;">Note: ${adminNote}</p>` : ''}
        ${approved ? `<p style="color:#a0a0b0;">Your payment is being processed and will arrive within 3-5 business days.</p>` : ''}
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/winnings" style="display:inline-block;background:#a855f7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;">View Status</a>
      </div>
    `,
  })
}

export async function sendSubscriptionCancellation(email: string, name: string, endDate: string) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Subscription Cancellation Confirmed',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0a0a0f;color:#f0f0f5;padding:40px;border-radius:12px;">
        <h1 style="color:#a855f7;font-size:28px;">Subscription Cancelled</h1>
        <p style="color:#a0a0b0;">Hi ${name}, your subscription has been cancelled. You'll retain access until <strong>${endDate}</strong>.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display:inline-block;background:#a855f7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:20px;">Resubscribe</a>
      </div>
    `,
  })
}
