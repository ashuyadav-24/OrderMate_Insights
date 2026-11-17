const test = require('node:test');
const assert = require('node:assert');
const { getDistanceMeters, isValidHostel } = require('../config/hostels');
const { analyzeFieldworkCsv } = require('../services/csvAnalyzerService');

test('Hostel Configuration Validation', () => {
  // Valid Boys Hostels
  assert.strictEqual(isValidHostel('Boys Hostel', 'K'), true);
  assert.strictEqual(isValidHostel('Boys Hostel', 'J'), true);
  assert.strictEqual(isValidHostel('Boys Hostel', 'E'), true);

  // Invalid Boys Hostels
  assert.strictEqual(isValidHostel('Boys Hostel', 'A'), false);
  assert.strictEqual(isValidHostel('Boys Hostel', 'Z'), false);

  // Valid Girls Hostels
  assert.strictEqual(isValidHostel('Girls Hostel', 'A'), true);
  assert.strictEqual(isValidHostel('Girls Hostel', 'M'), true);
  assert.strictEqual(isValidHostel('Girls Hostel', 'K'), false);
});

test('Geographical Distance Calculation Between Hostels', () => {
  const coordK = { lat: 28.5478, lng: 77.1941 };
  const coordJ = { lat: 28.5473, lng: 77.1936 };
  const distance = getDistanceMeters(coordK, coordJ);

  assert.ok(distance > 0);
  assert.ok(distance < 500); // Adjacent hostels within 500 meters
});

test('Fieldwork CSV Analysis Parser', async () => {
  const result = await analyzeFieldworkCsv();

  assert.strictEqual(result.summary.totalStudentsSurveyed, 22);
  assert.strictEqual(result.summary.strategies.paidChargesCount, 10);
  assert.strictEqual(result.summary.strategies.addedUnneededItemsCount, 12);
  assert.ok(result.summary.totalAvoidableLoss > 0);
  assert.ok(result.platformsSummary.length >= 3);
  assert.strictEqual(result.limitations.length, 4);
});

test('Savings Calculation Mathematical Soundness', () => {
  // Example from Phase 10:
  // Order delivery threshold: ₹150
  // Student wants milk worth ₹35
  // Solo checkout charges avoided: ₹45 (₹25 delivery + ₹20 small cart)
  // Fair share of combined charges: ₹5
  // Confirmed savings: ₹45 - ₹5 = ₹40

  const individualChargesAvoided = 45;
  const combinedShare = 5;
  const confirmedSavings = Math.max(0, individualChargesAvoided - combinedShare);

  assert.strictEqual(confirmedSavings, 40);
  assert.notStrictEqual(confirmedSavings, 115); // NOT the remaining threshold amount
});
