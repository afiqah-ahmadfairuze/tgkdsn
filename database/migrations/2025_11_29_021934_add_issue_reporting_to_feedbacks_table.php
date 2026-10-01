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
        Schema::table('feedbacks', function (Blueprint $table) {
            $table->boolean('issue_reported')->default(false)->after('improvements');
            $table->string('issue_type')->nullable()->after('issue_reported');
            $table->text('issue_details')->nullable()->after('issue_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('feedbacks', function (Blueprint $table) {
            $table->dropColumn(['issue_reported', 'issue_type', 'issue_details']);
        });
    }
};
