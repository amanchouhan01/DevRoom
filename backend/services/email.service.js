import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendOTP = async (email, otp) => {
    await resend.emails.send({
        from: 'DevRoom <noreply@devroom.sbs>',
        to: email,
        subject: 'Your DevRoom OTP',
        html: `
            <div style="font-family: Arial; max-width: 400px; margin: auto; padding: 20px; background: #1e293b; color: white; border-radius: 12px;">
                <h2 style="color: #3b82f6;">DevRoom Verification</h2>
                <p>Your OTP is:</p>
                <h1 style="letter-spacing: 8px; color: #3b82f6; font-size: 36px;">${otp}</h1>
                <p style="color: #94a3b8;">Valid for 5 minutes. Do not share this with anyone.</p>
            </div>
        `
    })
}


// Registered user Project invitation
export const sendProjectInvite = async (email, { projectName, inviterName }) => {
    await resend.emails.send({
        from: 'DevRoom <noreply@devroom.sbs>',
        to: email,
        subject: `${inviterName} invited you to collaborate on "${projectName}" - DevRoom`,
        html: `
            <div style="font-family: Arial; max-width: 400px; margin: auto; padding: 20px; background: #1e293b; color: white; border-radius: 12px;">
                <h2 style="color: #3b82f6;">New Project Invitation</h2>
                <p><strong>${inviterName}</strong> has invited you to collaborate on <strong>${projectName}</strong> on DevRoom.</p>
                <a href="https://devroom.sbs/home" style="display:inline-block; margin-top:16px; padding:10px 24px; background:#3b82f6; color:white; text-decoration:none; border-radius:8px; font-weight:bold;">View Invitation</a>
                <p style="color: #94a3b8; margin-top:16px; font-size:13px;">Log in to DevRoom to accept or decline this invite.</p>
            </div>
        `
    })
}

// Non-registered user signup invite
export const sendProjectInviteSignup = async (email, { projectName, inviterName }) => {
    await resend.emails.send({
        from: 'DevRoom <noreply@devroom.sbs>',
        to: email,
        subject: `${inviterName} invited you to join "${projectName}" on DevRoom`,
        html: `
            <div style="font-family: Arial; max-width: 400px; margin: auto; padding: 20px; background: #1e293b; color: white; border-radius: 12px;">
                <h2 style="color: #3b82f6;">You're invited to DevRoom 🚀</h2>
                <p><strong>${inviterName}</strong> has invited you to collaborate on <strong>${projectName}</strong> — a real-time collaborative coding platform powered by AI.</p>
                <a href="https://devroom.sbs/register" style="display:inline-block; margin-top:16px; padding:10px 24px; background:#3b82f6; color:white; text-decoration:none; border-radius:8px; font-weight:bold;">Sign up & Join</a>
                <p style="color: #94a3b8; margin-top:16px; font-size:13px;">Create your free account with this email address to automatically join the project.</p>
            </div>
        `
    })
}