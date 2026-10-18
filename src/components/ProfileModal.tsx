import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Wallet, User, Mail, Shield, Save } from 'lucide-react';
import { UserProfile } from '../types';
import { updateUserProfile } from '../lib/firebase';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUserUpdated: (updatedUser: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [paymongoAccountId, setPaymongoAccountId] = useState(currentUser.paymongoAccountId || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updates = {
        name: name.trim(),
        paymongoAccountId: paymongoAccountId.trim(),
      };
      await updateUserProfile(currentUser.uid || currentUser.id, updates);
      const updated = { ...currentUser, ...updates };
      onUserUpdated(updated);
      setSuccessMsg('Profile and PayMongo payout details updated in Firestore!');
      setTimeout(() => {
        setSuccessMsg('');
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#F8EDEF] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-[#800000] via-[#570018] to-[#400010] text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-white/20 font-bold">
              Profile & Payout Settings
            </span>
          </div>
          <h2 className="text-xl font-extrabold">{currentUser.name}</h2>
          <p className="text-xs text-[#E5D6DA] font-mono mt-0.5 truncate">{currentUser.email}</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* User ID & Role Badges */}
          <div className="p-3 bg-[#FAF9F9] rounded-xl border border-[#F8EDEF] space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#746B70]">User UID:</span>
              <span className="font-mono text-[11px] font-bold text-[#292329] truncate max-w-[200px]">
                {currentUser.uid || currentUser.id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#746B70]">Account Role:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                currentUser.role === 'admin'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                {currentUser.role}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#292329] mb-1">Display Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-[#800000]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#292329] mb-1">
              PayMongo Account ID / Direct Payout Destination
            </label>
            <div className="relative">
              <Wallet className="absolute left-3 top-2.5 w-4 h-4 text-[#800000]" />
              <input
                type="text"
                value={paymongoAccountId}
                onChange={(e) => setPaymongoAccountId(e.target.value)}
                placeholder="acct_paymongo_... or GCash: 0917-123-4567"
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F9] border border-[#E8A5A9]/70 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#800000]/20 font-mono"
              />
            </div>
            <p className="text-[11px] text-[#746B70] mt-1 leading-relaxed">
              When buyers purchase your uploaded notes via PayMongo Checkout, funds and platform payouts are mapped directly to this account.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#746B70] hover:bg-[#F8EDEF] rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-[#800000] via-[#A01A33] to-[#C02636] hover:from-[#6B1E35] text-white font-bold text-xs rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
