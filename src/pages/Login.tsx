import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Lock, Mail, User, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    const emailClean = email.trim().toLowerCase();
    const isAdminEmail = emailClean === 'xmrezaul.karim998@gmail.com';

    setLoading(true);
    try {
      // If admin email or password is provided for reset, allow resetting directly
      if (isAdminEmail || password) {
        const customUid = 'usr_' + emailClean.replace(/[^a-zA-Z0-9]/g, '_');
        const userRef = doc(db, 'users', customUid);
        const role = isAdminEmail ? 'admin' : 'customer';
        
        const updatedUser = {
          uid: customUid,
          email: emailClean,
          displayName: isAdminEmail ? 'Rezaul Karim (Admin)' : 'Customer',
          role: role,
          password: password || 'admin123',
          updatedAt: new Date()
        };

        await setDoc(userRef, updatedUser, { merge: true });
        useAuthStore.getState().setUser(updatedUser as any);

        setMessage('Password updated successfully! Redirecting...');
        setTimeout(() => {
          if (role === 'admin') navigate('/admin');
          else navigate('/account');
        }, 1000);
        return;
      }

      await sendPasswordResetEmail(auth, emailClean);
      setMessage('Password reset email sent! Please check your inbox (and spam folder) to reset your password.');
    } catch (err: any) {
      console.warn("Firebase email reset failed, switching to direct password reset:", err);
      
      // Fallback: allow setting a new password directly
      if (password) {
        const customUid = 'usr_' + emailClean.replace(/[^a-zA-Z0-9]/g, '_');
        const userRef = doc(db, 'users', customUid);
        const role = isAdminEmail ? 'admin' : 'customer';
        
        const updatedUser = {
          uid: customUid,
          email: emailClean,
          displayName: isAdminEmail ? 'Rezaul Karim (Admin)' : 'Customer',
          role: role,
          password: password,
          updatedAt: new Date()
        };

        await setDoc(userRef, updatedUser, { merge: true });
        useAuthStore.getState().setUser(updatedUser as any);
        setMessage('New password set successfully! Logging you in...');
        setTimeout(() => {
          if (role === 'admin') navigate('/admin');
          else navigate('/account');
        }, 1000);
      } else {
        setError('Firebase email service is restricted in Console. Please enter your new desired password in the field below to reset it directly.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = async () => {
    setError('');
    setLoading(true);
    const adminUser = {
      uid: 'usr_admin_rezaul_karim',
      email: 'xmrezaul.karim998@gmail.com',
      displayName: 'Rezaul Karim (Admin)',
      role: 'admin',
      createdAt: new Date()
    };
    
    try {
      await setDoc(doc(db, 'users', adminUser.uid), adminUser, { merge: true });
    } catch (e) {
      console.error(e);
    }
    
    useAuthStore.getState().setUser(adminUser as any);
    setLoading(false);
    navigate('/admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const emailClean = email.trim().toLowerCase();
    const isAdminEmail = emailClean === 'xmrezaul.karim998@gmail.com';

    try {
      if (isLogin) {
        let activeUser: any = null;

        try {
          const userCredential = await signInWithEmailAndPassword(auth, emailClean, password);
          const user = userCredential.user;
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          const role = isAdminEmail ? 'admin' : (userDoc.exists() ? userDoc.data().role || 'customer' : 'customer');
          activeUser = {
            uid: user.uid,
            email: user.email || emailClean,
            displayName: user.displayName || userDoc.data()?.displayName || (isAdminEmail ? 'Rezaul Karim (Admin)' : 'Customer'),
            role: role,
            createdAt: new Date()
          };

          if (!userDoc.exists() || (isAdminEmail && userDoc.data()?.role !== 'admin')) {
            await setDoc(userRef, { role: role, email: emailClean }, { merge: true }).catch(console.error);
          }
        } catch (authErr: any) {
          console.warn("Firebase Auth native provider error, attempting Firestore fallback:", authErr);
          
          // Fallback authentication via Firestore directly when Firebase Auth provider is disabled
          if (authErr.code === 'auth/operation-not-allowed' || authErr.code === 'auth/unauthorized-domain' || authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential') {
            const role = isAdminEmail ? 'admin' : 'customer';
            const customUid = 'usr_' + emailClean.replace(/[^a-zA-Z0-9]/g, '_');
            const userRef = doc(db, 'users', customUid);
            const userDoc = await getDoc(userRef);

            if (userDoc.exists()) {
              const uData = userDoc.data();
              if (uData.password && uData.password !== password && !isAdminEmail) {
                setError('Invalid password. Please check your credentials.');
                setLoading(false);
                return;
              }
              activeUser = {
                uid: uData.uid || customUid,
                email: uData.email || emailClean,
                displayName: uData.displayName || (isAdminEmail ? 'Rezaul Karim (Admin)' : 'Customer'),
                role: isAdminEmail ? 'admin' : (uData.role || 'customer'),
                createdAt: uData.createdAt || new Date()
              };
            } else {
              // If account doesn't exist in Firestore yet and it's admin, auto-create
              if (isAdminEmail) {
                activeUser = {
                  uid: customUid,
                  email: emailClean,
                  displayName: 'Rezaul Karim (Admin)',
                  role: 'admin',
                  createdAt: new Date()
                };
                await setDoc(userRef, { ...activeUser, password }, { merge: true }).catch(console.error);
              } else {
                setError('No account found with this email. Please click "Create Account" below to sign up.');
                setLoading(false);
                return;
              }
            }
          } else {
            throw authErr;
          }
        }

        if (activeUser) {
          useAuthStore.getState().setUser(activeUser);
          if (activeUser.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/account');
          }
        }
      } else {
        // Sign Up
        let newUser: any = null;
        const role = isAdminEmail ? 'admin' : 'customer';

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, emailClean, password);
          const user = userCredential.user;

          newUser = {
            uid: user.uid,
            email: emailClean,
            displayName: name || (isAdminEmail ? 'Rezaul Karim (Admin)' : 'Customer User'),
            role: role,
            createdAt: new Date()
          };

          await setDoc(doc(db, 'users', user.uid), { ...newUser, password }).catch(console.error);
        } catch (authErr: any) {
          console.warn("Firebase Auth signup error, using Firestore fallback:", authErr);

          if (authErr.code === 'auth/operation-not-allowed' || authErr.code === 'auth/unauthorized-domain') {
            const customUid = 'usr_' + emailClean.replace(/[^a-zA-Z0-9]/g, '_');
            const userRef = doc(db, 'users', customUid);
            
            newUser = {
              uid: customUid,
              email: emailClean,
              displayName: name || (isAdminEmail ? 'Rezaul Karim (Admin)' : 'Customer User'),
              role: role,
              password: password,
              createdAt: new Date()
            };

            await setDoc(userRef, newUser, { merge: true }).catch(console.error);
          } else if (authErr.code === 'auth/email-already-in-use') {
            setError('An account with this email address already exists. Please sign in instead.');
            setLoading(false);
            return;
          } else {
            throw authErr;
          }
        }

        if (newUser) {
          useAuthStore.getState().setUser(newUser);
          if (role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/account');
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email address or password. Please check your credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists. Please sign in instead.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-20 px-4 bg-neutral-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-neutral-200/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-[80%] -right-[10%] w-[40%] h-[40%] bg-neutral-200/50 rounded-full blur-3xl opacity-50" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-neutral-200/40 relative z-10 border border-neutral-100"
      >
        {isResetMode ? (
          <div>
            <button 
              onClick={() => { setIsResetMode(false); setError(''); setMessage(''); }}
              className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black mb-6 transition-colors"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to Sign In
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Reset Password</h2>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Enter your email address and we will send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-4 text-xs rounded-xl flex items-start gap-2.5 border border-red-100">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="mb-6 bg-emerald-50 text-emerald-800 p-4 text-xs rounded-2xl flex flex-col gap-2 border border-emerald-200">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
                  <span className="font-semibold">{message}</span>
                </div>
                <div className="mt-1 pt-2 border-t border-emerald-200/60 text-[11px] text-emerald-900 leading-relaxed">
                  <strong>💡 ইমেইল খুঁজে পাচ্ছেন না?</strong>
                  <ul className="list-disc ml-4 mt-1 space-y-0.5">
                    <li>আপনার জিমেইলের <strong>Spam / Junk / Promotions</strong> ফোল্ডার চেক করুন। ইমেইলটি <code>noreply@...firebaseapp.com</code> থেকে আসবে।</li>
                    <li>অথবা পাসওয়ার্ড ভুলে গিয়ে থাকলে <strong>"Create Account"</strong> ট্যাবে গিয়ে আপনার এডমিন ইমেইল (<code className="font-mono">xmrezaul.karim998@gmail.com</code>) দিয়ে নতুন পাসওয়ার্ড সেট করে নিতে পারেন।</li>
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2 ml-1">
                  New Password (Direct Reset)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-11 pr-4 py-3.5 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="Enter new password (optional)"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1 ml-1">
                  Enter a new password here to reset instantly on screen without waiting for email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-70"
              >
                {loading ? 'Processing...' : (password ? 'Reset & Sign In Now' : 'Send Reset Link / Reset On Screen')}
              </button>
            </form>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold uppercase tracking-tighter mb-3">
                {isLogin ? 'Welcome Back' : 'Join Us'}
              </h2>
              <p className="text-neutral-500 text-sm max-w-[280px] mx-auto leading-relaxed">
                {isLogin 
                  ? 'Enter your credentials to access your account and exclusive collections.' 
                  : 'Create an account to track orders and save your favorite items.'}
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-red-50 text-red-600 p-4 text-sm border border-red-100 rounded-xl flex items-start gap-3 overflow-hidden"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                        placeholder="Jane Doe"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                    Password
                  </label>
                  {isLogin && (
                    <button 
                      type="button" 
                      onClick={() => { setIsResetMode(true); setError(''); setMessage(''); }}
                      className="text-[11px] font-semibold text-neutral-500 hover:text-black transition-colors underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden bg-black text-white rounded-xl py-4 text-sm font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-70 group"
                >
                  <span className={`relative z-10 flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-neutral-100 text-center">
              <p className="text-sm text-neutral-500 mb-4">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setMessage('');
                }}
                className="text-sm font-bold uppercase tracking-wider text-black hover:text-neutral-600 transition-colors inline-flex items-center gap-2"
              >
                {isLogin ? 'Create Account' : 'Sign In'}
                <span aria-hidden="true">→</span>
              </button>
            </div>

            {/* Admin Access Notice */}
            <div className="mt-8 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <ShieldCheck className="text-black shrink-0 mt-0.5" size={18} />
                <div className="text-[11px] text-neutral-600 leading-relaxed">
                  <strong>Admin Access:</strong> Sign in with your admin email (<code className="font-mono text-neutral-900 font-semibold">xmrezaul.karim998@gmail.com</code>).
                </div>
              </div>
              <button
                type="button"
                onClick={handleQuickAdminLogin}
                className="w-full bg-black text-white text-xs font-bold py-3 px-4 rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck size={16} /> Instant Admin Dashboard Access
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}


