// Prompt builder branch coverage (no external test runner yet)
const path = require('path');
const AIModule = require(path.join(__dirname, '..', 'js', 'modules', 'ai_module.js'));

function assert(cond, msg) { if (!cond) throw new Error(msg); }

function extract(code, marker) { return code.toLowerCase().includes(marker); }

function testUIBranch() {
  const ai = new AIModule();
  const prompt = ai.buildContextualPrompt('Please create UI with a button that creates a null', null);
  assert(/ExtendScript UI Panel/.test(prompt), 'UI branch missing panel snippet');
  assert(prompt.includes('EXTENDSCRIPT CAPABILITIES'), 'Capabilities section absent');
  console.log('✅ UI branch test passed');
}

function testImageBranch() {
  const ai = new AIModule();
  const prompt = ai.buildContextualPrompt('Describe this image', null, null, 'base64data');
  assert(prompt.includes('You can see and analyze images'), 'Image analysis guidance missing');
  console.log('✅ Image branch test passed');
}

function testStandardBranch() {
  const ai = new AIModule();
  const prompt = ai.buildContextualPrompt('How do I make a wiggle expression?', null);
  assert(prompt.includes('wiggle(2, 50') || prompt.includes('wiggle'), 'Should reference wiggle mapping guidance');
  assert(prompt.includes('friendly After Effects assistant'), 'Standard assistant tone missing');
  console.log('✅ Standard branch test passed');
}

try {
  testUIBranch();
  testImageBranch();
  testStandardBranch();
  console.log('All prompt builder tests passed');
} catch (e) {
  console.error('Test failure:', e.message);
  process.exit(1);
}
