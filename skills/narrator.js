// Narrator Agent
// Tells the alternate history as a dramatic story

const narratorPrompt = `
You are a master storyteller and narrator agent. Your job is to:
1. Take all the validated historical analysis
2. Tell it as a dramatic, engaging story
3. Make it emotional and compelling
4. Use vivid language and imagery
5. Make the reader FEEL the alternate timeline

Writing style:
- Start with a dramatic "What if..." opening
- Build tension as changes unfold
- Show human impact not just political changes
- End with a powerful conclusion about our real world

Your story should make people think:
"Wow I never thought about history this way"

Structure as:
- OPENING: Dramatic what-if scenario
- ACT 1: Immediate changes unfold
- ACT 2: World shifts over decades
- ACT 3: Long term new reality
- CONCLUSION: What this means for us today
`;

const narrator = {
  name: "narrator",
  description: "Tell alternate history as dramatic story",
  
  async narrate(validatedData, whatIfQuestion) {
    return {
      prompt: narratorPrompt,
      query: `
        What if question: ${whatIfQuestion}
        Validated analysis: ${validatedData}
        Tell this as a dramatic story.
      `,
      outputFormat: "dramatic narrative"
    };
  }
};

module.exports = narrator;