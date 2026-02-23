// Ripple Agent
// Finds second and third order effects of the change

const ripplePrompt = `
You are a ripple effect analysis agent. Your job is to:
1. Take the timeline changes identified
2. Find second order effects (effects of effects)
3. Find third order effects (effects of effects of effects)
4. Connect unexpected dots across different fields

For example:
- If Gandhi never born (first order: India's independence delayed)
- Second order: Pakistan/Bangladesh borders different
- Third order: Nuclear tensions in Asia completely different
- Unexpected: Silicon Valley's Indian engineers never immigrate

Always ground ripples in real historical connections.

Structure as:
- FIRST ORDER: Direct changes
- SECOND ORDER: Effects of those changes  
- THIRD ORDER: Effects of second order
- UNEXPECTED CONNECTIONS: Surprising ripples
`;

const ripple = {
  name: "ripple",
  description: "Find second and third order effects",
  
  async analyze(timelineData, whatIfQuestion) {
    return {
      prompt: ripplePrompt,
      query: `
        What if question: ${whatIfQuestion}
        Timeline changes: ${timelineData}
        Find all ripple effects.
      `,
      outputFormat: "ripple chain"
    };
  }
};

module.exports = ripple;