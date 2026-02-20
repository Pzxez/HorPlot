import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Shield, FileText, Check, Eraser, Loader2 } from 'lucide-react';
import { updateUserTerms } from '../firebase/userService';

const TermsModal = ({ user, language, showToast, onAccept }) => {
    const sigCanvas = useRef(null);
    const contentRef = useRef(null);
    const [isSigned, setIsSigned] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [hasAcceptedCheckbox, setHasAcceptedCheckbox] = useState(false);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight + 50) {
            setHasScrolledToBottom(true);
        }
    };

    const handleClear = () => {
        sigCanvas.current.clear();
        setIsSigned(false);
    };

    const handleConfirm = async () => {
        if (!isSigned || !hasAcceptedCheckbox || !hasScrolledToBottom) return;
        setIsSaving(true);
        try {
            let signatureBase64;
            try {
                // Try trimmed version first
                signatureBase64 = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            } catch (trimError) {
                console.warn("getTrimmedCanvas failed, falling back to raw canvas:", trimError);
                // Fallback to raw canvas if trimmer is missing
                signatureBase64 = sigCanvas.current.getCanvas().toDataURL('image/png');
            }
            await updateUserTerms(user.uid, signatureBase64);
            showToast(language === 'TH' ? 'ยอมรับเงื่อนไขเรียบร้อยแล้ว' : 'Agreement Signed Successfully');
            if (onAccept) onAccept();
        } catch (error) {
            console.error(error);
            showToast(language === 'TH' ? 'เกิดข้อผิดพลาดในการบันทึก' : 'Error saving agreement', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const text = {
        TH: {
            title: "🏛️ ข้อตกลงและเงื่อนไขการใช้บริการ (v1.1.3)",
            subtitle: "กรุณาอ่านและลงนามเพื่อเริ่มต้นการเดินทางของคุณ",
            content: `
[ภาษาไทย]
๑. การยอมรับข้อตกลงและคำมั่นสัญญา
โดยการเข้าสู่ระบบและดำเนินการลงลายมือชื่ออิเล็กทรอนิกส์ ผู้ใช้บริการตกลงยอมรับและผูกพันตามข้อตกลงและเงื่อนไขการใช้บริการนี้ ("ข้อตกลง") ทุกประการ หากผู้ใช้บริการไม่ประสงค์จะผูกพันตามข้อตกลงนี้ โปรดระงับการเข้าถึงและยุติการใช้งานแอปพลิเคชัน HorPlot โดยทันที

๒. การยืนยันตัวตนและการลงลายมือชื่อทางอิเล็กทรอนิกส์
ผู้ใช้บริการรับทราบและตกลงว่า ลายมือชื่ออิเล็กทรอนิกส์ที่ปรากฏในระบบ มีผลสมบูรณ์และผูกพันตามกฎหมายประดุจการลงลายมือชื่อด้วยปากกาบนเอกสารกระดาษ ตามนัยแห่งพระราชบัญญัติว่าด้วยธุรกรรมทางอิเล็กทรอนิกส์ พ.ศ. ๒๕๔๔ และที่แก้ไขเพิ่มเติม ข้อมูลลายมือชื่อจะถูกจัดเก็บในรูปแบบรหัสฐานสิบหก (Base64) ภายใต้ระบบรักษาความปลอดภัยระดับสูง

๓. สิทธิในทรัพย์สินทางปัญญาและข้อมูลอันเป็นเอกสิทธิ์
๓.๑ บรรดาพล็อตเรื่อง (Plot), ตัวละคร (Character), และแผนผังความสัมพันธ์ (Relationship Map) ที่ถูกสร้างขึ้นภายในระบบ เป็นสิทธิในทรัพย์สินทางปัญญาของผู้ใช้บริการแต่เพียงผู้เดียว
๓.๒ ผู้พัฒนาขอให้คำรับรองว่าจะไม่ดำเนินการทำซ้ำ ดัดแปลง หรือเผยแพร่ข้อมูลอันเป็นเอกสิทธิ์ของผู้ใช้บริการต่อสาธารณะโดยมิได้รับความยินยอมเป็นลายลักษณ์อักษร

๔. นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
HorPlot จะดำเนินการจัดเก็บและประมวลผลข้อมูลส่วนบุคคล ได้แก่ อีเมล, เลขหมายประจำตัวผู้ใช้ (UID) และลายมือชื่อ เพื่อวัตถุประสงค์ในการให้บริการและการยืนยันสิทธิ์พรีเมียม (Premium Subscription) เท่านั้น ภายใต้นโยบายรักษาความลับที่เข้มงวดที่สุด
            `,
            signLabel: "ลงลายมือชื่ออิเล็กทรอนิกส์",
            checkboxLabel: "ข้าพเจ้ายอมรับข้อตกลงและเงื่อนไขการใช้บริการข้างต้น",
            clear: "ล้าง",
            confirm: "ยืนยันและเข้าใช้งาน",
            tip: "ลากเพื่อลงชื่อในช่องว่างด้านบน",
            scrollTip: "กรุณาอ่านข้อตกลงให้จบก่อนดำเนินการต่อ"
        },
        EN: {
            title: "Terms of Service and Comprehensive Privacy Framework",
            subtitle: "Please review and sign to begin your journey",
            content: `
[English]
1. LEGAL BINDING AGREEMENT
By accessing the HorPlot platform and executing the Electronic Signature, the user ("Subscriber") hereby acknowledges and agrees to be legally bound by all terms, conditions, and notices contained herein. Failure to comply or agree shall result in immediate termination of access.

2. VALIDITY OF ELECTRONIC SIGNATURE
The Subscriber understands that the digital signature captured via the Signature Canvas constitutes a "Qualified Electronic Signature" in accordance with the Electronic Transactions Act, holding the same legal weight as a wet-ink signature. Data is stored as an encrypted Base64 string for maximum integrity.

3. INTELLECTUAL PROPERTY INDEMNIFICATION
The Subscriber retains full and exclusive ownership of all literary constructs, character threads, and relationship ontologies developed on this platform. HorPlot hereby waives any claim to said creative works.
            `,
            signLabel: "Electronic Signature",
            checkboxLabel: "I acknowledge and agree to the Terms of Service provided above",
            clear: "Clear",
            confirm: "Confirm & Start Writing",
            tip: "Draw your signature in the box above",
            scrollTip: "Please scroll to the bottom to continue"
        }
    };

    const current = language === 'TH' ? text.TH : text.EN;

    return (
        <div className="fixed inset-0 z-[9999] bg-[var(--bg-mesh-4)] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-700">
            <div className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-white/40 bg-white/80">
                <header className="p-8 border-b border-glass-stroke flex items-center gap-4 bg-white/40">
                    <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                        <Shield className="w-7 h-7 text-accent-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                            {current.title}
                        </h1>
                        <p className="text-muted font-bold text-sm tracking-wide mt-1 uppercase">
                            {current.subtitle}
                        </p>
                    </div>
                </header>

                <div
                    ref={contentRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-8 space-y-8 bg-white/20 custom-scrollbar"
                >
                    <div className="prose prose-slate max-w-none">
                        <div className="bg-white/40 p-8 rounded-[2rem] border border-glass-stroke shadow-inner min-h-[300px]">
                            <p className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed text-lg">
                                {current.content}
                            </p>
                        </div>
                    </div>

                    {!hasScrolledToBottom && (
                        <p className="text-center text-xs font-bold text-accent-primary animate-bounce">
                            ↓ {current.scrollTip} ↓
                        </p>
                    )}

                    <div className={`space-y-6 transition-all duration-500 ${hasScrolledToBottom ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                        <label className="flex items-center gap-4 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={hasAcceptedCheckbox}
                                onChange={(e) => setHasAcceptedCheckbox(e.target.checked)}
                                className="w-6 h-6 rounded-lg border-2 border-glass-stroke checked:bg-accent-primary transition-all cursor-pointer"
                            />
                            <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                                {current.checkboxLabel}
                            </span>
                        </label>

                        <div className="space-y-4">
                            <label className="flex items-center gap-2 text-xs font-light tracking-[0.2em] text-black">
                                <FileText className="w-4 h-4" />
                                {current.signLabel}
                            </label>
                            <div className="relative group">
                                <div className="bg-white rounded-3xl border-2 border-glass-stroke overflow-hidden shadow-sm group-focus-within:border-accent-primary transition-all duration-300">
                                    <SignatureCanvas
                                        ref={sigCanvas}
                                        penColor="#000000"
                                        canvasProps={{
                                            className: 'w-full h-48 cursor-crosshair',
                                            style: { width: '100%', height: '192px' }
                                        }}
                                        onEnd={() => setIsSigned(true)}
                                    />
                                </div>
                                <button
                                    onClick={handleClear}
                                    className="absolute bottom-4 right-4 p-3 rounded-2xl bg-white/80 hover:bg-rose-50 text-rose-500 border border-rose-100 shadow-xl transition-all active:scale-90 flex items-center gap-2 font-black text-xs uppercase"
                                >
                                    <Eraser className="w-4 h-4" />
                                    {current.clear}
                                </button>
                            </div>
                            <p className="text-center text-[10px] font-bold text-muted/60 uppercase tracking-widest">
                                {current.tip}
                            </p>
                        </div>
                    </div>
                </div>

                <footer className="p-8 border-t border-glass-stroke bg-white/40">
                    <button
                        onClick={handleConfirm}
                        disabled={!isSigned || !hasAcceptedCheckbox || !hasScrolledToBottom || isSaving}
                        className="w-full h-16 md:h-20 bg-accent-primary hover:bg-accent-primary/80 disabled:bg-slate-200 disabled:opacity-50 text-white rounded-[2rem] font-black text-xl md:text-2xl transition-all shadow-xl shadow-accent-primary/20 flex items-center justify-center gap-4 active:scale-[0.98]"
                    >
                        {isSaving ? (
                            <Loader2 className="w-8 h-8 animate-spin" />
                        ) : (
                            <Check className="w-8 h-8" />
                        )}
                        <span>{current.confirm}</span>
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TermsModal;
