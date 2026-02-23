# Alternate History Simulator - Architecture

## Overview
A multi-agent AI system that simulates alternate historical timelines
using 5 specialized agents plus a coordinator, orchestrated by OpenClaw.

## System Architecture
```
User (Telegram)
      ↓
OpenClaw (Orchestrator)
      ↓
Coordinator Agent
      ↓
┌─────────────────────────────────────┐
│                                     │
▼           ▼          ▼              ▼
Research  Timeline   Ripple       Historian
Agent     Agent      Agent        Agent
│           │          │              │
└─────────────────────────────────────┘
                    ↓
              Narrator Agent
                    ↓
              Final Report
                    ↓
            User (Telegram)
```

## Agent Responsibilities

### 1. Research Agent
- Finds real documented historical facts
- Extracts actual quotes
- Maps real world impact
- Input: What-if question
- Output: Structured research JSON

### 2. Timeline Agent
- Maps direct historical changes
- Short/medium/long term effects
- Input: Research data + question
- Output: Timeline JSON

### 3. Ripple Agent
- Finds second/third order effects
- Discovers unexpected connections
- Input: Timeline data
- Output: Ripple chain JSON

### 4. Historian Agent
- Validates historical accuracy
- Scores credibility 1-10
- Input: All agent outputs
- Output: Validation report

### 5. Narrator Agent
- Tells story dramatically
- Makes it emotionally compelling
- Input: Validated data
- Output: Dramatic narrative

### 6. Coordinator Agent
- Orchestrates all agents through a shared state object
- Manages agent activation order and logging
- Formats the final professional report
- Input: User question
- Output: Complete simulation report

## Tech Stack
- OpenClaw — Multi-agent framework
- Docker — Isolated container
- Telegram — Chat interface
- Groq LLM — reasoning and narrative generation
- Tavily — real-time web research

## Key Features
- 100% historically grounded
- Multi-agent collaboration
- Real-time web research
- Credibility scoring
- Dramatic storytelling
- Free to run