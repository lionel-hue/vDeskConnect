<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LessonNote;
use App\Models\SchemeOfWork;
use App\Models\Lecture;
use App\Models\User;
use App\Models\School;
use App\Models\GradeLevel;
use App\Models\Subject;
use App\Models\AcademicTerm;

class AcademicMarkdownSeeder extends Seeder
{
    public function run()
    {
        $school = School::first();
        if (!$school) return;

        $teacher = User::where('role', 'teacher')->first();
        if (!$teacher) return;

        $gradeLevel = GradeLevel::where('school_id', $school->id)->first();
        $subject = Subject::where('school_id', $school->id)->first();
        $term = AcademicTerm::where('school_id', $school->id)->first();

        if (!$gradeLevel || !$subject || !$term) return;

        // 1. Seed Scheme of Work with Markdown
        SchemeOfWork::create([
            'school_id' => $school->id,
            'term_id' => $term->id,
            'grade_level_id' => $gradeLevel->id,
            'subject_id' => $subject->id,
            'week_number' => 1,
            'topic' => 'Introduction to Organic Chemistry',
            'aspects' => [
                'objectives' => "By the end of this week, students should be able to:\n- **Define** organic chemistry.\n- **Explain** the catenation property of carbon.\n- **Identify** various homologous series.",
                'activities' => "1. **Discussion:** Differences between organic and inorganic compounds.\n2. **Demonstration:** Burning sugar to show carbon presence.\n3. **Group Work:** Modeling methane molecules using kits.",
                'resources' => "- Periodic Table\n- Molecular Model Kits\n- [Chemistry Reference Link](https://example.com/organic-chem)",
                'evaluation' => "### Quiz Questions:\n1. Why is carbon unique?\n2. Name three alkanes.\n\n**Exit Ticket:** Write one thing you learned today."
            ],
            'status' => 'published',
            'created_by' => $teacher->id
        ]);

        // 2. Seed Lesson Note with Markdown
        LessonNote::create([
            'school_id' => $school->id,
            'term_id' => $term->id,
            'grade_level_id' => $gradeLevel->id,
            'subject_id' => $subject->id,
            'week_number' => 1,
            'topic' => 'The Structure of the Atom',
            'aspects' => [
                'objective' => "Students will understand the **subatomic particles** and their arrangements.\n\n> \"The atom is the basic unit of matter.\"",
                'content' => "## Subatomic Particles\n\n| Particle | Charge | Mass |\n|----------|--------|------|\n| Proton   | +1     | 1    |\n| Neutron  | 0      | 1    |\n| Electron | -1     | 1/1840 |\n\n### Atomic Models\n- **Dalton's Model:** Solid sphere.\n- **Rutherford:** Nuclear model.\n- **Bohr:** Energy levels.",
                'methodology' => "- **Visual Aids:** Using 3D animations.\n- **Guided Inquiry:** Students hypothesize about charge interactions.",
                'materials' => "- Atomic Charts\n- Digital Projector\n- Plasticine for models",
                'evaluation' => "#### Evaluation Tasks\n- Sketch the Bohr model of Nitrogen.\n- Calculate neutrons for Carbon-14."
            ],
            'contact_number' => 45,
            'status' => 'published',
            'created_by' => $teacher->id
        ]);

        // 3. Seed Lecture with Markdown
        Lecture::create([
            'school_id' => $school->id,
            'teacher_id' => $teacher->id,
            'grade_level_id' => $gradeLevel->id,
            'subject_id' => $subject->id,
            'title' => 'Quantum Mechanics Basics',
            'description' => 'An introduction to wave-particle duality and uncertainty.',
            'scheduled_at' => now()->addDays(2),
            'duration_minutes' => 60,
            'status' => 'scheduled',
            'type' => 'async',
            'content' => "## Quantum Mechanics Overview\n\nQuantum mechanics is the branch of physics that deals with very small scales.\n\n### Key Concepts\n1. **Wave-Particle Duality:** Particles exhibit wave-like behavior.\n2. **Heisenberg Uncertainty Principle:** $\\Delta x \\Delta p \\geq \\frac{\\hbar}{2}$\n\n```python\n# Probability calculation example\nimport numpy as np\ndef psi_squared(x):\n    return np.abs(psi(x))**2\n```\n\n---\n\nCheck the resources tab for the full PDF guide.",
            'is_published' => true,
            'created_by' => $teacher->id
        ]);
    }
}
