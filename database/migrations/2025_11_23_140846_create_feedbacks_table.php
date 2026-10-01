<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('feedbacks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('language')->default('en'); // 'en' or 'bm'
            $table->string('ease_of_use'); // Yes, Okay, Hard (ENG) / Ya, Boleh lah, Susah (BM)
            $table->string('learned_words'); // Yes, A little, No (ENG) / Ya, Sedikit, Tidak (BM)
            $table->string('quiz_fun'); // Yes, Kind of, No (ENG) / Ya, Boleh lah, Tidak (BM)
            $table->string('virtual_tour'); // Yes, Okay, Not really (ENG) / Ya, Biasa saja, Tidak sangat (BM)
            $table->text('favourite_part'); // Short answer
            $table->text('improvements')->nullable(); // Optional short answer
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedbacks');
    }
};
