/**
 * Module generating multi-lingual security error HTML views (vi, en, km)
 * Fully compatible with Next.js Edge Runtime (Does not use Node-specific APIs)
 */

export type LockdownStatus = 'SUSPENDED' | 'IP_BLOCKED' | 'INTRANET_LOCKDOWN';

export const getLockdownHtml = (
    status: LockdownStatus, 
    ip: string, 
    locale: string, 
    reason?: string
): string => {
    const messages = {
        vi: {
            title: status === 'SUSPENDED' ? '🚨 HỆ THỐNG PHONG TỎA KHẦN CẤP' : '🔒 TRUY CẬP BỊ GIỚI HẠN',
            desc: status === 'SUSPENDED' 
                ? 'Tổ chức này tạm thời bị đình chỉ hoạt động do hệ thống SOAR tự động phát hiện hành vi tấn công mạng dồn dập hoặc theo lệnh khẩn cấp từ Super Admin để bảo toàn dữ liệu.' 
                : 'Chi nhánh này đã thiết lập chính sách giới hạn dải IP mạng nội bộ. Địa chỉ IP hiện tại của bạn không nằm trong danh sách được phép truy cập.',
        },
        en: {
            title: status === 'SUSPENDED' ? '🚨 EMERGENCY SOAR LOCKDOWN' : '🔒 RESTRICTED ACCESS',
            desc: status === 'SUSPENDED' 
                ? 'This organization has been temporarily suspended by the SOAR system due to detected cyberattacks or an emergency order from the Super Admin to preserve data integrity.' 
                : 'This branch has enforced an intranet IP whitelist policy. Your current IP address is not authorized to access this network.',
        },
        km: {
            title: status === 'SUSPENDED' ? '🚨 ប្រព័ន្ធត្រូវបានបិទជាបន្ទាន់ (SOAR LOCKDOWN)' : '🔒 ការចូលប្រើប្រាស់ត្រូវបានកំណត់ (INTRANET LOCKDOWN)',
            desc: status === 'SUSPENDED' 
                ? 'ស្ថាប័ននេះត្រូវបានផ្អាកដំណើរการជាបណ្តោះអាសន្នដោយសារតែប្រព័ន្ធ SOAR រកឃើញការវាយប្រហារបណ្តាញ ឬតាមបញ្ជាបន្ទាន់ពី Super Admin ដើម្បីការពារទិន្នន័យ។' 
                : 'សាខានេះបានកំណត់គោលការណ៍អនុញ្ញាតតែអាសយដ្ឋាន IP ក្នុងបណ្តាញផ្ទៃក្នុងប៉ុណ្ណោះ។ អាសយដ្ឋាន IP បច្ចុប្បន្នរបស់អ្នកមិនស្ថិតក្នុងបញ្ជីដែលអាចចូលប្រើបានទេ។',
        }
    };

    const lang = messages[locale as 'vi' | 'km' | 'en'] || messages.en;
    const borderStyle = status === 'SUSPENDED' ? '#ef4444' : '#3b82f6';
    const bgStyle = status === 'SUSPENDED' ? 'rgba(239,68,68,0.08)' : 'rgba(59,130,246,0.08)';
    const titleColor = status === 'SUSPENDED' ? '#ef4444' : '#3b82f6';
    const statusLabel = status === 'SUSPENDED' ? 'TENANT_SUSPENDED' : 'IP_NOT_WHITELISTED';

    return `<html>
        <body style="background-color:#0b0f19; color:#f3f4f6; font-family:system-ui,sans-serif; display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; margin:0; text-align:center; padding: 20px;">
            <div style="border: 1px solid ${borderStyle}; background-color: ${bgStyle}; padding: 40px; border-radius: 20px; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <h1 style="color:${titleColor}; font-size: 20px; margin-top: 0; font-weight: 800; letter-spacing: -0.5px; font-family: system-ui, sans-serif;">${lang.title}</h1>
                <p style="color:#9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0 30px 0;">${lang.desc}${reason ? ` (${reason})` : ''}</p>
                <div style="font-size: 11px; color: #6b7280; border-top: 1px solid #1f2937; padding-top: 15px; font-family: monospace;">
                    STATUS: ${statusLabel} | YOUR IP: ${ip}
                </div>
            </div>
        </body>
    </html>`;
};
