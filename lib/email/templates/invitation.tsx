import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
} from '@react-email/components';

interface InvitationEmailProps {
    tenantName: string;
    inviterEmail: string;
    inviteUrl: string;
    siteName?: string;
}

export function InvitationEmail({
    tenantName,
    inviterEmail,
    inviteUrl,
    siteName = 'TenantShield',
}: InvitationEmailProps) {
    return (
        <Html>
            <Head />
            <Body style={{ backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>
                <Container style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                    <Section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
                        {/* Header logo / brand */}
                        <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <Text style={{ fontSize: '28px', margin: '0' }}>🛡️</Text>
                            <Text style={{ fontSize: '20px', color: '#0f172a', fontWeight: 'bold', margin: '10px 0', letterSpacing: '-0.025em' }}>
                                {siteName}
                            </Text>
                            <Text style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
                                Invitation to join workspace
                            </Text>
                        </Section>

                        {/* Message body */}
                        <Text style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 20px 0' }}>
                            You have been invited by **{inviterEmail}** to join the B2B SaaS isolated workspace **{tenantName}** on TenantShield.
                        </Text>

                        <Text style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                            Click the button below to accept your invitation, register your account, and access your branch portal.
                        </Text>

                        {/* CTA Button */}
                        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
                            <Button
                                href={inviteUrl}
                                style={{
                                    backgroundColor: '#4f46e5',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                }}
                            >
                                Accept Invitation & Join
                            </Button>
                        </Section>

                        <Text style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: '20px 0 0 0', fontStyle: 'italic' }}>
                            Note: This invitation link is valid for 7 days. If you were not expecting this invitation, you can safely ignore this email.
                        </Text>

                        {/* Footer */}
                        <Section style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '30px', textAlign: 'center' }}>
                            <Text style={{ fontSize: '12px', color: '#94a3b8', margin: '0' }}>
                                Powered by TenantShield Secure SaaS Boilerplate. All rights reserved.
                            </Text>
                        </Section>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
