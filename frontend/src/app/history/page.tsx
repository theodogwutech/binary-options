'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { tradeAPI, userAPI } from '@/lib/api';
import ConfirmModal from '@/components/ConfirmModal';

interface Trade {
  _id: string;
  asset: {
    symbol: string;
    name: string;
  };
  tradeType: 'call' | 'put';
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  expiryTime: string;
  status: 'pending' | 'active' | 'won' | 'lost' | 'cancelled';
  result?: 'win' | 'loss' | 'draw';
  profit?: number;
  createdAt: string;
  closedAt?: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const { user, logout, updateBalance } = useAuthStore();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    // Give Zustand time to hydrate from localStorage before redirecting
    const checkAuth = () => {
      const hasAuthToken = localStorage.getItem('accessToken');

      if (!user && !hasAuthToken) {
        router.push('/login');
        return;
      }

      // Only fetch if user is authenticated
      if (user) {
        fetchTrades();
      }
    };

    // Delay check to allow Zustand to rehydrate
    const timeout = setTimeout(checkAuth, 150);
    return () => clearTimeout(timeout);
  }, [filter]); // Only depend on filter changes

  // Separate effect for fetching balance once on mount
  useEffect(() => {
    if (user) {
      userAPI.getProfile().then(res => {
        updateBalance(res.data.data.balance);
      }).catch(err => console.error('Failed to fetch profile:', err));
    }
  }, []); // Run only once on mount

  const fetchTrades = async () => {
    setLoading(true);
    try {
      console.log('Fetching trades with filter:', filter);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await tradeAPI.getTrades(params);
      console.log('Trades response:', response);
      const fetchedTrades = response.data.data?.trades || [];
      console.log('Fetched trades:', fetchedTrades);
      setTrades(Array.isArray(fetchedTrades) ? fetchedTrades : []);
    } catch (error: any) {
      console.error('Failed to fetch trades:', error);
      console.error('Error details:', error.response?.data);
      setTrades([]);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    return null;
  }

  const stats = {
    total: Array.isArray(trades) ? trades.length : 0,
    active: Array.isArray(trades) ? trades.filter(t => t.status === 'active').length : 0,
    won: Array.isArray(trades) ? trades.filter(t => t.result === 'win').length : 0,
    lost: Array.isArray(trades) ? trades.filter(t => t.result === 'loss').length : 0,
    totalProfit: Array.isArray(trades) ? trades.reduce((sum, t) => sum + (t.profit || 0), 0) : 0,
  };

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
                  className="text-gray-400 hover:text-white font-medium px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all"
                >
                  Trade
                </Link>
                <Link
                  href="/history"
                  className="text-white font-medium px-3 py-2 rounded-lg bg-gray-800/50"
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
          <h1 className="text-3xl font-bold text-white mb-2">Trade History</h1>
          <p className="text-gray-400">View and analyze your trading performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Total Trades</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Active</p>
            <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Won</p>
            <p className="text-2xl font-bold text-green-400">{stats.won}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Lost</p>
            <p className="text-2xl font-bold text-red-400">{stats.lost}</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
            <p className="text-xs text-gray-400 mb-1">Total P&L</p>
            <p className={`text-2xl font-bold ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.totalProfit >= 0 ? '+' : ''}${stats.totalProfit.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm font-semibold text-gray-300">Filter:</p>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900/50 text-gray-400 hover:bg-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'active'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900/50 text-gray-400 hover:bg-gray-900'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter('closed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'closed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-900/50 text-gray-400 hover:bg-gray-900'
                }`}
              >
                Closed
              </button>
            </div>
          </div>
        </div>

        {/* Trades Table */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Loading trades...</p>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-16">
              <svg className="h-16 w-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-400 mb-4">No trades found</p>
              <Link
                href="/trading"
                className="inline-block text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Start trading →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Entry
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Exit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      P&L
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {trades.map((trade) => (
                    <tr key={trade._id} className="hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {trade.asset?.symbol || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-400">
                            {trade.asset?.name || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          trade.tradeType === 'call'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.tradeType.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                        ${trade.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        ${trade.entryPrice?.toFixed(2) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {trade.exitPrice ? `$${trade.exitPrice.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          trade.status === 'active'
                            ? 'bg-blue-500/20 text-blue-400'
                            : trade.status === 'won'
                            ? 'bg-green-500/20 text-green-400'
                            : trade.status === 'lost'
                            ? 'bg-red-500/20 text-red-400'
                            : trade.status === 'cancelled'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {trade.status === 'cancelled' ? 'DRAW/TIE' : trade.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {trade.result ? (
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            trade.result === 'win'
                              ? 'bg-green-500/20 text-green-400'
                              : trade.result === 'loss'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {trade.result === 'draw' ? 'DRAW/TIE' : trade.result.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {trade.profit !== undefined ? (
                          <span className={`text-sm font-bold ${
                            trade.profit > 0 ? 'text-green-400' : trade.profit < 0 ? 'text-red-400' : 'text-yellow-400'
                          }`}>
                            {trade.profit > 0 ? '+' : ''}${trade.profit.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {formatDate(trade.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
