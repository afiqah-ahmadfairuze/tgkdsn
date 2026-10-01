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
        Schema::table('dictionary_entries', function (Blueprint $table) {
            $table->foreignId('dictionary_category_id')->nullable()->constrained('dictionary_categories')->onDelete('set null');
            $table->integer('search_count')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dictionary_entries', function (Blueprint $table) {
            $table->dropForeignIdFor('dictionary_categories');
            $table->dropColumn('dictionary_category_id');
            $table->dropColumn('search_count');
        });
    }
};
