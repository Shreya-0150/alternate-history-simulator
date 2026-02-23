require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { tavily } = require('@tavily/core');

// Initialize Tavily client
const tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Load agent prompts from files
const researcherPrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/researcher.md'), 'utf8'
);
const timelinePrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/timeline.md'), 'utf8'
);
const ripplePrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/ripple.md'), 'utf8'
);
const narratorPrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/narrator.md'), 'utf8'
);
const historianPrompt = fs.readFileSync(
  path.join(__dirname, '../prompts/historian.md'), 'utf8'
);

function cleanJSON(raw) {
  return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

// Core LLM call helper using Groq chat completions
function tryParseJson(label, raw) {
  try {
    const parsed = JSON.parse(cleanJSON(raw));
    return { parsed, error: null };
  } catch (err) {
    console.error(`${label} JSON parse error:`, err.message);
    return { parsed: null, error: err };
  }
}

async function callGroq(systemPrompt, userMessage) {
  // Simple rate limiting: 2 second delay between calls
  await new Promise(r => setTimeout(r, 2000));

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 2000
      })
    }
  );

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    console.error("Groq API error:", JSON.stringify(data));
    throw new Error(`Groq API error: ${JSON.stringify(data)}`);
  }

  return data.choices[0].message.content;
}

// Tavily web search helper
async function searchWeb(query) {
  const result = await tavilyClient.search(query, {
    maxResults: 3,
    searchDepth: "basic"
  });

  return result.results
    .map(r => `${r.title}: ${r.content} (Source: ${r.url})`)
    .join('\n');
}

// Base shared state factory
function createInitialState(question) {
  const subject = question
    .replace(/^\s*what if\s+/i, '')
    .replace(/\?+\s*$/, '')
    .trim();

  return {
    question,
    subject,
    research: null,
    timeline: null,
    ripples: null,
    validation: null,
    narrative: null,
    log: []
  };
}

// Agent classes
class ResearcherAgent {
  constructor() {
    this.name = 'ResearcherAgent';
  }

  async run(state) {
    console.log(`${this.name} — Activated`);
    state.log.push(`${this.name}: activated`);

    const { subject, question } = state;

    // Run Tavily searches in parallel
    const [sourcesFacts, sourcesImpact] = await Promise.all([
      searchWeb(`${subject} historical facts`),
      searchWeb(`${subject} historical impact`)
    ]);

    const userMessage = [
      `Counterfactual question: ${question}`,
      '',
      'Using the verified web sources below, produce a structured analysis of the real historical baseline.',
      'Focus on key events, actors, institutions, and dependencies that would plausibly be altered by the counterfactual scenario.',
      '',
      'Return your answer as a single valid JSON object only, no additional prose.',
      'Use the following structure:',
      '{',
      '  "baseline_summary": string,',
      '  "key_events": [ { "year": number | null, "description": string } ],',
      '  "key_actors": [ string ],',
      '  "key_dependencies": [ string ],',
      '  "sources_used": [ string ]',
      '}',
      '',
      'Verified web sources:',
      sourcesFacts,
      '',
      sourcesImpact
    ].join('\n');

    const raw = await callGroq(researcherPrompt, userMessage);
    const { parsed, error } = tryParseJson(this.name, raw);

    if (error) {
      state.research = {
        parse_error: true,
        raw_json_candidate: raw
      };
    } else {
      state.research = parsed;
    }

    state.log.push(`${this.name}: complete`);
    console.log(`${this.name} — Complete`);
  }
}

class TimelineAgent {
  constructor() {
    this.name = 'TimelineAgent';
  }

  async run(state) {
    console.log(`${this.name} — Activated`);
    state.log.push(`${this.name}: activated`);

    const { subject, question, research } = state;

    const sourcesTimeline = await searchWeb(`${subject} timeline history dates`);

    const userMessage = [
      `Counterfactual question: ${question}`,
      '',
      'You receive a structured description of the historical baseline and dependencies.',
      'Infer a clear alternate-history timeline for the scenario, focusing on major turning points.',
      '',
      'Baseline research (JSON):',
      JSON.stringify(research, null, 2),
      '',
      'Additional timeline-related sources:',
      sourcesTimeline,
      '',
      'Return your answer as a single valid JSON object only, no additional prose.',
      'Use the following structure:',
      '{',
      '  "divergence_point": { "year": number | null, "description": string },',
      '  "timeline_events": [ { "year": number | null, "description": string } ],',
      '  "geographic_scope": [ string ],',
      '  "institutions_affected": [ string ]',
      '}'
    ].join('\n');

    const raw = await callGroq(timelinePrompt, userMessage);
    const { parsed, error } = tryParseJson(this.name, raw);

    if (error) {
      state.timeline = {
        parse_error: true,
        timeline_raw: raw
      };
    } else {
      state.timeline = parsed;
    }

    state.log.push(`${this.name}: complete`);
    console.log(`${this.name} — Complete`);
  }
}

class RippleAgent {
  constructor() {
    this.name = 'RippleAgent';
  }

  async run(state) {
    console.log(`${this.name} — Activated`);
    state.log.push(`${this.name}: activated`);

    const { subject, question, timeline } = state;

    const sourcesRipple = await searchWeb(`${subject} global influence consequences`);

    const userMessage = [
      `Counterfactual question: ${question}`,
      '',
      'You receive a structured alternate timeline.',
      'Identify second- and third-order effects across domains such as politics, economics, technology, culture, and international relations.',
      '',
      'Timeline (JSON):',
      JSON.stringify(timeline, null, 2),
      '',
      'Additional consequence-related sources:',
      sourcesRipple,
      '',
      'Return your answer as a single valid JSON object only, no additional prose.',
      'Use the following structure:',
      '{',
      '  "second_order_effects": [ { "domain": string, "description": string } ],',
      '  "third_order_effects": [ { "domain": string, "description": string } ],',
      '  "most_critical_risks": [ string ],',
      '  "potential_opportunities": [ string ]',
      '}'
    ].join('\n');

    const raw = await callGroq(ripplePrompt, userMessage);
    const { parsed, error } = tryParseJson(this.name, raw);

    if (error) {
      state.ripples = {
        parse_error: true,
        ripple_raw: raw
      };
    } else {
      state.ripples = parsed;
    }

    state.log.push(`${this.name}: complete`);
    console.log(`${this.name} — Complete`);
  }
}

class HistorianAgent {
  constructor() {
    this.name = 'HistorianAgent';
  }

  async run(state) {
    console.log(`${this.name} — Activated`);
    state.log.push(`${this.name}: activated`);

    const { subject, research, timeline, ripples } = state;

    const sourcesAccuracy = await searchWeb(`${subject} historical accuracy`);

    const userMessage = [
      'You are asked to validate the historical plausibility and accuracy of a butterfly-effect simulation.',
      '',
      'Baseline research (JSON):',
      JSON.stringify(research, null, 2),
      '',
      'Timeline (JSON):',
      JSON.stringify(timeline, null, 2),
      '',
      'Ripple effects (JSON):',
      JSON.stringify(ripples, null, 2),
      '',
      'Additional accuracy-related sources:',
      sourcesAccuracy
    ].join('\n');

    const raw = await callGroq(historianPrompt, userMessage);
    const { parsed, error } = tryParseJson(this.name, raw);

    if (error) {
      state.validation = {
        parse_error: true,
        raw_report: raw
      };
    } else {
      state.validation = parsed;
    }

    state.log.push(`${this.name}: complete`);
    console.log(`${this.name} — Complete`);
  }
}

class NarratorAgent {
  constructor() {
    this.name = 'NarratorAgent';
  }

  async run(state) {
    console.log(`${this.name} — Activated`);
    state.log.push(`${this.name}: activated`);

    const { question, research, timeline, ripples, validation } = state;

    const userMessage = [
      'Write a cohesive, dramatic, but historically grounded narrative of this alternate history.',
      '',
      `Counterfactual question: ${question}`,
      '',
      'Use the following structured inputs as your factual and logical backbone:',
      '',
      'Baseline research (JSON):',
      JSON.stringify(research, null, 2),
      '',
      'Timeline (JSON):',
      JSON.stringify(timeline, null, 2),
      '',
      'Ripple effects (JSON):',
      JSON.stringify(ripples, null, 2),
      '',
      'Historian validation (JSON or structured text):',
      JSON.stringify(validation, null, 2),
      '',
      'Your output should be a single well-structured narrative in professional prose, not JSON.'
    ].join('\n');

    const story = await callGroq(narratorPrompt, userMessage);

    state.narrative = story;
    state.log.push(`${this.name}: complete`);
    console.log(`${this.name} — Complete`);
  }
}

// Agent orchestrator
class AgentOrchestrator {
  constructor(agents) {
    this.agents = agents;
  }

  async run(question) {
    const state = createInitialState(question);

    console.log('AgentOrchestrator — Starting simulation');
    console.log(`AgentOrchestrator — Question: ${question}`);

    // In this dependency structure, agents run sequentially,
    // but the orchestrator is written so it could support
    // parallel groups in the future.
    for (const agent of this.agents) {
      console.log(`AgentOrchestrator — Dispatching to ${agent.name}`);
      await agent.run(state);
      console.log(
        `AgentOrchestrator — ${agent.name} updated state keys: ` +
        Object.keys(state)
          .filter(k => !['question', 'subject', 'log'].includes(k) && state[k] != null)
          .join(', ')
      );
    }

    console.log('AgentOrchestrator — All agents complete');
    return this.buildReport(state);
  }

  buildReport(state) {
    const { question, timeline, ripples, validation, narrative } = state;

    // Historian output may be JSON or structured text
    const validationBlock =
      typeof validation === 'string'
        ? validation
        : validation && validation.raw_report
          ? validation.raw_report
          : JSON.stringify(validation, null, 2);

    const timelineBlock = formatTimelineSection(timeline);
    const rippleBlock = formatRippleSection(ripples);

    const narrativeBlock = narrative || '';

    const executionLog = [
      '  ResearcherAgent    — Activated — Complete',
      '  TimelineAgent      — Activated — Complete',
      '  RippleAgent        — Activated — Complete',
      '  HistorianAgent     — Activated — Complete',
      '  NarratorAgent      — Activated — Complete'
    ].join('\n');

    return `
BUTTERFLY EFFECT SIMULATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUERY: ${question}

AGENT EXECUTION LOG:
${executionLog}

VALIDATION REPORT:
${validationBlock}

NARRATIVE:
${narrativeBlock}

RIPPLE EFFECTS:
${rippleBlock}

TIMELINE:
${timelineBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Butterfly Effect Simulator
OpenClaw Framework | Groq LLM | Tavily Research
`;
  }
}

function formatTimelineSection(timeline) {
  if (!timeline) {
    return 'No timeline was generated.';
  }

  if (typeof timeline === 'string') {
    const { parsed } = tryParseJson('TimelineAgent.timeline_string', timeline);
    if (parsed) {
      return formatTimelineSection(parsed);
    }
    return timeline;
  }

  // If we captured raw JSON-like output under timeline_raw, try to parse it first
  if (timeline.timeline_raw) {
    const { parsed } = tryParseJson('TimelineAgent.timeline_raw', timeline.timeline_raw);
    if (parsed) {
      return formatTimelineSection(parsed);
    }
    return timeline.timeline_raw;
  }

  const lines = [];

  if (timeline.divergence_point) {
    const dp = timeline.divergence_point;
    const year = dp.year != null ? dp.year : 'Unknown year';
    lines.push(`Divergence point (${year}): ${dp.description}`);
    lines.push('');
  }

  if (Array.isArray(timeline.timeline_events) && timeline.timeline_events.length > 0) {
    lines.push('Key timeline events:');
    for (const ev of timeline.timeline_events) {
      const year = ev.year != null ? ev.year : 'Unknown year';
      lines.push(`- ${year}: ${ev.description}`);
    }
    lines.push('');
  }

  if (Array.isArray(timeline.geographic_scope) && timeline.geographic_scope.length > 0) {
    lines.push('Geographic scope:');
    for (const region of timeline.geographic_scope) {
      lines.push(`- ${region}`);
    }
    lines.push('');
  }

  if (Array.isArray(timeline.institutions_affected) && timeline.institutions_affected.length > 0) {
    lines.push('Institutions affected:');
    for (const inst of timeline.institutions_affected) {
      lines.push(`- ${inst}`);
    }
    lines.push('');
  }

  if (lines.length === 0) {
    // Fallback to JSON if structure is not as expected
    return JSON.stringify(timeline, null, 2);
  }

  return lines.join('\n');
}

function formatRippleSection(ripples) {
  if (!ripples) {
    return 'No ripple analysis was generated.';
  }

  if (typeof ripples === 'string') {
    const { parsed } = tryParseJson('RippleAgent.ripples_string', ripples);
    if (parsed) {
      return formatRippleSection(parsed);
    }
    return ripples;
  }

  // If we captured raw JSON-like output under ripple_raw, try to parse it first
  if (ripples.ripple_raw) {
    const { parsed } = tryParseJson('RippleAgent.ripple_raw', ripples.ripple_raw);
    if (parsed) {
      return formatRippleSection(parsed);
    }
    return ripples.ripple_raw;
  }

  const lines = [];

  if (Array.isArray(ripples.second_order_effects) && ripples.second_order_effects.length > 0) {
    lines.push('Second-order effects:');
    for (const eff of ripples.second_order_effects) {
      const domain = eff.domain || 'General';
      lines.push(`- [${domain}] ${eff.description}`);
    }
    lines.push('');
  }

  if (Array.isArray(ripples.third_order_effects) && ripples.third_order_effects.length > 0) {
    lines.push('Third-order effects:');
    for (const eff of ripples.third_order_effects) {
      const domain = eff.domain || 'General';
      lines.push(`- [${domain}] ${eff.description}`);
    }
    lines.push('');
  }

  if (Array.isArray(ripples.most_critical_risks) && ripples.most_critical_risks.length > 0) {
    lines.push('Most critical risks:');
    for (const risk of ripples.most_critical_risks) {
      lines.push(`- ${risk}`);
    }
    lines.push('');
  }

  if (Array.isArray(ripples.potential_opportunities) && ripples.potential_opportunities.length > 0) {
    lines.push('Potential opportunities:');
    for (const opportunity of ripples.potential_opportunities) {
      lines.push(`- ${opportunity}`);
    }
    lines.push('');
  }

  if (lines.length === 0) {
    // Fallback to JSON if structure is not as expected
    return JSON.stringify(ripples, null, 2);
  }

  return lines.join('\n');
}

// Main simulation coordinator
async function simulate(whatIfQuestion) {
  const orchestrator = new AgentOrchestrator([
    new ResearcherAgent(),
    new TimelineAgent(),
    new RippleAgent(),
    new HistorianAgent(),
    new NarratorAgent()
  ]);

  const report = await orchestrator.run(whatIfQuestion);
  return report;
}

// Entry point
const question = process.argv[2] || 'What if Gandhi was never born?';

simulate(question)
  .then(report => {
    console.log(report);
  })
  .catch(err => {
    console.error('Simulation failed:', err.message);
  });

module.exports = { simulate };