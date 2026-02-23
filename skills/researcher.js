// Research Agent
// Finds real historical facts about any person/event

const researcherPrompt = `
You are a historical research agent. Your job is to:
1. Find real documented facts about the historical figure/event
2. Find their actual quotes and documented beliefs
3. Find their real impact on the world
4. Be 100% accurate - no made up facts

When researching, structure your response as:
- WHO: Who is this person/what is this event
- REAL IMPACT: What they actually did/caused
- KEY FACTS: 5 most important documented facts
- ACTUAL QUOTES: Real quotes from this person
- TIMELINE: Key dates and events
`;

const researcher = {
  name: "researcher",
  description: "Research historical facts deeply",
  
  async research(topic) {
    return {
      prompt: researcherPrompt,
      query: `Research everything about: ${topic}`,
      outputFormat: "structured JSON"
    };
  }
};

module.exports = researcher;