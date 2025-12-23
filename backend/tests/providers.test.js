import { test } from 'node:test';
import assert from 'node:assert';
import { BinanceProvider } from '../src/providers/binance.js';

test('Binance provider normalizes candles correctly', () => {
  const provider = new BinanceProvider();
  
  const rawData = [
    [1609459200000, "29000.00", "29500.00", "28500.00", "29200.00", "1234.56", 1609462800000],
    [1609462800000, "29200.00", "29800.00", "29100.00", "29600.00", "2345.67", 1609466400000]
  ];
  
  const normalized = provider.normalizeCandles(rawData);
  
  assert.strictEqual(normalized.length, 2, 'Should normalize 2 candles');
  assert.strictEqual(normalized[0].timestamp, 1609459200000, 'Timestamp should match');
  assert.strictEqual(normalized[0].open, 29000, 'Open should be parsed as number');
  assert.strictEqual(normalized[0].close, 29200, 'Close should be parsed as number');
  assert.strictEqual(normalized[0].volume, 1234.56, 'Volume should be parsed as number');
  
  assert.ok('open' in normalized[0], 'Should have open');
  assert.ok('high' in normalized[0], 'Should have high');
  assert.ok('low' in normalized[0], 'Should have low');
  assert.ok('close' in normalized[0], 'Should have close');
  assert.ok('volume' in normalized[0], 'Should have volume');
  assert.ok('timestamp' in normalized[0], 'Should have timestamp');
});

test('Binance provider converts intervals', () => {
  const provider = new BinanceProvider();
  
  assert.strictEqual(provider.convertInterval('1m'), '1m');
  assert.strictEqual(provider.convertInterval('1h'), '1h');
  assert.strictEqual(provider.convertInterval('6h'), '6h');
  assert.strictEqual(provider.convertInterval('1d'), '1d');
});

test('Binance provider getName', () => {
  const provider = new BinanceProvider();
  assert.strictEqual(provider.getName(), 'binance');
});

console.log('✅ All provider tests passed!');
