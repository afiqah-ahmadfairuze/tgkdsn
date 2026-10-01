<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Creates learning materials system tables:
     * - learning_categories: Organizational categories for materials
     * - learning_materials: Individual learning items with media
     *   - Uses longText for image_url to support base64-encoded images
     */
    public function up(): void
    {
        // Learning categories table
        Schema::create('learning_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Learning materials table with longText image_url
        Schema::create('learning_materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('learning_category_id')->constrained('learning_categories')->onDelete('cascade');
            $table->string('title'); // Dusun word
            $table->text('meaning'); // Translation
            $table->text('example_sentence')->nullable(); // Optional example sentence
            $table->longText('image_url'); // longText to support base64-encoded images
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_materials');
        Schema::dropIfExists('learning_categories');
    }
};
