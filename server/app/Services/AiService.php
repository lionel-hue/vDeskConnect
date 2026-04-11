<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiService
{
    public $apiKey;
    protected $baseUrl;
    protected $model;
    protected $provider;

    public function __construct()
    {
        $this->apiKey = config('services.ai.api_key') ?? env('AI_API_KEY');
        $this->baseUrl = config('services.ai.base_url') ?? env('AI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta');
        $this->model = config('services.ai.model') ?? env('AI_MODEL', 'gemini-1.5-flash');
        $this->provider = config('services.ai.provider') ?? env('AI_PROVIDER', 'gemini');
    }

    /**
     * Generate a lesson note using AI based on scheme of work data.
     */
    public function generateLessonNote(array $schemeData, array $gradeInfo, array $subjectInfo, int $audienceSize = 30): array
    {
        if ($this->apiKey) {
            return $this->generateWithAI($schemeData, $gradeInfo, $subjectInfo, $audienceSize);
        }

        // Fallback: Generate contextual lesson note using intelligent templating
        return $this->generateSmartFallback($schemeData, $gradeInfo, $subjectInfo, $audienceSize);
    }

    /**
     * Generate using real AI API (Gemini or OpenAI-compatible).
     */
    protected function generateWithAI(array $schemeData, array $gradeInfo, array $subjectInfo, int $audienceSize): array
    {
        try {
            $prompt = $this->buildPrompt($schemeData, $gradeInfo, $subjectInfo, $audienceSize);

            if ($this->provider === 'gemini') {
                return $this->callGeminiAPI($prompt, $schemeData);
            }

            // Default: OpenAI-compatible API
            return $this->callOpenAICompatibleAPI($prompt, $schemeData);
        } catch (\Exception $e) {
            Log::error('AI service error: ' . $e->getMessage());
            return $this->generateSmartFallback($schemeData, $gradeInfo, $subjectInfo, $audienceSize);
        }
    }

    /**
     * Call Gemini API (native format).
     */
    protected function callGeminiAPI(string $prompt, array $schemeData): array
    {
        $url = "{$this->baseUrl}/models/{$this->model}:generateContent?key={$this->apiKey}";

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->timeout(60)->post($url, [
            'contents' => [
                [
                    'parts' => [
                        [
                            'text' => $prompt
                        ]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.7,
                'maxOutputTokens' => 4000,
                'topP' => 0.95,
            ],
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $content = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';
            return $this->parseAIResponse($content, $schemeData);
        }

        Log::error('Gemini API error: ' . $response->body());
        throw new \Exception('Gemini API request failed: ' . $response->status());
    }

    /**
     * Call OpenAI-compatible API (OpenAI, DashScope/Qwen, etc.).
     */
    protected function callOpenAICompatibleAPI(string $prompt, array $schemeData): array
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(60)->post($this->baseUrl . '/chat/completions', [
            'model' => $this->model,
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'You are an expert educational content creator. Generate detailed, pedagogically sound lesson notes for teachers. Be specific, practical, and age-appropriate.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'temperature' => 0.7,
            'max_tokens' => 4000,
        ]);

        if ($response->successful()) {
            $data = $response->json();
            $content = $data['choices'][0]['message']['content'] ?? '';
            return $this->parseAIResponse($content, $schemeData);
        }

        Log::error('OpenAI-compatible API error: ' . $response->body());
        throw new \Exception('API request failed: ' . $response->status());
    }

    /**
     * Build the AI prompt with full context.
     */
    protected function buildPrompt(array $scheme, array $grade, array $subject, int $audienceSize): string
    {
        $objectives = $scheme['objectives'] ?? 'Not specified';
        $activities = $scheme['activities'] ?? 'Not specified';
        $resources = $scheme['resources'] ?? 'Not specified';
        $evaluation = $scheme['evaluation'] ?? 'Not specified';

        return <<<PROMPT
Generate a comprehensive lesson note for a teacher based on the following context:

**Subject:** {$subject['name']} ({$subject['code']})
**Grade Level:** {$grade['name']} ({$grade['cycle']} cycle)
**Topic:** {$scheme['topic']}
**Week Number:** {$scheme['week_number']}
**Term:** {$scheme['term_name']}
**Duration:** 40 minutes
**Class Size:** {$audienceSize} students

**Scheme Objectives (if provided):** {$objectives}
**Scheme Activities (if provided):** {$activities}
**Scheme Resources (if provided):** {$resources}
**Scheme Evaluation (if provided):** {$evaluation}

Please generate a complete lesson note with the following sections:

1. **LEARNING OBJECTIVE:** Clear, measurable objectives using Bloom's taxonomy verbs. Specify what students should know, understand, and be able to do by the end of the lesson.

2. **CONTENT:** Detailed, step-by-step lesson content including:
   - Introduction/Hook (5 mins): How to grab students' attention
   - Main Content Delivery (20 mins): Key concepts, explanations, examples
   - Student Practice (10 mins): Guided and independent practice activities
   - Conclusion (5 mins): Summary and key takeaways

3. **METHODOLOGY:** Specific teaching strategies and methods appropriate for this grade level and subject. Include differentiation strategies for diverse learners.

4. **MATERIALS/RESOURCES:** Concrete list of materials needed (textbooks, worksheets, manipulatives, technology, etc.)

5. **EVALUATION/ASSESSMENT:**
   - Formative assessment questions during the lesson
   - Exit ticket or quick assessment to check understanding
   - Sample questions with expected answers

Make the content:
- Age-appropriate for {$grade['name']} students
- Aligned with best pedagogical practices
- Engaging and interactive
- Include real-world examples where relevant
- Provide clear time allocations for each section

Output ONLY the lesson note content in a structured format.
PROMPT;
    }

    /**
     * Parse AI response into structured format.
     */
    protected function parseAIResponse(string $content, array $schemeData): array
    {
        // Extract sections using regex patterns
        $objective = $this->extractSection($content, 'OBJECTIVE', 'CONTENT');
        $lessonContent = $this->extractSection($content, 'CONTENT', 'METHODOLOGY');
        $methodology = $this->extractSection($content, 'METHODOLOGY', 'MATERIAL');
        $materials = $this->extractSection($content, 'MATERIAL', 'EVALUATION');
        $evaluation = $this->extractSection($content, 'EVALUATION', '$');

        return [
            'scheme_id' => $schemeData['id'],
            'week_number' => $schemeData['week_number'],
            'topic' => $schemeData['topic'],
            'aspects' => [
                'objective' => trim($objective) ?: 'Develop clear learning objectives aligned with the topic.',
                'content' => trim($lessonContent) ?: 'Detailed lesson content with introduction, main delivery, practice, and conclusion.',
                'methodology' => trim($methodology) ?: 'Interactive teaching methods: discussion, demonstration, guided practice, and group work.',
                'materials' => trim($materials) ?: 'Textbook, whiteboard, markers, handouts, and relevant learning materials.',
                'evaluation' => trim($evaluation) ?: 'Formative assessment through questioning, exit ticket, and observation of student practice.',
            ],
            'contact_number' => 40,
        ];
    }

    /**
     * Extract section between two markers.
     */
    protected function extractSection(string $content, string $startMarker, string $endMarker): string
    {
        $pattern = '/' . preg_quote($startMarker, '/') . '[:\s]*(.*?)(?=' . preg_quote($endMarker, '/') . '|\Z)/is';
        if (preg_match($pattern, $content, $matches)) {
            return trim($matches[1]);
        }
        return '';
    }

    /**
     * Smart fallback: Generate contextual lesson note using intelligent templates.
     * This produces real, useful content based on the subject, grade, and topic.
     */
    protected function generateSmartFallback(array $scheme, array $grade, array $subject, int $audienceSize): array
    {
        $gradeLevel = strtolower($grade['name']);
        $subjectName = strtolower($subject['name']);
        $topic = $scheme['topic'];

        // Build contextual content based on subject and grade
        $objective = $this->generateObjective($subjectName, $gradeLevel, $topic);
        $content = $this->generateContent($subjectName, $gradeLevel, $topic);
        $methodology = $this->generateMethodology($subjectName, $gradeLevel);
        $materials = $this->generateMaterials($subjectName, $gradeLevel);
        $evaluation = $this->generateEvaluation($subjectName, $gradeLevel, $topic);

        return [
            'scheme_id' => $scheme['id'],
            'week_number' => $scheme['week_number'],
            'topic' => $topic,
            'aspects' => [
                'objective' => $objective,
                'content' => $content,
                'methodology' => $methodology,
                'materials' => $materials,
                'evaluation' => $evaluation,
            ],
            'contact_number' => 40,
        ];
    }

    protected function generateObjective(string $subject, string $grade, string $topic): string
    {
        $templates = [
            'mathematics' => "By the end of this lesson on {$topic}, students should be able to:\n1. Define and explain key concepts related to {$topic}\n2. Apply mathematical procedures to solve problems involving {$topic}\n3. Demonstrate understanding through worked examples and practice exercises\n4. Connect {$topic} to real-world applications",
            'english' => "By the end of this lesson on {$topic}, students should be able to:\n1. Identify and analyze key elements of {$topic}\n2. Demonstrate comprehension through reading and discussion\n3. Apply language skills in writing and speaking activities\n4. Express ideas clearly and coherently about {$topic}",
            'science' => "By the end of this lesson on {$topic}, students should be able to:\n1. Explain the scientific concepts underlying {$topic}\n2. Describe processes and phenomena related to {$topic}\n3. Apply scientific inquiry methods to investigate {$topic}\n4. Relate {$topic} to everyday life and environmental contexts",
            'biology' => "By the end of this lesson on {$topic}, students should be able to:\n1. Describe the structure and function related to {$topic}\n2. Explain biological processes and their significance\n3. Analyze relationships between organisms and their environment\n4. Apply knowledge of {$topic} to real-world biological scenarios",
            'chemistry' => "By the end of this lesson on {$topic}, students should be able to:\n1. Identify chemical properties and reactions related to {$topic}\n2. Write balanced equations where applicable\n3. Explain the practical applications of {$topic}\n4. Perform safe laboratory procedures related to {$topic}",
            'physics' => "By the end of this lesson on {$topic}, students should be able to:\n1. State and explain physical laws and principles related to {$topic}\n2. Solve numerical problems using appropriate formulas\n3. Conduct experiments to verify concepts of {$topic}\n4. Apply physics principles to everyday situations",
            'social studies' => "By the end of this lesson on {$topic}, students should be able to:\n1. Describe key events and concepts related to {$topic}\n2. Analyze causes and effects of historical/social phenomena\n3. Discuss the relevance of {$topic} to contemporary society\n4. Develop critical thinking about {$topic} through discussion",
            'history' => "By the end of this lesson on {$topic}, students should be able to:\n1. Chronologically sequence key events related to {$topic}\n2. Identify important figures and their contributions\n3. Analyze the causes and consequences of {$topic}\n4. Draw connections between {$topic} and present-day society",
            'geography' => "By the end of this lesson on {$topic}, students should be able to:\n1. Locate and describe geographical features related to {$topic}\n2. Interpret maps and geographical data\n3. Explain the relationship between human activities and {$topic}\n4. Analyze environmental impacts related to {$topic}",
            'civic education' => "By the end of this lesson on {$topic}, students should be able to:\n1. Explain rights and responsibilities related to {$topic}\n2. Discuss the importance of {$topic} in democratic governance\n3. Analyze case studies related to {$topic}\n4. Demonstrate civic virtues in classroom discussions",
        ];

        return $templates[$subject] ?? "By the end of this lesson on {$topic}, students should be able to:\n1. Understand and explain key concepts related to {$topic}\n2. Apply knowledge through practical examples and exercises\n3. Demonstrate comprehension through class participation\n4. Connect {$topic} to real-life situations and other subjects";
    }

    protected function generateContent(string $subject, string $grade, string $topic): string
    {
        $isJunior = strpos($grade, 'jss') !== false || strpos($grade, 'junior') !== false;
        $isSenior = strpos($grade, 'ss') !== false || strpos($grade, 'senior') !== false;

        $level = $isJunior ? 'foundation level with simple language and concrete examples' : 'advanced level with detailed explanations and critical analysis';

        $structure = "LESSON CONTENT (40 minutes):

**INTRODUCTION (5 minutes):**
- Begin with a thought-provoking question or real-life scenario related to {$topic}
- Activate prior knowledge by asking students what they already know about {$topic}
- Clearly state the lesson objectives and outline the lesson structure
- Create interest through a brief demonstration, story, or visual aid

**MAIN CONTENT DELIVERY (20 minutes):**
- Present the key concepts of {$topic} using {$level}
- Use the whiteboard to outline main points, definitions, and key terms
- Provide clear, step-by-step explanations with relevant examples
- Use visual aids, diagrams, or models to illustrate abstract concepts
- Connect {$topic} to previous lessons and real-world applications
- Pause periodically to check understanding and address questions

Key Points to Cover:
1. Definition and meaning of {$topic}
2. Key concepts, principles, or rules related to {$topic}
3. Examples and applications of {$topic}
4. Common misconceptions and how to avoid them

**STUDENT PRACTICE (10 minutes):**
- Guide students through worked examples related to {$topic}
- Have students work in pairs or small groups on practice exercises
- Circulate the classroom to provide individual support and feedback
- Encourage students to explain their reasoning and thought process
- Address common errors and misconceptions as they arise

**CONCLUSION (5 minutes):**
- Summarize the main points covered in the lesson
- Ask students to share one thing they learned about {$topic}
- Preview the next lesson and how it connects to today's topic
- Assign relevant homework or practice exercises";

        return $structure;
    }

    protected function generateMethodology(string $subject, string $grade): string
    {
        $isJunior = strpos($grade, 'jss') !== false || strpos($grade, 'junior') !== false;

        if ($isJunior) {
            return "TEACHING METHODOLOGY:

1. **Direct Instruction (10 mins):** Teacher-led presentation of key concepts with clear explanations and demonstrations
2. **Interactive Discussion (10 mins):** Question-and-answer session to engage students and check understanding
3. **Guided Practice (10 mins):** Teacher works through examples with student participation
4. **Collaborative Learning (5 mins):** Pair or group work on practice exercises
5. **Differentiation Strategies:**
   - For struggling students: Provide additional scaffolding, simplified examples, and one-on-one support
   - For advanced students: Offer extension problems and deeper exploration questions
   - Use visual, auditory, and kinesthetic approaches to accommodate different learning styles
6. **Classroom Management:** Establish clear expectations, use positive reinforcement, and maintain an inclusive learning environment";
        }

        return "TEACHING METHODOLOGY:

1. **Lecture with Interactive Elements (10 mins):** Structured presentation with periodic questioning and student responses
2. **Problem-Based Learning (10 mins):** Present real-world problems related to the topic for students to analyze
3. **Peer Discussion (10 mins):** Structured discussions where students explain concepts to each other
4. **Independent Practice (5 mins):** Individual work on application problems
5. **Differentiation Strategies:**
   - Provide tiered assignments based on student readiness levels
   - Use Socratic questioning to promote critical thinking
   - Incorporate technology tools where available
   - Allow student choice in how they demonstrate understanding
6. **Assessment for Learning:** Use exit tickets, thumbs up/down, and random questioning to monitor understanding throughout the lesson";
    }

    protected function generateMaterials(string $subject, string $grade): string
    {
        $commonMaterials = "- Whiteboard/Chalkboard and markers/chalk\n- Textbook: Relevant chapter on the topic\n- Printed worksheets or handouts\n- Student notebooks and writing materials";

        $subjectSpecific = [
            'mathematics' => "- Mathematical instruments: rulers, protractors, compasses, calculators\n- Graph paper for plotting and visualization\n- Manipulatives (counters, blocks, or geometric shapes)\n- Formula sheets or reference cards",
            'science' => "- Laboratory equipment (beakers, test tubes, etc.) as needed\n- Safety equipment: goggles, gloves, lab coats\n- Specimens, models, or samples related to the topic\n- Scientific measurement tools (rulers, thermometers, etc.)",
            'english' => "- Reading passages or texts related to the topic\n- Vocabulary lists and dictionaries\n- Graphic organizers for writing activities\n- Audio-visual materials (videos, recordings) if available",
            'biology' => "- Biological specimens, models, or diagrams\n- Microscopes and slides (if applicable)\n- Charts showing biological processes or systems\n- Field guides or identification keys",
            'chemistry' => "- Chemical reagents and solutions (if lab work is included)\n- Periodic table charts\n- Molecular model kits\n- Safety data sheets for chemicals used",
            'physics' => "- Physics demonstration apparatus\n- Measuring instruments (stopwatches, meters, balances)\n- Diagrams of physical systems or phenomena\n- Calculation sheets and formula references",
            'history' => "- Historical maps and timelines\n- Primary source documents or excerpts\n- Photographs and historical artifacts (reproductions)\n- Biographical information on key figures",
            'geography' => "- Maps (political, physical, thematic)\n- Globes or atlas\n- Statistical data and graphs\n- Satellite imagery or aerial photographs",
        ];

        $specific = $subjectSpecific[$subject] ?? "- Visual aids (posters, charts, diagrams) related to the topic\n- Reference materials and supplementary readings\n- Any subject-specific tools or equipment";

        return "MATERIALS AND RESOURCES:\n\n{$commonMaterials}\n\n{$specific}\n\n- Projector or smartboard (if available) for presentations\n- Internet access for supplementary resources\n- Assessment rubrics or marking guides";
    }

    protected function generateEvaluation(string $subject, string $grade, string $topic): string
    {
        return "EVALUATION AND ASSESSMENT:

**FORMATIVE ASSESSMENT (During Lesson):**
1. **Oral Questioning:** Ask probing questions throughout the lesson to check understanding:
   - \"Can you explain in your own words what {$topic} means?\"
   - \"How does this concept relate to what we learned last week?\"
   - \"Can you give me an example of {$topic} in real life?\"

2. **Observation:** Monitor student participation during practice activities and note common difficulties

3. **Exit Ticket (End of Lesson):** Have students write responses to:
   - One thing they learned about {$topic}
   - One question they still have
   - One real-world application of today's topic

**SUMMATIVE ASSESSMENT (Homework/Follow-up):**
1. Assign practice problems or exercises related to {$topic}
2. Short quiz or test on key concepts (can be given next lesson)
3. Project or presentation opportunity for students to demonstrate deeper understanding

**ASSESSMENT CRITERIA:**
- Accuracy of responses and problem-solving
- Ability to explain concepts in own words
- Application of knowledge to new situations
- Quality of written work and presentation
- Participation and engagement during class activities

**FEEDBACK STRATEGY:**
- Provide immediate feedback during guided practice
- Use positive reinforcement to encourage effort
- Address misconceptions promptly and clearly
- Return graded work with constructive comments within one week";
    }
}
