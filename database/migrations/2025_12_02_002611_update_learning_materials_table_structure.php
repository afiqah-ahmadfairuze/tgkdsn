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
        Schema::table('learning_materials', function (Blueprint $table) {
            // Drop old columns if they exist
            if (Schema::hasColumn('learning_materials', 'meaning')) {
                $table->dropColumn('meaning');
            }
            if (Schema::hasColumn('learning_materials', 'example_sentence')) {
                $table->dropColumn('example_sentence');
            }
            if (Schema::hasColumn('learning_materials', 'image_url')) {
                $table->dropColumn('image_url');
            }
            if (Schema::hasColumn('learning_materials', 'learning_category_id')) {
                $table->dropForeign(['learning_category_id']);
                $table->dropColumn('learning_category_id');
            }

            // Add new columns if they don't exist
            if (!Schema::hasColumn('learning_materials', 'description')) {
                $table->text('description')->nullable()->after('title');
            }
            if (!Schema::hasColumn('learning_materials', 'category')) {
                $table->string('category')->nullable()->after('description');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('learning_materials', function (Blueprint $table) {
            // Restore old columns
            if (!Schema::hasColumn('learning_materials', 'meaning')) {
                $table->text('meaning')->nullable();
            }
            if (!Schema::hasColumn('learning_materials', 'example_sentence')) {
                $table->text('example_sentence')->nullable();
            }
            if (!Schema::hasColumn('learning_materials', 'image_url')) {
                $table->string('image_url')->nullable();
            }
            if (!Schema::hasColumn('learning_materials', 'learning_category_id')) {
                $table->foreignId('learning_category_id')->nullable()->constrained('learning_categories');
            }

            // Drop new columns
            if (Schema::hasColumn('learning_materials', 'description')) {
                $table->dropColumn('description');
            }
            if (Schema::hasColumn('learning_materials', 'category')) {
                $table->dropColumn('category');
            }
        });
    }
};
