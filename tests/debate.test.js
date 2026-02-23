// alternate-history-simulator - Tests
// These tests verify all 6 agents work correctly

const coordinator = require('../agents/coordinator');
const researcher = require('../skills/researcher');
const timeline = require('../skills/timeline');
const ripple = require('../skills/ripple');
const historian = require('../skills/historian');
const narrator = require('../skills/narrator');

// Test Questions
const testQuestions = [
  "What if Gandhi was never born?",
  "What if the internet was never invented?",
  "What if India was never colonized?"
];

// Test 1: Research Agent
async function testResearcher() {
  console.log("Testing Research Agent...");
  const result = await researcher.research(testQuestions[0]);
  
  if (result.prompt && result.query) {
    console.log("Research Agent: PASSED");
    return true;
  } else {
    console.log("Research Agent: FAILED");
    return false;
  }
}

// Test 2: Timeline Agent
async function testTimeline() {
  console.log("Testing Timeline Agent...");
  const result = await timeline.analyze(
    testQuestions[0],
    "sample research data"
  );
  
  if (result.prompt && result.query) {
    console.log("Timeline Agent: PASSED");
    return true;
  } else {
    console.log("Timeline Agent: FAILED");
    return false;
  }
}

// Test 3: Ripple Agent
async function testRipple() {
  console.log("Testing Ripple Agent...");
  const result = await ripple.analyze(
    "sample timeline data",
    testQuestions[0]
  );
  
  if (result.prompt && result.query) {
    console.log("Ripple Agent: PASSED");
    return true;
  } else {
    console.log("Ripple Agent: FAILED");
    return false;
  }
}

// Test 4: Historian Agent
async function testHistorian() {
  console.log("Testing Historian Agent...");
  const result = await historian.validate(
    "sample research",
    "sample timeline",
    "sample ripples"
  );
  
  if (result.prompt && result.query) {
    console.log("Historian Agent: PASSED");
    return true;
  } else {
    console.log("Historian Agent: FAILED");
    return false;
  }
}

// Test 5: Narrator Agent
async function testNarrator() {
  console.log("Testing Narrator Agent...");
  const result = await narrator.narrate(
    "sample validated data",
    testQuestions[0]
  );
  
  if (result.prompt && result.query) {
    console.log("Narrator Agent: PASSED");
    return true;
  } else {
    console.log("Narrator Agent: FAILED");
    return false;
  }
}

// Test 6: Full Simulation
async function testFullSimulation() {
  console.log("Testing Full Simulation...");
  const result = await coordinator.simulate(testQuestions[0]);
  
  if (result.question && result.story) {
    console.log("Full Simulation: PASSED");
    return true;
  } else {
    console.log("Full Simulation: FAILED");
    return false;
  }
}

// Run All Tests
async function runAllTests() {
  console.log("Running All Tests...");
  
  const results = await Promise.all([
    testResearcher(),
    testTimeline(),
    testRipple(),
    testHistorian(),
    testNarrator(),
    testFullSimulation()
  ]);
  
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;
  
  console.log(`Passed: ${passed}/6`);
  console.log(`Failed: ${failed}/6`);
}

runAllTests();