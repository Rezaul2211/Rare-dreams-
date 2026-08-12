import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, updateDoc, doc, deleteDoc, writeBatch, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { assignUserRoleByEmail, revokeUserRoleByEmail } from '../../lib/roles';
import { ShieldAlert, Trash2, Mail, ShieldCheck, Database, Server, Loader2, AlertTriangle, CheckCircle2, UserMinus, Cpu, Sparkles, RefreshCw, Activity, Radio, Check, XCircle } from 'lucide-react';

export default function AdminSystem() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [loadingRole, setLoadingRole] = useState(false);
  const [roleMessage, setRoleMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [staffUsers, setStaffUsers] = useState<any[]>([]);

  // AI Health Check State
  const [testingHealth, setTestingHealth] = useState(false);
  const [healthData, setHealthData] = useState<{
    gemini?: { configured: boolean; reachable: boolean; keySnippet: string; message: string };
    groq?: { configured: boolean; reachable: boolean; keySnippet: string; message: string };
  } | null>(null);

  const fetchAiHealth = async () => {
    setTestingHealth(true);
    try {
      const res = await fetch('/api/ai-health-check');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (e) {
      console.error("Error testing AI health:", e);
    } finally {
      setTestingHealth(false);
    }
  };

  useEffect(() => {
    fetchAiHealth();
  }, []);

  useEffect(() => {
    // Listen to users with admin/seller role
    const qUsers = query(collection(db, 'users'), where('role', 'in', ['admin', 'seller']));
    const qAuthRoles = collection(db, 'authorized_roles');

    let userStaff: any[] = [];
    let authStaff: any[] = [];

    const mergeAndSetStaff = () => {
      const map = new Map<string, any>();
      authStaff.forEach(u => {
        if (u.role === 'admin' || u.role === 'seller') {
          map.set(u.email.toLowerCase(), u);
        }
      });
      userStaff.forEach(u => {
        if (u.email && (u.role === 'admin' || u.role === 'seller')) {
          map.set(u.email.toLowerCase(), { ...map.get(u.email.toLowerCase()), ...u });
        }
      });
      setStaffUsers(Array.from(map.values()));
    };

    const unsubUsers = onSnapshot(qUsers, (snapshot) => {
      userStaff = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      mergeAndSetStaff();
    });

    const unsubAuth = onSnapshot(qAuthRoles, (snapshot) => {
      authStaff = snapshot.docs.map(doc => ({ id: doc.id, email: doc.id, ...doc.data() }));
      mergeAndSetStaff();
    });
    
    return () => {
      unsubUsers();
      unsubAuth();
    };
  }, []);

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoadingRole(true);
    setRoleMessage(null);
    try {
      const cleanEmail = email.trim().toLowerCase();
      await assignUserRoleByEmail(cleanEmail, role as any);
      setRoleMessage({ 
        type: 'success', 
        text: `পারমিশন সফলভাবে দেওয়া হয়েছে! ${cleanEmail} অ্যাকাউন্টটিতে ${role.toUpperCase()} পারমিশন যোগ করা হলো। ইউজার এখন সাইন-ইন করলে সরাসরি অ্যাডমিন প্যানেল পাবে।` 
      });
      setEmail('');
    } catch (error: any) {
      console.error(error);
      setRoleMessage({ type: 'error', text: error.message || 'Failed to update role' });
    } finally {
      setLoadingRole(false);
    }
  };

  const handleRevokeAccess = async (userId: string, userEmail: string) => {
    if (!window.confirm(`Are you sure you want to revoke admin/seller access for ${userEmail}?`)) return;
    
    try {
      await revokeUserRoleByEmail(userEmail);
      setRoleMessage({ type: 'success', text: `Successfully revoked access for ${userEmail}. They are now a standard customer.` });
      setTimeout(() => setRoleMessage(null), 4000);
    } catch (error: any) {
      console.error(error);
      alert('Failed to revoke access: ' + error.message);
    }
  };

  const handleClearHistory = async () => {
    const confirm = window.confirm(
      "DANGER: Are you sure you want to permanently delete all order history and sales data? This action cannot be undone."
    );
    if (!confirm) return;

    const confirm2 = window.confirm("Final confirmation. Type OK in the console... Just kidding, click OK to proceed.");
    if (!confirm2) return;

    setLoadingDelete(true);
    setDeleteMessage(null);
    try {
      // Get all orders
      const ordersSnap = await getDocs(collection(db, 'orders'));
      
      // Batch delete in chunks of 500
      const batches = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;

      ordersSnap.docs.forEach((docSnap) => {
        currentBatch.delete(docSnap.ref);
        operationCount++;
        
        if (operationCount === 499) {
          batches.push(currentBatch.commit());
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
      });
      
      if (operationCount > 0) {
        batches.push(currentBatch.commit());
      }
      
      await Promise.all(batches);
      
      setDeleteMessage({ type: 'success', text: `Successfully deleted ${ordersSnap.size} order records. Selling history wiped.` });
    } catch (error: any) {
      console.error(error);
      setDeleteMessage({ type: 'error', text: error.message || 'Failed to clear history' });
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-6 rounded-3xl border border-neutral-200 shadow-xs gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 flex items-center gap-2">
            <span>System & AI Infrastructure</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">Manage admin permissions, AI API connectivity test, and data storage</p>
        </div>
        <button
          onClick={fetchAiHealth}
          disabled={testingHealth}
          className="inline-flex items-center justify-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          {testingHealth ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          <span>এআই হেলথ টেস্ট টেস্ট করুন</span>
        </button>
      </div>

      {/* AI Health Connectivity Card */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white p-6 sm:p-8 rounded-3xl border border-neutral-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Cpu size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                <span>AI API Connectivity Status</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-md border border-amber-500/30">
                  Live Status
                </span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Verifying Google Gemini API & Groq LLM API credentials & response test
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Google Gemini API */}
          <div className="bg-neutral-800/80 p-5 rounded-2xl border border-neutral-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles size={18} className="text-amber-400" />
                <span className="font-bold text-sm text-white">Google Gemini API</span>
              </div>
              {healthData?.gemini?.reachable ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={13} /> Active & Reachable
                </span>
              ) : healthData?.gemini?.configured ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  <AlertTriangle size={13} /> Connection Issue
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full">
                  <XCircle size={13} /> Not Configured
                </span>
              )}
            </div>
            
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Model Alias:</span>
                <span className="font-mono text-neutral-200">gemini-2.5-flash</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>API Key Prefix:</span>
                <span className="font-mono text-neutral-200">{healthData?.gemini?.keySnippet || 'Checking...'}</span>
              </div>
              <div className="pt-2 text-[11px] text-neutral-300 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                {healthData?.gemini?.message || (testingHealth ? "Testing connection..." : "Click test button above")}
              </div>
            </div>
          </div>

          {/* Groq AI API */}
          <div className="bg-neutral-800/80 p-5 rounded-2xl border border-neutral-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity size={18} className="text-orange-400" />
                <span className="font-bold text-sm text-white">Groq Engine API</span>
              </div>
              {healthData?.groq?.reachable ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={13} /> Active & Reachable
                </span>
              ) : healthData?.groq?.configured ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  <AlertTriangle size={13} /> Connection Issue
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-full">
                  <XCircle size={13} /> Not Configured
                </span>
              )}
            </div>
            
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-400">
                <span>Model Engine:</span>
                <span className="font-mono text-neutral-200">llama-3.3-70b-versatile</span>
              </div>
              <div className="flex items-center justify-between text-neutral-400">
                <span>API Key Prefix:</span>
                <span className="font-mono text-neutral-200">{healthData?.groq?.keySnippet || 'Checking...'}</span>
              </div>
              <div className="pt-2 text-[11px] text-neutral-300 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
                {healthData?.groq?.message || (testingHealth ? "Testing connection..." : "Click test button above")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Storage Widget */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
              <Database size={20} className="text-emerald-600" />
              Storage & Limits
            </h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-900 uppercase">Cloud Storage</span>
                <span className="text-xs font-bold text-emerald-700">120 MB / 5 GB Free</span>
              </div>
              <div className="w-full bg-emerald-100 rounded-full h-2 mb-1 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
              <p className="text-[10px] text-emerald-700 font-medium mt-2">
                Firebase provides 5GB of free storage for images and videos. High limits are available if you upgrade your plan.
              </p>
            </div>

            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-blue-900 uppercase">Database Reads</span>
                <span className="text-xs font-bold text-blue-700">1.2K / 50K Daily Free</span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-2 mb-1 overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '2%' }}></div>
              </div>
              <p className="text-[10px] text-blue-700 font-medium mt-2">
                Firestore provides 50,000 free document reads per day.
              </p>
            </div>
          </div>
        </div>

        {/* Roles & Permissions */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-4">
            <h2 className="text-lg font-black uppercase text-neutral-900 tracking-tight flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-600" />
              Role Assignment
            </h2>
            <p className="text-[10px] text-neutral-500 mt-1 uppercase tracking-wider font-bold">
              Grant Admin or Seller Permissions via Email
            </p>
          </div>
          
          <form onSubmit={handleAssignRole} className="space-y-4">
            {roleMessage && (
              <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                roleMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {roleMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                {roleMessage.text}
              </div>
            )}
            
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">User Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-neutral-400" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seller@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Assign Role</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Admin (Full Access)</option>
                <option value="seller">Seller (Manage Products)</option>
                <option value="customer">Customer (Standard)</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              disabled={loadingRole || !email}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingRole ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
              <span>Update User Role</span>
            </button>
          </form>

          {staffUsers.length > 0 && (
            <div className="pt-4 border-t border-neutral-100">
              <h3 className="text-[10px] font-bold uppercase text-neutral-500 mb-3">Current Staff Members</h3>
              <div className="space-y-2">
                {staffUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <div className="truncate pr-2">
                      <p className="text-xs font-bold text-neutral-900 truncate">{u.email}</p>
                      <p className="text-[10px] text-neutral-500 uppercase font-bold">{u.role}</p>
                    </div>
                    <button type="button" onClick={() => handleRevokeAccess(u.id, u.email)} className="shrink-0 p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors" title="Revoke Access">
                      <UserMinus size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="lg:col-span-2 bg-red-50/30 p-6 sm:p-8 rounded-3xl border border-red-100 shadow-xs space-y-6">
          <div className="border-b border-red-100 pb-4">
            <h2 className="text-lg font-black uppercase text-red-700 tracking-tight flex items-center gap-2">
              <ShieldAlert size={20} className="text-red-600" />
              Danger Zone
            </h2>
            <p className="text-[10px] text-red-500/80 mt-1 uppercase tracking-wider font-bold">
              Irreversible Data Operations
            </p>
          </div>
          
          {deleteMessage && (
            <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
              deleteMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
            }`}>
              {deleteMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
              {deleteMessage.text}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between bg-white p-5 rounded-2xl border border-red-100">
            <div>
              <h3 className="text-sm font-black text-neutral-900 mb-1">Clear Selling History</h3>
              <p className="text-xs text-neutral-500 max-w-md">
                Permanently delete all past orders and transaction records. This is useful when moving from testing/development into a live production environment.
              </p>
            </div>
            <button 
              onClick={handleClearHistory}
              disabled={loadingDelete}
              className="shrink-0 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 font-bold py-3 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loadingDelete ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              <span>Wipe Data</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
