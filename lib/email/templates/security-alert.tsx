import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
} from '@react-email/components';

interface SecurityAlertEmailProps {
    tenantName: string;
    alertType: string;
    alertDetails: string;
    riskScore: number;
    ipAddress: string;
    resolveUrl: string;
    siteName?: string;
}

export function SecurityAlertEmail({
    tenantName,
    alertType,
    alertDetails,
    riskScore,
    ipAddress,
    resolveUrl,
    siteName = 'TenantShield',
}: SecurityAlertEmailProps) {
    const isCritical = riskScore >= 75;

    return (
        <Html>
            <Head />
            <Body style={{ backgroundColor: '#fff5f5', fontFamily: 'Inter, system-ui, Arial, sans-serif' }}>
                <Container style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                    <Section style={{ 
                        backgroundColor: 'white', 
                        padding: '40px', 
                        borderRadius: '16px', 
                        border: isCritical ? '2px solid #ef4444' : '1px solid #e2e8f0', 
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)' 
                    }}>
                        {/* Header logo / brand */}
                        <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <Text style={{ fontSize: '32px', margin: '0' }}></Text>
                            <Text style={{ 
                                fontSize: '20px', 
                                color: isCritical ? '#dc2626' : '#d97706', 
                                fontWeight: 'bold', 
                                margin: '10px 0', 
                                letterSpacing: '-0.025em' 
                            }}>
                                SECURITY INCIDENT ALERT
                            </Text>
                            <Text style={{ fontSize: '13px', color: '#64748b', margin: '0' }}>
                                TenantShield SOAR Active Defense Engine
                            </Text>
                        </Section>

                        {/* Message body */}
                        <Text style={{ fontSize: '15px', color: '#1e293b', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                            A high-risk security event has been detected within the workspace: **{tenantName}**.
                        </Text>

                        {/* Alert Details Table */}
                        <Section style={{ 
                            backgroundColor: '#f8fafc', 
                            padding: '20px', 
                            borderRadius: '12px', 
                            border: '1px solid #e2e8f0', 
                            margin: '20px 0' 
                        }}>
                            <Text style={{ fontSize: '14px', color: '#334155', margin: '6px 0' }}>
                                <strong>Alert Type:</strong> {alertType}
                            </Text>
                            <Text style={{ fontSize: '14px', color: '#334155', margin: '6px 0' }}>
                                <strong>Severity / Risk:</strong> <span style={{ 
                                    color: isCritical ? '#ef4444' : '#f59e0b', 
                                    fontWeight: 'bold' 
                                }}>{riskScore} CRS ({isCritical ? 'CRITICAL' : 'WARNING'})</span>
                            </Text>
                            <Text style={{ fontSize: '14px', color: '#334155', margin: '6px 0' }}>
                                <strong>Source IP:</strong> <code style={{ backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>{ipAddress}</code>
                            </Text>
                            <Text style={{ fontSize: '14px', color: '#334155', margin: '6px 0' }}>
                                <strong>Details:</strong> {alertDetails}
                            </Text>
                        </Section>

                        <Text style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                            The active defense firewall has automatically flagged this request. Please review the threat logs in the Security Operations Center (SOC) immediately.
                        </Text>

                        {/* CTA Button */}
                        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
                            <Button
                                href={resolveUrl}
                                style={{
                                    backgroundColor: isCritical ? '#ef4444' : '#f59e0b',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                    fontWeight: 'bold',
                                    fontSize: '14px',
                                }}
                            >
                                Investigate in SOC Dashboard
                            </Button>
                        </Section>

                        {/* Footer */}
                        <Section style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginTop: '30px', textAlign: 'center' }}>
                            <Text style={{ fontSize: '12px', color: '#94a3b8', margin: '0' }}>
                                Automated alert generated by TenantShield SOAR. Do not reply to this email.
                            </Text>
                        </Section>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
