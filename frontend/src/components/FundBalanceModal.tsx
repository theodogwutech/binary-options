'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { userAPI } from '@/lib/api';

interface FundBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
  currentBalance: number;
}

export default function FundBalanceModal({
  isOpen,
  onClose,
  onSuccess,
  currentBalance,
}: FundBalanceModalProps) {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'bank'>('card');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [10, 50, 100, 500, 1000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fundAmount = parseFloat(amount);
    if (isNaN(fundAmount) || fundAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (fundAmount < 10) {
      toast.error('Minimum funding amount is $10');
      return;
    }

    if (fundAmount > 10000) {
      toast.error('Maximum funding amount is $10,000');
      return;
    }

    setLoading(true);

    try {
      const response = await userAPI.fundBalance({
        amount: fundAmount,
        paymentMethod,
      });

      const { newBalance } = response.data.data;
      onSuccess(fundAmount);
      toast.success(`Successfully added $${fundAmount.toFixed(2)} to your balance!`);
      setAmount('');
      onClose();
    } catch (error: any) {
      console.error('Fund balance error:', error);
      const message = error.response?.data?.message || 'Failed to add funds. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-b border-green-500/20 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                      className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-900/50 flex items-center justify-center text-green-400"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </motion.div>
                    <div className="flex-1">
                      <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-lg font-bold text-white mb-2"
                      >
                        Fund Your Balance
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-sm text-gray-300"
                      >
                        Current Balance: <span className="text-green-400 font-semibold">${currentBalance.toFixed(2)}</span>
                      </motion.p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Amount (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400 text-lg">$</span>
                    </div>
                    <input
                      type="number"
                      min="10"
                      max="10000"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block w-full pl-8 pr-3 py-3 bg-gray-900/50 border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 transition-all"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-400">Minimum: $10 | Maximum: $10,000</p>
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {quickAmounts.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => handleQuickAmount(value)}
                        className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                          amount === value.toString()
                            ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        ${value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-xs font-semibold text-white">Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('crypto')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'crypto'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-white">Crypto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bank')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentMethod === 'bank'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
                      }`}
                    >
                      <svg className="w-6 h-6 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                      </svg>
                      <span className="text-xs font-semibold text-white">Bank</span>
                    </button>
                  </div>
                </div>

                {/* Summary */}
                {amount && parseFloat(amount) >= 10 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-green-900/10 to-emerald-900/10 border border-green-500/20 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">New Balance</span>
                      <span className="text-lg font-bold text-green-400">
                        ${(currentBalance + parseFloat(amount)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Payment Method</span>
                      <span className="capitalize">{paymentMethod}</span>
                    </div>
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gray-700/50 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Add Funds'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
