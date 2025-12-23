import { test } from 'node:test';
import assert from 'node:assert';
import { calculateEMA, calculateMultipleEMAs } from '../src/utils/ema.js';

test('EMA calculation with known values', () => {
  const closes = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const period = 5;
  const ema = calculateEMA(closes, period);
  
  assert.strictEqual(ema.length, closes.length, 'EMA should have same length as input');
  
  for (let i = 0; i < period - 1; i++) {
    assert.strictEqual(ema[i], null, `EMA[${i}] should be null (insufficient data)`);
  }
  
  assert.notStrictEqual(ema[period - 1], null, 'First EMA value should be SMA');
  assert.strictEqual(ema[period - 1], 12, 'First EMA (SMA) should be 12');
});

test('EMA with period of 1 should equal closes', () => {
  const closes = [10, 20, 30, 40, 50];
  const ema = calculateEMA(closes, 1);
  
  assert.deepStrictEqual(ema, closes, 'EMA with period 1 should equal input');
});

test('EMA increases with uptrend', () => {
  const closes = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110];
  const period = 5;
  const ema = calculateEMA(closes, period);
  
  let increasing = true;
  for (let i = period; i < ema.length - 1; i++) {
    if (ema[i] > ema[i + 1]) {
      increasing = false;
      break;
    }
  }
  
  assert.strictEqual(increasing, true, 'EMA should increase in uptrend');
});

test('Multiple EMAs calculation', () => {
  const closes = Array.from({ length: 300 }, (_, i) => 100 + Math.sin(i / 10) * 10);
  const periods = [20, 50, 100];
  const emas = calculateMultipleEMAs(closes, periods);
  
  assert.strictEqual(Object.keys(emas).length, 3, 'Should return 3 EMAs');
  assert.strictEqual(emas[20].length, closes.length, 'EMA20 length should match closes');
  assert.strictEqual(emas[50].length, closes.length, 'EMA50 length should match closes');
  assert.strictEqual(emas[100].length, closes.length, 'EMA100 length should match closes');
});

test('EMA throws error for invalid period', () => {
  const closes = [10, 20, 30];
  
  assert.throws(
    () => calculateEMA(closes, 0),
    /Invalid EMA period/,
    'Should throw for period 0'
  );
  
  assert.throws(
    () => calculateEMA(closes, 10),
    /Invalid EMA period/,
    'Should throw for period > closes length'
  );
});

test('EMA with empty array', () => {
  const ema = calculateEMA([], 20);
  assert.deepStrictEqual(ema, [], 'Should return empty array for empty input');
});

console.log('✅ All EMA tests passed!');
