import React, { useState } from 'react';
import { auth, googleProvider } from '../firebase/config';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Mail, Lock, UserPlus, LogIn, Loader2, AlertCircle, Chrome, Apple, Info } from 'lucide-react';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Create user document for new users
                await setDoc(doc(db, 'users', userCredential.user.uid), {
                    email: userCredential.user.email,
                    isPremium: false,
                    createdAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.error(err);
            let msg = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                msg = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';
            } else if (err.code === 'auth/email-already-in-use') {
                msg = 'อีเมลนี้ถูกใช้งานไปแล้ว';
            } else if (err.code === 'auth/weak-password') {
                msg = 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
            }
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');
        try {
            const result = await signInWithPopup(auth, googleProvider);
            // Check if user exists, if not create doc
            const userRef = doc(db, 'users', result.user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    email: result.user.email,
                    isPremium: false,
                    createdAt: serverTimestamp()
                });
            }
        } catch (err) {
            console.error(err);
            setError('ไม่สามารถเข้าสู่ระบบด้วย Google ได้');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[var(--bg-mesh-4)]">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-accent-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-accent-primary to-accent-secondary shadow-xl shadow-accent-primary/30 mb-6">
                        <Lock className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-gradient mb-2">HorPlot | หอพล็อต</h1>
                    <p className="text-muted font-bold tracking-wide italic">หอพักนักเขียน</p>
                </div>

                <div className="glass-card p-6 md:p-10 bg-white/30 backdrop-blur-3xl saturate-150 border-white/40 shadow-2xl">
                    {/* Mode Toggle */}
                    <div className="flex mb-6 md:mb-8 bg-black/5 rounded-2xl p-1 relative z-10">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${isLogin ? 'bg-white text-accent-primary shadow-sm scale-[1.02]' : 'text-muted hover:text-accent-primary'}`}
                        >
                            เข้าสู่ระบบ
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${!isLogin ? 'bg-white text-accent-primary shadow-sm scale-[1.02]' : 'text-muted hover:text-accent-primary'}`}
                        >
                            สมัครสมาชิก
                        </button>
                    </div>

                    {/* Social Login Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={handleGoogleSignIn}
                            className="flex items-center justify-center space-x-3 bg-white/40 hover:bg-white/60 border border-white/50 py-3.5 rounded-2xl transition-all active:scale-[0.98] group"
                        >
                            <Chrome className="w-5 h-5 text-red-500 transition-transform group-hover:rotate-12" />
                            <span className="text-xs font-semibold">Google</span>
                        </button>
                        <div className="relative group/tooltip">
                            <button
                                disabled
                                className="w-full h-full flex items-center justify-center space-x-3 bg-black/5 cursor-not-allowed opacity-50 py-3.5 rounded-2xl border border-transparent"
                            >
                                <Apple className="w-5 h-5" />
                                <span className="text-xs font-semibold">Game Center</span>
                            </button>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 text-white text-[10px] rounded-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none shadow-2xl z-20">
                                <div className="flex items-start space-x-2">
                                    <Info className="w-3 h-3 text-accent-primary shrink-0" />
                                    <p className="leading-normal">Game Center รองรับเฉพาะการใช้งานผ่านแอปพลิเคชันบน Apple Platform เท่านั้น</p>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
                            </div>
                        </div>
                    </div>

                    <div className="relative flex items-center mb-8">
                        <div className="flex-grow border-t border-muted/10"></div>
                        <span className="flex-shrink mx-4 text-[10px] font-black uppercase tracking-widest text-muted/30 whitespace-nowrap">
                            {isLogin ? 'หรือเข้าด้วยอีเมล' : 'หรือสมัครด้วยอีเมล'}
                        </span>
                        <div className="flex-grow border-t border-muted/10"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                        <div className="relative group">
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted/60 mb-2 block ml-1">
                                อีเมล
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within:text-accent-primary" />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/20 border border-white/40 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all placeholder:text-muted/40"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-xs font-semibold uppercase tracking-widest text-muted/60 mb-2 block ml-1">
                                รหัสผ่าน
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted transition-colors group-focus-within:text-accent-primary" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/20 border border-white/40 rounded-2xl py-3.5 md:py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all placeholder:text-muted/40"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center space-x-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 animate-in fade-in zoom-in duration-300">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="text-xs font-medium leading-tight">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-accent-primary to-accent-secondary text-white py-4 md:py-5 rounded-2xl font-semibold shadow-lg shadow-accent-primary/25 hover:shadow-xl hover:shadow-accent-primary/35 transition-all active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center space-x-3"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
                                    <span className="tracking-wide text-sm md:text-base">{isLogin ? 'เริ่มต้นใช้งาน' : 'ยืนยันการสมัครสมาชิก'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Secondary Link */}
                    <div className="mt-8 text-center bg-black/5 rounded-xl py-3 border border-black/5">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs font-medium text-muted hover:text-accent-primary transition-colors underline underline-offset-4 decoration-accent-primary/20"
                        >
                            {isLogin ? 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่' : 'มีบัญชีอยู่แล้ว? เข้าสู่ระบบที่นี่'}
                        </button>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs font-medium text-muted/40 italic px-4">
                    {isLogin ? '© 2026 HorPlot | หอพล็อต – หอพักนักเขียน.' : '© 2026 HorPlot | หอพล็อต – หอพักนักเขียน.'}
                </p>
            </div>
        </div>
    );
};

export default Auth;
