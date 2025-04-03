export const mapToTradingViewSymbol = (symbol) => {
    const symbolMappings = {
      BTCUSDT: "BINANCE:BTCUSDT",
      ETHUSDT: "BINANCE:ETHUSDT",
      // Add more mappings as needed
    };
  
    return symbolMappings[symbol] || `BINANCE:${symbol}`; // Default to BINANCE if no mapping exists
  };