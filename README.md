# alternate-history-simulator

A multi-agent AI system that answers "what if" questions about history using 5 specialized agents plus a coordinator.  
It runs inside the OpenClaw framework and can be accessed via a Telegram bot or directly from Node.js.

## Features

- Structured multi-agent pipeline (research, timeline, ripple effects, validation, narrative).
- Real-time web research using Tavily.
- Reasoning and narrative generation using Groq LLM.
- Professional text report format suitable for sharing.

## Example Questions

- "What if Gandhi was never born?"
- "What if the internet was never invented?"
- "What if India was never colonized?"

## Quick Start (local CLI)

1. Clone the repository and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   GROQ_API_KEY=your_groq_key_here
   TAVILY_API_KEY=your_tavily_key_here
   ```

3. Run a simulation from the command line:

   ```bash
   node agents/coordinator.js "What if Gandhi was never born?"
   ```

4. You will see a full report printed to the terminal, including:

   - Agent execution log  
   - Validation report  
   - Narrative  
   - Ripple effects  
   - Timeline  

## Telegram Bot (via OpenClaw)

This project includes an OpenClaw skill in `skills/butterfly.js` that connects the simulator to a Telegram bot.

High-level steps:

1. Configure your Telegram bot token and any OpenClaw settings in your OpenClaw host (plus the same `GROQ_API_KEY` and `TAVILY_API_KEY`).
2. Ensure the `butterfly-effect` skill is loaded by OpenClaw.
3. In Telegram, send:

   ```text
   /simulate What if Gandhi was never born?
   ```

4. The bot will reply with the same professional report produced by `coordinator.js`.

For a more detailed explanation of the architecture and Telegram commands, see:

- `docs/architecture.md`
- `docs/demo.md`

## How It Works (agents)

Agents collaborate through a shared state orchestrated by OpenClaw and the coordinator:

1. **Researcher Agent**: finds real historical facts from the web.
2. **Timeline Agent**: maps how the historical timeline changes.
3. **Ripple Agent**: finds second- and third-order ripple effects.
4. **Historian Agent**: validates accuracy and scores the scenario.
5. **Narrator Agent**: turns the analysis into a dramatic narrative.

The `Coordinator` class orchestrates all agents and composes the final report string.

## Tech Stack

- OpenClaw (multi-agent orchestration)
- Docker (optional containerization)
- Telegram (chat interface)
- Groq LLM (reasoning engine via `llama-3.3-70b-versatile`)
- Tavily (real-time web research)

