import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const SYSTEM_PROMPT = `You are an expert tutor content generator. You create interactive educational content in structured JSON format.

SECTION TYPES you can use:
- "text" — informational block. content: { text: "..." }
- "cards" — flashcards. content: { cards: [{ front: "...", back: "..." }] }
- "quiz" — multiple choice. content: [{ question: "...", options: ["A","B","C","D"], correct: 0, explanation: "..." }]
- "fill_blanks" — fill in blanks (use ___ for blanks). content: { text: "I ___ a student", answers: ["am"] }
- "matching" — connect pairs. content: { pairs: [{ left: "...", right: "..." }] }
- "ordering" — arrange in order. content: { items: ["B","A","C"], correct_order: [1,0,2] }
- "true_false" — true/false statements. content: { questions: [{ statement: "...", correct: true, explanation: "..." }] }
- "open_answer" — free text. content: { prompt: "...", placeholder: "..." }

RULES:
- Each section needs: { id: (random string), type: "...", title: "...", content: ... }
- Generate 3-5 sections per request
- UI text and questions in Russian
- Target language words/phrases in the target language with Russian translations
- Content should be appropriate for the specified level
- Make it educational and engaging
- For homework: focus on graded types (quiz, fill_blanks, matching, ordering, true_false)
- For lessons: mix text, cards, and light quizzes

Return ONLY valid JSON, no markdown, no explanation.`

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { type, topic, language, level, lessonContent } = await req.json()

    if (!topic) {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY")
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    let userPrompt = ""
    if (type === "homework" && lessonContent) {
      userPrompt = `Generate HOMEWORK sections for this lesson:\n\nTopic: ${topic}\nLanguage: ${language || "polish"}\nLevel: ${level || "A1"}\n\nLesson content:\n${lessonContent}\n\nCreate 3-5 graded homework sections (quiz, fill_blanks, matching, ordering, true_false). Return JSON: { "sections": [...] }`
    } else {
      userPrompt = `Generate a LESSON with interactive sections:\n\nTopic: ${topic}\nLanguage: ${language || "polish"}\nLevel: ${level || "A1"}\n\nCreate a lesson with:\n1. A "text" section with key concepts\n2. A "cards" section with vocabulary\n3. 1-2 interactive sections (quiz/fill_blanks/matching)\n\nAlso generate a short lesson note (2-3 sentences summary).\n\nReturn JSON: { "notes": "...", "sections": [...] }`
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(JSON.stringify({ error: `OpenAI error: ${response.status}`, details: err }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return new Response(JSON.stringify({ error: "Empty response from AI" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const parsed = JSON.parse(content)

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
