'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { tradeAPI, userAPI } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';
import FundBalanceModal from '@/components/FundBalanceModal';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, updateBalance } = useAuthStore();
  const [stats, setStats] = useState({
    totalTrades: 0,
    activeTrades: 0,
    winRate: 0,
    totalProfit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [showFundModal, setShowFundModal] = useState(false);

  useEffect(() => {
    // Give Zustand time to hydrate from localStorage before redirecting
    const checkAuth = () => {
      const hasAuthToken = localStorage.getItem('accessToken');

      if (!user && !hasAuthToken) {
        router.push('/login');
      }
    };

    // Delay check to allow Zustand to rehydrate
    const timeout = setTimeout(checkAuth, 150);
    return () => clearTimeout(timeout);
  }, [user, router]);

  useEffect(() => {
    if (!user) return;

    // Fetch user profile and stats
    const fetchData = async () => {
      try {
        // Fetch fresh user profile to get latest balance
        const profileResponse = await userAPI.getProfile();
        const userData = profileResponse.data.data;
        updateBalance(userData.balance);

        // Fetch trades for stats
        const response = await tradeAPI.getTrades();
        const trades = response.data.data.trades || [];

        const totalTrades = trades.length;
        const activeTrades = trades.filter((t: any) => t.status === 'active').length;
        const closedTrades = trades.filter((t: any) => t.status === 'won' || t.status === 'lost' || t.status === 'cancelled');
        const wonTrades = closedTrades.filter((t: any) => t.status === 'won').length;
        const winRate = closedTrades.length > 0 ? (wonTrades / closedTrades.length) * 100 : 0;
        const totalProfit = trades.reduce((sum: number, t: any) => sum + (t.profit || 0), 0);

        setStats({
          totalTrades,
          activeTrades,
          winRate,
          totalProfit,
        });
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

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

  const handleFundSuccess = (amount: number) => {
    if (user) {
      const newBalance = user.balance + amount;
      updateBalance(newBalance);
    }
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
                  className="text-white font-medium px-3 py-2 rounded-lg bg-gray-800/50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/trading"
                  className="text-gray-400 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all"
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

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLogoutClick}
                className="text-gray-400 hover:text-white transition-colors"
                title="Logout"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.firstName}!
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your trading today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-green-400 font-medium">BALANCE</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${user.balance?.toFixed(2) || '0.00'}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Account Balance</p>
              <button
                onClick={() => setShowFundModal(true)}
                className="text-xs font-semibold text-green-400 hover:text-green-300 transition-colors flex items-center space-x-1 group"
              >
                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Funds</span>
              </button>
            </div>
          </motion.div>

          {/* Total Trades Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs text-blue-400 font-medium">TRADES</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {loading ? '-' : stats.totalTrades}
            </p>
            <p className="text-sm text-gray-400">Total Trades</p>
          </motion.div>

          {/* Win Rate Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className="text-xs text-purple-400 font-medium">WIN RATE</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              {loading ? '-' : `${stats.winRate.toFixed(1)}%`}
            </p>
            <p className="text-sm text-gray-400">Success Rate</p>
          </motion.div>

          {/* Profit Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/20 rounded-2xl p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <svg className="h-6 w-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-orange-400 font-medium">P&L</span>
            </div>
            <p className={`text-3xl font-bold mb-1 ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {loading ? '-' : `${stats.totalProfit >= 0 ? '+' : ''}$${stats.totalProfit.toFixed(2)}`}
            </p>
            <p className="text-sm text-gray-400">Total Profit/Loss</p>
          </motion.div>
        </div>

        {/* Quick Actions & Active Trades */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Trade Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Trade</h3>

              <Link
                href="/trading"
                className="block w-full mb-3"
              >
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]">
                  Start Trading
                </button>
              </Link>

              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                  <span className="text-sm text-gray-400">Active Trades</span>
                  <span className="text-lg font-bold text-blue-400">{loading ? '-' : stats.activeTrades}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-xl">
                  <span className="text-sm text-gray-400">Payout Rate</span>
                  <span className="text-lg font-bold text-green-400">85%</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/20 rounded-xl">
                <div className="flex items-start space-x-2">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-gray-300">
                    Start with as little as $10 and trade 100+ assets with real-time market data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <Link href="/history" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <p className="text-gray-400 mt-4">Loading trades...</p>
                </div>
              ) : stats.totalTrades === 0 ? (
                <div className="text-center py-12">
                  <svg className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-400 mb-4">No trades yet</p>
                  <Link
                    href="/trading"
                    className="inline-block text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Place your first trade →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-400 text-sm">You have {stats.activeTrades} active trade{stats.activeTrades !== 1 ? 's' : ''}</p>
                  <Link
                    href="/trading"
                    className="block text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    View active trades →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Market Overview */}
        <div className="mt-6">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Popular Assets</h3>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { symbol: 'EUR/USD', price: '1.0850', change: '+0.23%', positive: true },
                { symbol: 'BTC/USD', price: '43,250', change: '+2.15%', positive: true },
                { symbol: 'GBP/USD', price: '1.2640', change: '-0.18%', positive: false },
                { symbol: 'AAPL', price: '178.45', change: '+1.05%', positive: true },
              ].map((asset) => (
                <div
                  key={asset.symbol}
                  className="bg-gray-900/50 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all cursor-pointer"
                >
                  <p className="text-sm font-semibold text-white mb-2">{asset.symbol}</p>
                  <p className="text-lg font-bold text-white mb-1">${asset.price}</p>
                  <p className={`text-xs font-medium ${asset.positive ? 'text-green-400' : 'text-red-400'}`}>
                    {asset.change}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/trading"
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View all assets →
              </Link>
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

      {/* Fund Balance Modal */}
      <FundBalanceModal
        isOpen={showFundModal}
        onClose={() => setShowFundModal(false)}
        onSuccess={handleFundSuccess}
        currentBalance={user?.balance || 0}
      />
    </div>
  );
}
