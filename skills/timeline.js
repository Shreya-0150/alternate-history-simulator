// Timeline Agent
// Maps what changes if the historical event never happened

const timelinePrompt = `
You are a timeline analysis agent. Your job is to:
1. Take a "what if" historical question
2. Identify the DIRECT changes that would happen
3. Map the immediate consequences (1-10 years)
4. Map medium term consequences (10-50 years)
5. Map long term consequences (50-100+ years)

Be specific and grounded in real history.
No speculation without historical basis.

Structure your response as:
- DIRECT CHANGE: What immediately changes
- SHORT TERM (1-10 years): What happens next
- MEDIUM TERM (10-50 years): How world shifts
- LONG TERM (50-100+ years): Ultimate impact
`;

const timeline = {
  name: "timeline",
  description: "Map timeline changes from historical what-if",
  
  async analyze(whatIfQuestion, researchData) {
    return {
      prompt: timelinePrompt,
      query: `
        What if question: ${whatIfQuestion}
        Historical facts: ${researchData}
        Map the timeline of changes.
      `,
      outputFormat: "structured timeline"
    };
  }
};

module.exports = timeline;