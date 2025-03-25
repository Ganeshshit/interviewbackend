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
        Schema::create('feedback', function (Blueprint $table) {
            $table->id();
            $table->foreignId('interview_id')->constrained()->onDelete('cascade');
            $table->integer('score');
            $table->text('remarks');
            $table->text('code_submission')->nullable();
            $table->integer('technical_skills')->nullable();
            $table->integer('communication_skills')->nullable();
            $table->integer('problem_solving')->nullable();
            $table->integer('culture_fit')->nullable();
            $table->enum('recommendation', ['hire', 'consider', 'reject'])->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feedback');
    }
};
