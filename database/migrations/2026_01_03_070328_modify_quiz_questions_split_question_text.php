<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->text('question_bm')->nullable()->after('quiz_id');
            $table->text('question_eng')->nullable()->after('question_bm');
        });

        // Migrate existing data from question_text to question_bm
        DB::table('quiz_questions')->update([
            'question_bm' => DB::raw('question_text')
        ]);

        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->dropColumn('question_text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->text('question_text')->nullable()->after('quiz_id');
        });

        // Migrate data back from question_bm to question_text
        DB::table('quiz_questions')->update([
            'question_text' => DB::raw('question_bm')
        ]);

        Schema::table('quiz_questions', function (Blueprint $table) {
            $table->dropColumn(['question_bm', 'question_eng']);
        });
    }
};
