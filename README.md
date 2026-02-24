# Alternate History Simulator

A multi-agent AI system that answers historical "what if" questions using 5 specialized agents, real-time web research, and LLM reasoning. Built on OpenClaw and deployed via Telegram.

---

## What It Does

Ask any historical counterfactual question and receive a structured analysis:

```
node agents/coordinator.js "What if Gandhi was never born?"
```

Output includes:
- Agent execution log showing each agent activating in sequence
- Historical validation with accuracy score out of 10
- Dramatic narrative of the alternate timeline
- Second and third order ripple effects across politics, economics, culture
- Structured timeline from divergence point to long-term consequences

---

## Architecture

Five independent agent classes managed by an AgentOrchestrator, each with its own role, prompt, and web research step:

```
User Question
      |
AgentOrchestrator
      |
      |-- ResearcherAgent   (Tavily search + Groq reasoning)
      |        |
      |-- TimelineAgent     (Tavily search + Groq reasoning, receives research)
      |        |
      |-- RippleAgent       (Tavily search + Groq reasoning, receives timeline)
      |        |
      |-- HistorianAgent    (Tavily search + Groq validation, receives all above)
      |        |
      |-- NarratorAgent     (Groq narrative, receives all validated data)
      |
Final Report
```

Each agent:
1. Receives a shared state object from the orchestrator
2. Runs its own Tavily web search for real sources
3. Calls the Groq LLM with its specialized system prompt from the prompts/ folder
4. Updates the shared state with its structured output
5. Passes control back to the orchestrator for the next agent

---

## Tech Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Agent Framework | OpenClaw | Orchestration and Telegram interface |
| LLM | Groq (llama-3.3-70b-versatile) | Reasoning and generation |
| Web Research | Tavily | Real-time source retrieval |
| Runtime | Node.js | Execution environment |
| Deployment | Docker | Isolated container |
| Interface | Telegram | Chat access |

Both Groq and Tavily are free APIs with no credit card required.

---

## Project Structure

```
alternate-history-simulator/
├── agents/
│   └── coordinator.js        # AgentOrchestrator + 5 agent classes
├── prompts/
│   ├── researcher.md         # Researcher agent system prompt
│   ├── timeline.md           # Timeline agent system prompt
│   ├── ripple.md             # Ripple agent system prompt
│   ├── historian.md          # Historian validation prompt
│   └── narrator.md           # Narrator agent system prompt
├── skills/
│   └── butterfly.js          # OpenClaw skill connector
├── docs/
│   ├── architecture.md       # System architecture documentation
│   └── demo.md               # Demo guide and example outputs
├── tests/
│   └── debate.test.js        # Agent unit tests
├── .env.example              # Environment variable template
├── package.json
└── README.md
```

---

## Quick Start

### Prerequisites
- Node.js v18 or higher
- Free Groq API key from console.groq.com
- Free Tavily API key from app.tavily.com

### Installation

```bash
git clone https://github.com/yourusername/alternate-history-simulator
cd alternate-history-simulator
npm install
```

### Configuration

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_key_here
TAVILY_API_KEY=your_tavily_key_here
```

### Run a Simulation

```bash
node agents/coordinator.js "What if Gandhi was never born?"
node agents/coordinator.js "What if the internet was never invented?"
node agents/coordinator.js "What if Alexander the Great lived to 80?"
```

---

## Telegram Interface (via OpenClaw)

This project runs as an OpenClaw skill connected to a Telegram bot.

1. Deploy OpenClaw in Docker
2. Configure your Telegram bot token
3. Copy the project into OpenClaw workspace
4. Send messages to your bot:

```
What if India was never colonized?
```

The bot responds with the full structured simulation report.

---

## Example Output

```
BUTTERFLY EFFECT SIMULATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUERY: What if Gandhi was never born?

AGENT EXECUTION LOG:
  ResearcherAgent    — Activated — Complete
  TimelineAgent      — Activated — Complete
  RippleAgent        — Activated — Complete
  HistorianAgent     — Activated — Complete
  NarratorAgent      — Activated — Complete

VALIDATION REPORT:
SCORE: 7/10
CONFIDENCE: Medium
VALIDATED: ...
FLAGGED: ...

NARRATIVE:
...dramatic alternate history prose...

RIPPLE EFFECTS:
Second-order effects:
- [Politics] ...
- [Culture] ...

Third-order effects:
- [Geopolitics] ...

TIMELINE:
Divergence point (1869): Gandhi never born
- 1906: Alternative leaders emerge...
- 1920: Non-Cooperation Movement altered...
- 1947: Independence through different means...

━━━━━━━━━━━━━━━━━━━━━━━━━━━
Butterfly Effect Simulator
OpenClaw Framework | Groq LLM | Tavily Research
```

---

## How OpenClaw Is Used

OpenClaw serves as the primary deployment framework for this project:

- Provides the Telegram bot interface so users can interact via chat
- Runs the agent pipeline inside its workspace container
- Manages the skill registration via skills/butterfly.js
- Handles message routing between Telegram and the coordinator
- Provides Docker isolation so the system runs securely

The project demonstrates OpenClaw's capability to host custom multi-agent pipelines as deployable skills.

---

## Limitations

- Agents run sequentially, not in parallel
- Web search results depend on Tavily free tier availability
- Historical accuracy depends on LLM knowledge and web sources found
- Groq free tier has rate limits which require delays between agent calls

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| GROQ_API_KEY | Yes | Groq API key from console.groq.com |
| TAVILY_API_KEY | Yes | Tavily API key from app.tavily.com |

Never commit your .env file. The .gitignore already excludes it.

---

## License

MIT
