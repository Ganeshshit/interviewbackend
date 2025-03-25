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
        Schema::table('coding_questions', function (Blueprint $table) {
            $table->dropColumn(['language', 'starter_code', 'test_cases', 'solution']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coding_questions', function (Blueprint $table) {
            $table->string('language');
            $table->text('starter_code')->nullable();
            $table->text('test_cases')->nullable();
            $table->text('solution')->nullable();
        });
    }
};
