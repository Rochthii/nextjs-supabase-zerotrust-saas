'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Globe, Fingerprint, Shield, Cpu, BookOpen, Code, FileCheck, CheckCircle2, ChevronRight } from 'lucide-react';

type SecurityLayer = 'edge' | 'jwt' | 'rls' | 'abac';
type DetailTab = 'academic' | 'source' | 'iso';

interface LayerInfo {
    id: SecurityLayer;
    name: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    borderColor: string;
    bgColor: string;
    accentColor: string;
    complexity: string;
    isoControl: string;
    academicTitle: string;
    academicText: string;
    sourceCode: string;
    isoTitle: string;
    isoText: string;
}

const LAYERS_DATA: Record<SecurityLayer, LayerInfo> = {
    edge: {
        id: 'edge',
        name: '1. Edge Security',
        desc: 'Next.js Edge Middleware & Upstash Redis',
        icon: <Globe className="w-5 h-5" />,
        color: 'text-blue-400',
        borderColor: 'border-blue-500/30',
        bgColor: 'bg-blue-500/10',
        accentColor: 'blue',
        complexity: 'O(1) Edge Cache Lookup',
        isoControl: 'ISO 27017 CLD.9.5.1',
        academicTitle: 'Tối ưu hóa tài nguyên mạng biên (Edge Computing)',
        academicText: 'Middleware hoạt động tại Edge Runtime của Next.js với độ trễ < 3ms. Bằng cách save trữ IP bị block và configuration Tenant vào bộ đệm Redis (hoặc RAM local), system triệt tiêu 100% tải truy cập trái phép hoặc dò quét tự động trước khi chạm tới Database Gateway. Cơ chế Negative Caching save trữ status an toàn/error trong 15s để triệt tiêu hoàn toàn nguy cơ DDoS spam connect PostgreSQL.',
        sourceCode: `// middleware.ts - Trích xuất check Edge Cache
const redisBlockKey = \`blocklist:\${clientIp}\`;
const cachedBlock = await redisClient.get<any>(redisBlockKey);

if (cachedBlock !== null) {
    if (cachedBlock !== false) {
        return new NextResponse(
            getLockdownHtml('IP_BLOCKED', clientIp, locale),
            { status: 403 }
        );
    }
    // cachedBlock === false -> IP an toàn (Negative Cache Hit)
}`,
        isoTitle: 'CLD.9.5.1 - Cô lập và bảo vệ mạng ảo',
        isoText: 'Kiểm soát chặt chẽ biên giới mạng của từng branch (tenant). Chỉ allowed các luồng traffic thuộc dải IP configuration trong whitelist của tenant đó được phép đi sâu vào lõi dịch vụ, cô lập hoàn toàn tài nguyên ảo hóa giữa các tenant.'
    },
    jwt: {
        id: 'jwt',
        name: '2. Identity & JWT',
        desc: 'RAM-based Session Claims Resolution',
        icon: <Fingerprint className="w-5 h-5" />,
        color: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        bgColor: 'bg-amber-500/10',
        accentColor: 'amber',
        complexity: 'O(1) Constant-Time RAM Read',
        isoControl: 'ISO 27002 9.2',
        academicTitle: 'Constant-time Context Resolution trong RAM Session',
        academicText: 'Thông thường để filter chéo tenant, CSDL phải thực hiện phép JOIN chéo giữa bảng nghiệp vụ và bảng account/tenant để validate quyền. Giải pháp của đề tài là nhúng directly tenant_id và role định danh vào structure Custom Claims của JWT. PostgreSQL sẽ đọc directly claims này từ biến bộ nhớ RAM Session (hằng số O(1)) thay vì execute JOIN query vật lý trên đĩa cứng, giúp triệt tiêu hoàn toàn chi phí Overhead security.',
        sourceCode: `-- PostgreSQL đọc Claims directly từ bộ đệm RAM của Session
CREATE OR REPLACE FUNCTION get_tenant_id_from_session() 
RETURNS uuid AS $$
BEGIN
  RETURN ((current_setting('request.jwt.claims', true))::jsonb ->> 'tenant_id')::uuid;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`,
        isoTitle: 'ISO 27002 9.2 - Quản lý quyền truy cập user',
        isoText: 'Thiết lập định danh phiên làm việc an toàn. Khóa chặt định danh tenant_id directly trong chữ ký mật mã last namec của JWT do Supabase Auth phát hành. User không thể tự thay đổi hoặc bypass tham số tenant_id để leo thang đặc quyền chéo.'
    },
    rls: {
        id: 'rls',
        name: '3. Database RLS',
        desc: 'PostgreSQL Row-Level Security Policies',
        icon: <Shield className="w-5 h-5" />,
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/30',
        bgColor: 'bg-emerald-500/10',
        accentColor: 'emerald',
        complexity: 'O(log N_tenant) B-Tree Index Scan',
        isoControl: 'ISO 27017 CLD.6.3.1',
        academicTitle: 'Lưới filter cô lập dòng dữ liệu cứng tầng CSDL',
        academicText: 'RLS được áp dụng cứng tại mức PostgreSQL. Mọi câu lệnh SQL từ ứng dụng đều được Query Planner của Postgres tự động rewrite để gán add bộ filter tenant_id. Nhờ có chỉ mục B-Tree Index trên cột tenant_id, database không thực hiện quét tuần tự toàn bảng O(N) mà thực hiện quét cây chỉ mục B-Tree với độ phức tạp tối ưu O(log N_tenant) (với N_tenant là dung lượng riêng cực nhỏ của tenant current), đảm bảo hiệu năng maximum.',
        sourceCode: `-- Activate RLS cứng trên bảng nghiệp vụ
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Tạo chính sách filter tự động
CREATE POLICY "Tenant isolation news filter" ON public.news
AS RESTRICTIVE USING (
    tenant_id = get_tenant_id_from_session()
);`,
        isoTitle: 'CLD.6.3.1 - Cô lập trong môi trường ảo hóa dùng chung',
        isoText: 'Đảm bảo dữ liệu của tenant này hoàn toàn vô hình trước tenant khác. RLS Policies được biên dịch và execute ngay tại nhân CSDL, triệt tiêu nguy cơ rò rỉ thông tin ngay cả khi ứng dụng trung gian bị chiếm quyền kiểm soát.'
    },
    abac: {
        id: 'abac',
        name: '4. Context ABAC',
        desc: 'Temporal & Network Attribute Trigger',
        icon: <Cpu className="w-5 h-5" />,
        color: 'text-rose-400',
        borderColor: 'border-rose-500/30',
        bgColor: 'bg-rose-500/10',
        accentColor: 'rose',
        complexity: 'O(1) Dynamic Trigger Evaluation',
        isoControl: 'ISO 27002 9.4',
        academicTitle: 'Kiểm soát truy cập thuộc tính động (ABAC Engine)',
        academicText: 'Bên cạnh phân vai tĩnh (RBAC), system áp dụng bộ filter thuộc tính động (Attribute-Based Access Control) thông qua các database triggers chạy BEFORE INSERT/UPDATE/DELETE. Triggers tự động analytics các yếu tố ngữ cảnh: time thực hiện (ngăn block thao tác ngoài giờ hành chính đối với nhân sự thông thường) và address IP thực hiện để bảo vệ maximum các tài nguyên dữ liệu nhạy cảm.',
        sourceCode: `-- Trigger kiểm soát ABAC động
CREATE OR REPLACE FUNCTION enforce_context_abac_policy()
RETURNS trigger AS $$
BEGIN
    -- Ngăn block update dữ liệu ngoài giờ hành chính
    IF NOT is_within_business_hours() AND get_user_role() != 'super_admin' THEN
        RAISE EXCEPTION 'SECURITY VIOLATION [ABAC]: Chỉnh edit ngoài giờ hành chính bị cấm.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`,
        isoTitle: 'ISO 27002 9.4 - Kiểm soát truy cập thông tin',
        isoText: 'Execute các constrained phi structure dựa trên ngữ cảnh actual của yêu cầu (time làm việc, vị trí IP connect). Đảm bảo nhân sự internally có quyền hợp pháp cũng không thể lấy cắp hoặc phá hoại dữ liệu ngoài giờ làm việc.'
    }
};

export function TechnicalAcademicMatrix() {
    const [selectedLayer, setSelectedLayer] = useState<SecurityLayer>('edge');
    const [activeTab, setActiveTab] = useState<DetailTab>('academic');

    const layer = LAYERS_DATA[selectedLayer];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-300">
            {/* Left: Interactive Layer Selector Matrix */}
            <div className="lg:col-span-5 space-y-4">
                <div className="space-y-1">
                    <h3 className="text-white font-black text-sm uppercase tracking-wider">
                        📈 Ma Trận Kiến Trúc Zero Trust Phân Tầng
                    </h3>
                    <p className="text-slate-400 text-xs">
                        Select một lớp security để tra cứu details last namec thuật, mã nguồn actual và tuân thủ ISO.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {(Object.values(LAYERS_DATA) as LayerInfo[]).map((node) => {
                        const isSelected = selectedLayer === node.id;
                        return (
                            <button
                                key={node.id}
                                onClick={() => setSelectedLayer(node.id)}
                                className={`p-4 rounded-2xl border text-left transition-all duration-300 transform active:scale-98 ${
                                    isSelected
                                        ? `${node.borderColor} ${node.bgColor} shadow-lg scale-102`
                                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700/50 hover:bg-slate-800/20'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-xl border ${
                                        isSelected 
                                            ? `bg-slate-950/60 ${node.borderColor} ${node.color}` 
                                            : 'bg-slate-950/20 border-slate-800 text-slate-500'
                                    }`}>
                                        {node.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                                                {node.name}
                                            </span>
                                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isSelected ? `${node.color} translate-x-1` : 'text-slate-650'}`} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 truncate">{node.desc}</p>
                                        <div className="mt-2 flex gap-1.5 flex-wrap">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                                isSelected 
                                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse' 
                                                    : 'bg-slate-800 text-slate-500 border-transparent'
                                            }`}>
                                                {node.complexity}
                                            </span>
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                                isSelected 
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                    : 'bg-slate-800 text-slate-500 border-transparent'
                                            }`}>
                                                {node.isoControl}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Right: Technical detail card tab explorer */}
            <div className="lg:col-span-7">
                <Card className="border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden h-full flex flex-col relative">
                    {/* Background glow matching the selected layer color accent */}
                    <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
                        selectedLayer === 'edge' ? 'bg-blue-500/5' :
                        selectedLayer === 'jwt' ? 'bg-amber-500/5' :
                        selectedLayer === 'rls' ? 'bg-emerald-500/5' : 'bg-rose-500/5'
                    }`} />

                    <CardHeader className="p-6 pb-4 border-b border-slate-800 relative z-10">
                        <div className="flex border-b border-slate-800 pb-2 gap-2 overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('academic')}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                    activeTab === 'academic' 
                                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/25' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                Phân Tích Last namec Thuật
                            </button>
                            <button
                                onClick={() => setActiveTab('source')}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                    activeTab === 'source' 
                                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <Code className="w-3.5 h-3.5" />
                                Mã Nguồn Thực Tế
                            </button>
                            <button
                                onClick={() => setActiveTab('iso')}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                                    activeTab === 'iso' 
                                        ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' 
                                        : 'text-slate-400 hover:text-white'
                                }`}
                            >
                                <FileCheck className="w-3.5 h-3.5" />
                                Kiểm Toán ISO 27017
                            </button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 relative z-10 flex-1 flex flex-col justify-between">
                        {/* Tab Content: Academic */}
                        {activeTab === 'academic' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div>
                                    <h4 className="text-sm font-black text-slate-100 uppercase tracking-wider">
                                        {layer.academicTitle}
                                    </h4>
                                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded mt-1.5 inline-block">
                                        Độ phức tạp: {layer.complexity}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-350 leading-relaxed font-sans">
                                    {layer.academicText}
                                </p>
                                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-[10px] text-slate-400 leading-relaxed font-mono">
                                    <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase tracking-wider text-[9px] mb-2 font-sans">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                                        <span>Đo lường thực nghiệm khoa last namec</span>
                                    </div>
                                    - Overhead process đạt O(1) nhờ Custom Claims trích xuất directly trong RAM Session.<br />
                                    - Filter CSDL đạt O(log N_tenant) nhờ cây chỉ mục B-Tree tối ưu thay vì seq scan O(N).
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Source Code */}
                        {activeTab === 'source' && (
                            <div className="space-y-3 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                                        Mã nguồn execute cốt lõi (Production Code)
                                    </h4>
                                    <span className="text-[9px] text-slate-500 font-mono">TypeScript / PL/pgSQL</span>
                                </div>
                                <pre className="text-[10px] font-mono p-4 rounded-xl bg-slate-950/90 border border-slate-800 text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed max-h-[300px] overflow-y-auto">
                                    {layer.sourceCode}
                                </pre>
                            </div>
                        )}

                        {/* Tab Content: ISO Compliance */}
                        {activeTab === 'iso' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <div>
                                    <h4 className="text-sm font-black text-blue-400 uppercase tracking-wider">
                                        {layer.isoTitle}
                                    </h4>
                                    <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded mt-1.5 inline-block">
                                        Chứng nhận: ISO/IEC 27017 Cloud Control
                                    </span>
                                </div>
                                <p className="text-xs text-slate-350 leading-relaxed font-sans">
                                    {layer.isoText}
                                </p>
                                <div className="p-4 rounded-xl bg-blue-950/10 border border-blue-500/20 text-[10px] text-slate-300 leading-relaxed">
                                    <strong>Minh chứng audit:</strong> Mọi hành vi vi phạm lớp bảo vệ này đều được SOAR tự động bắt ngoại lệ và ghi nhận log audit bất biến (WORM Vault) standard structure CLD.12.4.1 để phục vụ công tác giám định pháp lý.
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
