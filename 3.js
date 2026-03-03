// في عقدة HTTP Request لـ OpenAI/Gemini
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "You are the editor-in-chief of a major tech news platform. Your task is to analyze each article and produce a structured, professional analysis."
    },
    {
      "role": "user",
      "content": `
        Analyze this tech article and return a JSON object with the following fields:

        Title: {{ $json.title }}
        Source: {{ $json.source }}
        Published: {{ $json.published }}
        Content: {{ $json.content }}

        Required analysis:

        1. summary: A 2-3 sentence professional summary in American English, focusing on key developments and business impact.

        2. tags: Array of 4-6 relevant topic tags from this list:
           - artificial intelligence, machine learning, deep learning
           - cybersecurity, data privacy, security breach
           - cloud computing, infrastructure, devops
           - semiconductors, hardware, chips
           - consumer tech, gadgets, mobile
           - enterprise software, saas, b2b
           - startups, funding, venture capital
           - blockchain, cryptocurrency, web3
           - regulation, policy, digital rights
           - big tech, antitrust, tech giants

        3. status: Development status from this list:
           - announced: newly announced product/service
           - in_progress: under development
           - launched: recently released
           - updated: existing product updated
           - discontinued: being phased out
           - rumored: unconfirmed reports
           - acquisition: company acquisition
           - investment: funding round
           - partnership: strategic partnership
           - security_incident: breach or vulnerability

        4. significance: Rate 1-5 based on business impact:
           1: Minor update, niche interest
           2: Moderate interest to specific audience
           3: Significant for industry segment
           4: Major industry news
           5: Game-changing, broad impact

        5. key_entities: Array of important companies, products, technologies mentioned

        6. sentiment: Overall sentiment (positive, negative, neutral)

        Return ONLY valid JSON without any additional text or markdown formatting.
      `
    }
  ],
  "temperature": 0.2,
  "max_tokens": 500
}
