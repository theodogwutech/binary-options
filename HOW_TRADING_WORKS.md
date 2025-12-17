# How Binary Options Trading Works

## Overview
Binary options are simple "yes or no" predictions about whether an asset's price will go up or down.

## Key Concepts

### 1. Entry Price
- The price of the asset when you open the trade
- Example: You open a trade when BTC/USD is at $45,000

### 2. Expiry Time
- The time when your trade automatically closes and the result is determined
- You choose this when opening a trade (e.g., 5 minutes, 15 minutes, 1 hour)
- Example: If you set 5 minutes, the trade will close 5 minutes after you open it

### 3. Trade Types

#### CALL Trade (Bullish)
- You predict the price will **GO UP**
- **Win**: If price at expiry > entry price
- **Loss**: If price at expiry < entry price
- **Tie**: If price at expiry = entry price (you get your money back)

#### PUT Trade (Bearish)
- You predict the price will **GO DOWN**
- **Win**: If price at expiry < entry price
- **Loss**: If price at expiry > entry price
- **Tie**: If price at expiry = entry price (you get your money back)

## Example Trades

### Example 1: Winning CALL Trade
1. BTC/USD current price: $45,000
2. You place a **CALL** trade for $100 with 5-minute expiry
3. After 5 minutes, BTC/USD price: $45,500
4. **Result: WIN** ✅
5. You receive: $100 (original) + $80 (profit at 80% payout) = $180

### Example 2: Losing PUT Trade
1. EUR/USD current price: $1.0850
2. You place a **PUT** trade for $50 with 15-minute expiry
3. After 15 minutes, EUR/USD price: $1.0900
4. **Result: LOSS** ❌
5. You lose your $50

### Example 3: Tie Trade
1. GOLD current price: $2,050
2. You place a **CALL** trade for $100 with 5-minute expiry
3. After 5 minutes, GOLD price: $2,050 (exactly the same)
4. **Result: TIE** 🤝
5. You get your $100 back

## How the System Works

### Automatic Settlement
- The backend checks every 10 seconds for expired trades
- When a trade expires, it:
  1. Gets the current asset price
  2. Compares it to the entry price
  3. Determines win/loss/tie
  4. Updates your balance automatically
  5. Records the transaction

### Profit Calculation
- **Win**: You get your original amount + (amount × payout percentage)
  - Example: $100 trade at 80% payout = $100 + $80 = $180
- **Loss**: You lose your original amount
  - Example: $100 trade = lose $100
- **Tie**: You get your original amount back
  - Example: $100 trade = get $100 back

## Payout Percentages
Different assets have different payout percentages:
- **Currency pairs** (EUR/USD, GBP/USD): Usually 70-85%
- **Cryptocurrencies** (BTC/USD, ETH/USD): Usually 80-90%
- **Commodities** (GOLD, OIL): Usually 75-85%
- **Stocks** (AAPL, TSLA): Usually 70-80%

## Risk Management Tips
1. **Never risk more than you can afford to lose**
2. **Start with small amounts** to learn how it works
3. **Use short expiry times** (5-15 minutes) when learning
4. **Watch the market** before placing trades
5. **Don't chase losses** - take breaks after losing trades

## Checking Your Trade Status

### Dashboard
- See total trades, active trades, win rate, and total profit

### Trading Page
- View all your active trades
- See entry price, current price, and time remaining

### History Page
- View all closed trades
- Filter by status (all/active/closed)
- See profit/loss for each trade
