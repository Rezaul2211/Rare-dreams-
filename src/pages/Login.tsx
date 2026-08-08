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
      setError('Please enter your email address to reset password.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage('Password reset email sent! Please check your inbox (and spam folder) to reset your password.');
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError(err.message || 'Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
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
        const userCredential = await signInWithEmailAndPassword(auth, emailClean, password);
        const user = userCredential.user;
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        const role = isAdminEmail ? 'admin' : (userDoc.exists() ? userDoc.data().role || 'customer' : 'customer');
        const activeUser = {
          uid: user.uid,
          email: user.email || emailClean,
          displayName: user.displayName || userDoc.data()?.displayName || (isAdminEmail ? 'Rezaul Karim (Admin)' : 'Customer'),
          role: role,
          createdAt: new Date()
        };

        if (!userDoc.exists() || (isAdminEmail && userDoc.data()?.role !== 'admin')) {
          await setDoc(userRef, { role: role, email: emailClean }, { merge: true }).catch(console.error);
        }

        useAuthStore.getState().setUser(activeUser as any);

        if (isAdminEmail) {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, emailClean, password);
        const user = userCredential.user;
        const role = isAdminEmail ? 'admin' : 'customer';

        const newUser = {
          uid: user.uid,
          email: emailClean,
          displayName: name || (isAdminEmail ? 'Rezaul Karim (Admin)' : 'Customer User'),
          role: role,
          createdAt: new Date()
        };

        await setDoc(doc(db, 'users', user.uid), newUser);
        useAuthStore.getState().setUser(newUser as any);

        if (isAdminEmail) {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email address or password. Please check your credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email address already exists. Please sign in instead.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password Sign-in is disabled in Firebase Console. Please enable Email/Password under Authentication -> Sign-in method.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase. Add raredreams.vercel.app to Authorized Domains in Firebase Console.');
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
              <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 text-xs rounded-xl flex items-start gap-2.5 border border-emerald-100">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
                <span>{message}</span>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white rounded-xl py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors disabled:opacity-70"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
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
            <div className="mt-8 bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex gap-3 items-start">
              <ShieldCheck className="text-neutral-500 shrink-0 mt-0.5" size={18} />
              <p className="text-[11px] text-neutral-600 leading-relaxed">
                <strong>Admin Access:</strong> Sign in with your registered admin email (<code className="font-mono text-neutral-900 font-semibold">xmrezaul.karim998@gmail.com</code>) and password to access store management.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}


