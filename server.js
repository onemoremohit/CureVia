const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/analyze-health', async (req, res) => {
  const { diseaseName, affectedOrgan, age, gender, symptoms } = req.body;

  const prompt = `
    A user reports:
    - Disease Name: ${diseaseName || "Not provided"}
    - Affected Organs: ${affectedOrgan || "Not provided"}
    - Age: ${age}
    - Gender: ${gender}
    - Symptoms: ${symptoms}
    
    Based on this, suggest the most likely disease, urgency, and 3 treatment recommendations.
  `;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI health assistant." },
        { role: "user", content: prompt }
      ]
    });

    const aiResponse = completion.data.choices[0].message.content;
    res.json({ response: aiResponse });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
