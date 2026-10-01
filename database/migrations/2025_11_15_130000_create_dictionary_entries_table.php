<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates dictionary_entries table with consolidated fields:
     * - Original structure (dusun_word, pronunciation, word_picture)
     * - Translations (bm_translation, en_translation)
     * - Example sentences in multiple languages
     * - Language tracking fields
     */
    public function up(): void
    {
        Schema::create('dictionary_entries', function (Blueprint $table) {
            $table->id('entry_id');
            $table->string('dusun_word', 255)->unique();
            $table->string('bm_translation', 255); // Bahasa Melayu translation
            $table->string('en_translation', 255)->nullable(); // English translation
            $table->string('pronunciation', 255)->nullable();
            $table->string('word_picture')->nullable();
            $table->text('dusun_example_sentence')->nullable();
            $table->text('bm_example_translation')->nullable();
            $table->text('en_example_translation')->nullable();
            $table->string('source_language', 50)->nullable();
            $table->string('target_language', 50)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dictionary_entries');
    }
};
