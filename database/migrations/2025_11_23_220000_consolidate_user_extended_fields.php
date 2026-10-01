<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Consolidates all user table extensions:
     * - Role field
     * - Profile picture
     * - User ID with custom format
     * - Guardian and demographics information
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Add role field
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('user')->after('email');
            }

            // Add profile picture
            if (!Schema::hasColumn('users', 'profile_picture')) {
                $table->string('profile_picture')->nullable()->after('role');
            }

            // Add user_id with custom format
            if (!Schema::hasColumn('users', 'user_id')) {
                $table->string('user_id', 10)->nullable()->after('id');
            }

            // Add demographics fields
            if (!Schema::hasColumn('users', 'birthday')) {
                $table->date('birthday')->nullable()->after('profile_picture');
            }
            if (!Schema::hasColumn('users', 'age')) {
                $table->integer('age')->nullable()->after('birthday');
            }
            if (!Schema::hasColumn('users', 'gender')) {
                $table->enum('gender', ['Male', 'Female'])->nullable()->after('age');
            }

            // Add guardian information fields
            if (!Schema::hasColumn('users', 'guardian_fullname')) {
                $table->string('guardian_fullname')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('users', 'guardian_phone')) {
                $table->string('guardian_phone')->nullable()->after('guardian_fullname');
            }
            if (!Schema::hasColumn('users', 'guardian_email')) {
                $table->string('guardian_email')->nullable()->after('guardian_phone');
            }
        });

        // Generate user_id for existing users if not already set
        DB::statement("
            UPDATE users
            SET user_id = CONCAT('U', LPAD(id, 3, '0'))
            WHERE user_id IS NULL
        ");

        // Add unique constraint to user_id if not exists
        $indexes = DB::select("SHOW INDEXES FROM users WHERE Key_name = 'users_user_id_unique'");
        if (empty($indexes)) {
            Schema::table('users', function (Blueprint $table) {
                $table->unique('user_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'profile_picture',
                'user_id',
                'birthday',
                'age',
                'gender',
                'guardian_fullname',
                'guardian_phone',
                'guardian_email',
            ]);
        });
    }
};
