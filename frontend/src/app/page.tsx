import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">BO</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Binary Options
              </h1>
            </div>
            <nav className="space-x-4">
              <Link
                href="/login"
                className="text-gray-300 hover:text-white font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium transition-all shadow-lg shadow-blue-500/25"
              >
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <span className="text-blue-400 text-sm font-medium">🚀 Trade with 85% Payout Rate</span>
          </div>

          <h2 className="text-6xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Next-Gen Binary Options
            </span>
            <br />
            <span className="text-white">Trading Platform</span>
          </h2>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Professional trading platform with real-time market data, lightning-fast execution,
            and institutional-grade security. Start trading in minutes.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg transition-all shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105"
            >
              Start Trading Now
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/login"
              className="bg-white/5 backdrop-blur-sm text-white border border-white/10 px-8 py-4 rounded-xl hover:bg-white/10 font-semibold text-lg transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid md:grid-cols-3 gap-6">
          <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 hover:border-blue-500/50 transition-all backdrop-blur-xl hover:shadow-xl hover:shadow-blue-500/10">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-2xl font-bold text-white mb-3">Real-Time Trading</h3>
            <p className="text-gray-400 leading-relaxed">
              Access live market data with sub-second latency. Trade forex, crypto, stocks, and commodities instantly.
            </p>
            <div className="mt-4 text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Learn more →
            </div>
          </div>

          <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 hover:border-green-500/50 transition-all backdrop-blur-xl hover:shadow-xl hover:shadow-green-500/10">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-2xl font-bold text-white mb-3">High Payouts</h3>
            <p className="text-gray-400 leading-relaxed">
              Earn up to 85% profit on winning trades. Transparent pricing with zero hidden fees or commissions.
            </p>
            <div className="mt-4 text-green-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              View rates →
            </div>
          </div>

          <div className="group bg-gradient-to-br from-gray-800/50 to-gray-900/50 p-8 rounded-2xl border border-gray-700/50 hover:border-purple-500/50 transition-all backdrop-blur-xl hover:shadow-xl hover:shadow-purple-500/10">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-white mb-3">Bank-Grade Security</h3>
            <p className="text-gray-400 leading-relaxed">
              Military-grade encryption, 2FA authentication, and cold storage for maximum fund protection.
            </p>
            <div className="mt-4 text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Security details →
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl border border-blue-500/20 p-12 backdrop-blur-xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                85%
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Payout Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                $10
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Min Trade</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Trading</div>
            </div>
            <div className="space-y-2">
              <div className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                100+
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">Assets</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <h3 className="text-4xl font-bold text-white mb-4">Ready to start trading?</h3>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of traders worldwide</p>
          <Link
            href="/register"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg transition-all shadow-2xl shadow-blue-500/30"
          >
            Create Free Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Assets</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">License</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; 2025 Binary Options Trading Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
