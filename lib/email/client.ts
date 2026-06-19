import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    react,
}: {
    to: string;
    subject: string;
    react: React.ReactElement;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'System <noreply@system.com>',
            to,
            subject,
            react,
        });

        if (error) {
            console.error('Email send error:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}
