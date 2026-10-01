<?php

namespace Database\Seeders;

use App\Models\Quiz;
use App\Models\QuizQuestion;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Quiz 1: Dusun Language Basics
        $quiz1 = Quiz::create([
            'title' => 'Dusun Language Basics',
            'description' => 'Learn basic Dusun words and phrases',
            'total_marks' => 4,
            'is_available' => true,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz1->id,
            'question_text' => 'What is the Dusun word for "water"?',
            'option_a' => 'Ayu',
            'option_b' => 'Tubig',
            'option_c' => 'Tulan',
            'option_d' => 'Ramian',
            'correct_answer' => 'A',
            'marks' => 1,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz1->id,
            'question_text' => 'What does "Motoboh" mean?',
            'option_a' => 'Thank you',
            'option_b' => 'Hello',
            'option_c' => 'Goodbye',
            'option_d' => 'Good morning',
            'correct_answer' => 'A',
            'marks' => 1,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz1->id,
            'question_text' => 'How do you say "rice" in Dusun?',
            'option_a' => 'Nasi',
            'option_b' => 'Paray',
            'option_c' => 'Palina',
            'option_d' => 'Bulan',
            'correct_answer' => 'B',
            'marks' => 1,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz1->id,
            'question_text' => 'What is the Dusun word for "house"?',
            'option_a' => 'Rumah',
            'option_b' => 'Balay',
            'option_c' => 'Tahanan',
            'option_d' => 'Sasaran',
            'correct_answer' => 'B',
            'marks' => 1,
        ]);

        // Create Quiz 2: Dusun Greetings and Expressions
        $quiz2 = Quiz::create([
            'title' => 'Dusun Greetings and Expressions',
            'description' => 'Master common Dusun greetings and expressions',
            'total_marks' => 4,
            'is_available' => true,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz2->id,
            'question_text' => 'How do you greet someone in the morning in Dusun?',
            'option_a' => 'Ayuyu',
            'option_b' => 'Mongogon',
            'option_c' => 'Marung',
            'option_d' => 'Salam',
            'correct_answer' => 'B',
            'marks' => 1,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz2->id,
            'question_text' => 'What does "Matumbou" mean?',
            'option_a' => 'Good night',
            'option_b' => 'See you later',
            'option_c' => 'I am sorry',
            'option_d' => 'Please',
            'correct_answer' => 'C',
            'marks' => 1,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz2->id,
            'question_text' => 'How do you say "yes" in Dusun?',
            'option_a' => 'Iya',
            'option_b' => 'Tiyok',
            'option_c' => 'Oo',
            'option_d' => 'Haan',
            'correct_answer' => 'C',
            'marks' => 1,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz2->id,
            'question_text' => 'What is the Dusun word for "love"?',
            'option_a' => 'Cinta',
            'option_b' => 'Minorig',
            'option_c' => 'Ragas',
            'option_d' => 'Pasung',
            'correct_answer' => 'B',
            'marks' => 1,
        ]);

        // Create Quiz 3: Dusun Culture and Traditions
        $quiz3 = Quiz::create([
            'title' => 'Dusun Culture and Traditions',
            'description' => 'Test your knowledge about Dusun culture and traditions',
            'total_marks' => 4,
            'is_available' => true,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz3->id,
            'question_text' => 'What is the traditional Dusun house called?',
            'option_a' => 'Balay',
            'option_b' => 'Rumah',
            'option_c' => 'Tahanan',
            'option_d' => 'Kampung',
            'correct_answer' => 'A',
            'marks' => 1,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz3->id,
            'question_text' => 'What is the main staple food of the Dusun people?',
            'option_a' => 'Corn',
            'option_b' => 'Wheat',
            'option_c' => 'Rice',
            'option_d' => 'Cassava',
            'correct_answer' => 'C',
            'marks' => 1,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz3->id,
            'question_text' => 'What is "Tamu" in Dusun culture?',
            'option_a' => 'A celebration',
            'option_b' => 'A harvest festival',
            'option_c' => 'A type of game',
            'option_d' => 'A traditional tool',
            'correct_answer' => 'B',
            'marks' => 1,
        ]);

        QuizQuestion::create([
            'quiz_id' => $quiz3->id,
            'question_text' => 'Where do most Dusun people traditionally live?',
            'option_a' => 'Coastal areas',
            'option_b' => 'Mountain regions (Sabah)',
            'option_c' => 'Rainforests',
            'option_d' => 'Desert regions',
            'correct_answer' => 'B',
            'marks' => 1,
        ]);

        $this->command->info('✓ Sample quizzes with questions created successfully!');
        $this->command->info('  - Quiz 1: Dusun Language Basics (4 marks)');
        $this->command->info('  - Quiz 2: Dusun Greetings and Expressions (4 marks)');
        $this->command->info('  - Quiz 3: Dusun Culture and Traditions (4 marks)');
    }
}
