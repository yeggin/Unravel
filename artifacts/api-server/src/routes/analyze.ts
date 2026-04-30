import { Router, type IRouter } from "express";
import { AnalyzeReflectionBody, AnalyzeReflectionResponse } from "@workspace/api-zod";
import { openai } from "../lib/openai";
import { INSIGHT_SYSTEM_PROMPT } from "../lib/systemPrompt";

const router: IRouter = Router();

router.post("/analyze", async (req, res) => {
  const parseResult = AnalyzeReflectionBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request", details: parseResult.error.issues });
    return;
  }

  const input = parseResult.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: INSIGHT_SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(input) },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      req.log.error("Empty response from OpenAI");
      res.status(502).json({ error: "Empty response from AI" });
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      req.log.error({ raw, err: e }, "Failed to parse AI JSON");
      res.status(502).json({ error: "AI returned invalid JSON" });
      return;
    }

    const validated = AnalyzeReflectionResponse.safeParse(parsed);
    if (!validated.success) {
      req.log.error({ parsed, issues: validated.error.issues }, "AI response failed validation");
      // Pass through anyway — the model output is best-effort. Prefer returning to the user.
      res.json(parsed);
      return;
    }

    res.json(validated.data);
  } catch (err) {
    req.log.error({ err }, "Analyze request failed");
    res.status(500).json({ error: "Failed to generate analysis" });
  }
});

export default router;
