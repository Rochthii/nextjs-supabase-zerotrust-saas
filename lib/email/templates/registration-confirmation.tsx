import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Button,
    Img,
} from '@react-email/components';

interface RegistrationConfirmationProps {
    name: string;
    eventTitle: string;
    eventDate: string;
    eventTime?: string;
    eventLocation?: string;
    numParticipants: number;
    contactEmail?: string;
    contactPhone?: string;
    siteName?: string;
    siteSubtitle?: string;
}

export function RegistrationConfirmation({
    name,
    eventTitle,
    eventDate,
    eventTime,
    eventLocation,
    numParticipants,
    contactEmail = 'contact@example.com',
    contactPhone = '(028) 1234 5678',
    siteName = 'Ngôi Branch',
    siteSubtitle = 'Nam Tông Khmer',
}: RegistrationConfirmationProps) {
    return (
        <Html>
            <Head />
            <Body style={{ backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }}>
                <Container style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
                    <Section style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px' }}>
                        {/* Header with Logo */}
                        <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <Text style={{ fontSize: '32px', margin: '0' }}>☸️</Text>
                            <Text style={{ fontSize: '24px', color: '#B8860B', fontWeight: 'bold', margin: '10px 0' }}>
                                {siteName}
                            </Text>
                            <Text style={{ fontSize: '14px', color: '#666', margin: '0' }}>
                                {siteSubtitle}
                            </Text>
                        </Section>

                        {/* Greeting */}
                        <Text style={{ fontSize: '16px', color: '#333', marginBottom: '20px' }}>
                            Kính chào {name},
                        </Text>

                        <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6' }}>
                            Chúng tôi đã nhận được registration của bạn cho event:
                        </Text>

                        {/* Event Details Box */}
                        <Section
                            style={{
                                backgroundColor: '#FFF8DC',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '2px solid #B8860B',
                                margin: '20px 0',
                            }}
                        >
                            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#B8860B', margin: '0 0 15px 0' }}>
                                {eventTitle}
                            </Text>

                            <Text style={{ fontSize: '14px', color: '#555', margin: '5px 0', display: 'flex', alignItems: 'center' }}>
                                <strong>📅 Ngày:</strong> {eventDate}
                            </Text>

                            {eventTime && (
                                <Text style={{ fontSize: '14px', color: '#555', margin: '5px 0' }}>
                                    <strong>🕐 Giờ:</strong> {eventTime}
                                </Text>
                            )}

                            {eventLocation && (
                                <Text style={{ fontSize: '14px', color: '#555', margin: '5px 0' }}>
                                    <strong>📍 Venue:</strong> {eventLocation}
                                </Text>
                            )}

                            <Text style={{ fontSize: '14px', color: '#555', margin: '5px 0' }}>
                                <strong>👥 Số người:</strong> {numParticipants} người
                            </Text>
                        </Section>

                        {/* Confirmation Message */}
                        <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6' }}>
                            Chúng tôi sẽ submit notification nhắc nhở trước event 1 ngày. Nếu có thay đổi lịch,
                            chúng tôi cũng sẽ notification ngay cho bạn.
                        </Text>

                        {/* CTA Button */}
                        <Section style={{ textAlign: 'center', margin: '30px 0' }}>
                            <Button
                                href={`${process.env.NEXT_PUBLIC_SITE_URL || ''}/vi/lich-le`}
                                style={{
                                    backgroundColor: '#B8860B',
                                    color: 'white',
                                    padding: '12px 24px',
                                    borderRadius: '6px',
                                    textDecoration: 'none',
                                    display: 'inline-block',
                                    fontWeight: 'bold',
                                }}
                            >
                                View Lịch Lễ
                            </Button>
                        </Section>

                        {/* Footer */}
                        <Section style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '30px' }}>
                            <Text style={{ fontSize: '14px', color: '#666', textAlign: 'center' }}>
                                Nếu có thắc mắc, please contact:
                            </Text>
                            <Text style={{ fontSize: '14px', color: '#B8860B', textAlign: 'center', margin: '5px 0' }}>
                                📧 {contactEmail}<br />
                                📞 {contactPhone}
                            </Text>
                        </Section>

                        {/* Blessing */}
                        <Text style={{ fontSize: '14px', color: '#666', textAlign: 'center', fontStyle: 'italic', marginTop: '20px' }}>
                            🙏 Cầu chúc bạn luôn an lạc, hạnh phúc
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}
