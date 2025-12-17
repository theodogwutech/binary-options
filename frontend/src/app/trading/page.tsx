'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { tradeAPI, assetAPI, userAPI } from '@/lib/api';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ConfirmModal';

interface Asset {
  _id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange: number;
  priceChangePercent: number;
  assetType: string;
  payoutPercentage: number;
}

interface Trade {
  _id: string;
  asset: { symbol: string; name: string };
  tradeType: string;
  amount: number;
  entryPrice: number;
  expiryTime: string;
  status: string;
  createdAt: string;
}

export default function TradingPage() {
  const router = useRouter();
  const { user, logout, updateBalance } = useAuthStore();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [tradeType, setTradeType] = useState<'call' | 'put'>('call');
  const [amount, setAmount] = useState('10');
  const [expiryMinutes, setExpiryMinutes] = useState('5');
  const [loading, setLoading] = useState(false);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [loadingTrades, setLoadingTrades] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const fetchAssets = async () => {
    try {
      const response = await assetAPI.getAssets({ isActive: 'true' });
      const fetchedAssets = response.data.data;
      setAssets(Array.isArray(fetchedAssets) ? fetchedAssets : []);

      // Set default selected asset
      if (!selectedAsset && fetchedAssets.length > 0) {
        setSelectedAsset(fetchedAssets[0]);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  const fetchActiveTrades = async () => {
    try {
      const response = await tradeAPI.getTrades({ status: 'active' });
      const trades = response.data.data.trades || [];
      setActiveTrades(Array.isArray(trades) ? trades : []);
    } catch (error) {
      console.error('Failed to fetch trades:', error);
      setActiveTrades([]);
    } finally {
      setLoadingTrades(false);
    }
  };

  useEffect(() => {
    setMounted(true);

    // Give Zustand time to hydrate from localStorage before redirecting
    const checkAuth = () => {
      const hasAuthToken = localStorage.getItem('accessToken');

      if (!user && !hasAuthToken) {
        router.push('/login');
        return;
      }

      // Only fetch if user is authenticated
      if (user) {
        // Fetch fresh balance from DB
        userAPI.getProfile().then(res => {
          updateBalance(res.data.data.balance);
        }).catch(err => console.error('Failed to fetch profile:', err));

        fetchAssets();
        fetchActiveTrades();
      }
    };

    // Delay check to allow Zustand to rehydrate
    const timeout = setTimeout(checkAuth, 150);
    return () => clearTimeout(timeout);
  }, [user, router]);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  const handleTrade = async () => {
    if (!selectedAsset) {
      toast.error('Please select an asset');
      return;
    }

    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount < 10) {
      toast.error('Minimum trade amount is $10');
      return;
    }

    if (!user || tradeAmount > user.balance) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const response = await tradeAPI.createTrade({
        assetId: selectedAsset._id,
        tradeType,
        amount: tradeAmount,
        expiryMinutes: parseInt(expiryMinutes),
      });

      // Update balance from backend response
      const newBalance = response.data.data.balance;
      if (newBalance !== undefined) {
        updateBalance(newBalance);
      }

      toast.success(`${tradeType.toUpperCase()} trade placed successfully! 🎉`);
      setAmount('10');
      fetchActiveTrades();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to place trade. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);

    // Minimum 1 second loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    logout();
    setShowLogoutModal(false);
    setLogoutLoading(false);
    router.push('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">BO</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Binary Options
                </span>
              </Link>

              <div className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-400 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/trading"
                  className="text-white font-medium px-3 py-2 rounded-lg bg-gray-800/50"
                >
                  Trade
                </Link>
                <Link
                  href="/history"
                  className="text-gray-400 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all"
                >
                  History
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-xs text-gray-400">Balance</p>
                <p className="text-lg font-bold text-green-400">
                  ${user.balance?.toFixed(2) || '0.00'}
                </p>
              </div>

              <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <span className="text-sm font-medium hidden md:block">
                  {user.firstName} {user.lastName}
                </span>
              </div>

              <button
                onClick={handleLogoutClick}
                className="text-gray-400 hover:text-white transition-colors"
                title="Logout"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Live Trading</h1>
          <p className="text-gray-400">Trade binary options with real-time market data</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Asset Selection & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Selection */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Select Asset</h2>

              <div className="grid md:grid-cols-2 gap-3">
                {loadingAssets ? (
                  <div className="col-span-2 text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-gray-400 mt-2">Loading assets...</p>
                  </div>
                ) : assets.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-400">No assets available</p>
                  </div>
                ) : (
                  assets.map((asset) => (
                    <button
                      key={asset._id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`p-4 rounded-xl border transition-all text-left ${
                        selectedAsset?._id === asset._id
                          ? 'bg-blue-900/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                          : 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600/50'
                      }`}
                    >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-white">{asset.symbol}</p>
                      <p className={`text-xs font-medium ${asset.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {asset.priceChangePercent >= 0 ? '+' : ''}{asset.priceChangePercent}%
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{asset.name}</p>
                    <p className="text-lg font-bold text-white">${asset.currentPrice.toLocaleString()}</p>
                  </button>
                  ))
                )}
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">
                  {selectedAsset?.symbol || 'Select Asset'} Chart
                </h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all">1m</button>
                  <button className="px-3 py-1 text-xs bg-blue-600 rounded-lg">5m</button>
                  <button className="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all">15m</button>
                  <button className="px-3 py-1 text-xs bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all">1h</button>
                </div>
              </div>

              {/* Chart placeholder */}
              <div className="bg-gray-900/50 rounded-xl p-8 h-96 flex items-center justify-center">
                <div className="text-center">
                  <svg className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-400 text-sm">Live price chart coming soon</p>
                  <p className="text-gray-500 text-xs mt-2">Integration with TradingView or lightweight-charts</p>
                </div>
              </div>

              {selectedAsset && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-gray-900/50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Current Price</p>
                    <p className="text-lg font-bold text-white">${selectedAsset.currentPrice.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">24h Change</p>
                    <p className={`text-lg font-bold ${selectedAsset.priceChangePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedAsset.priceChangePercent >= 0 ? '+' : ''}{selectedAsset.priceChangePercent}%
                    </p>
                  </div>
                  <div className="bg-gray-900/50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">Payout</p>
                    <p className="text-lg font-bold text-green-400">{selectedAsset.payoutPercentage}%</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Trade Form & Active Trades */}
          <div className="space-y-6">
            {/* Trade Form */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Place Trade</h2>

              {/* Trade Type */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-300 mb-2">Trade Type</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTradeType('call')}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      tradeType === 'call'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/25'
                        : 'bg-gray-900/50 text-gray-400 hover:bg-gray-900'
                    }`}
                  >
                    CALL ↑
                  </button>
                  <button
                    onClick={() => setTradeType('put')}
                    className={`py-3 rounded-xl font-semibold transition-all ${
                      tradeType === 'put'
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25'
                        : 'bg-gray-900/50 text-gray-400 hover:bg-gray-900'
                    }`}
                  >
                    PUT ↓
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="10"
                  step="10"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
                <p className="text-xs text-gray-500 mt-1">Minimum: $10</p>
              </div>

              {/* Expiry Time */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Expiry Time
                </label>
                <select
                  value={expiryMinutes}
                  onChange={(e) => setExpiryMinutes(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1">1 minute</option>
                  <option value="5">5 minutes</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                </select>
              </div>

              {/* Potential Profit */}
              {selectedAsset && amount && (
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-400">Potential Profit:</p>
                    <p className="text-lg font-bold text-green-400">
                      +${(parseFloat(amount) * (selectedAsset.payoutPercentage / 100)).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-sm text-gray-400">Payout Rate:</p>
                    <p className="text-sm font-semibold text-blue-400">{selectedAsset.payoutPercentage}%</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleTrade}
                disabled={loading || !selectedAsset}
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg ${
                  tradeType === 'call'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/25 hover:shadow-green-500/40'
                    : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 shadow-red-500/25 hover:shadow-red-500/40'
                } disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Placing Trade...
                  </span>
                ) : (
                  `Place ${tradeType.toUpperCase()} Trade`
                )}
              </button>
            </div>

            {/* Active Trades */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">Active Trades</h2>
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-full">
                  {activeTrades.length}
                </span>
              </div>

              {loadingTrades ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : activeTrades.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="h-12 w-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <p className="text-gray-400 text-sm">No active trades</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeTrades.map((trade) => (
                    <div
                      key={trade._id}
                      className="p-3 bg-gray-900/50 border border-gray-700/50 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-white">
                          {trade.asset?.symbol || 'Unknown'}
                        </p>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          trade.tradeType === 'call'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.tradeType.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white font-semibold">${trade.amount}</span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-400">Entry:</span>
                        <span className="text-white">${trade.entryPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmText="Logout"
        cancelText="Stay Logged In"
        type="warning"
        loading={logoutLoading}
      />
    </div>
  );
}
