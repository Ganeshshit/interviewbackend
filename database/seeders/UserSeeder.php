<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Profile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        Profile::create([
            'user_id' => $admin->id,
        ]);

        // Create interviewer user
        $interviewer = User::create([
            'name' => 'Interviewer User',
            'email' => 'interviewer@example.com',
            'password' => Hash::make('password'),
            'role' => 'interviewer',
        ]);

        Profile::create([
            'user_id' => $interviewer->id,
            'skills' => 'JavaScript, React, Node.js',
            'experience' => '5 years of experience in frontend development',
            'field_of_interest' => 'Frontend Development',
            'expertise_level' => 'senior',
        ]);

        // Create candidate user
        $candidate = User::create([
            'name' => 'Candidate User',
            'email' => 'candidate@example.com',
            'password' => Hash::make('password'),
            'role' => 'candidate',
        ]);

        Profile::create([
            'user_id' => $candidate->id,
            'skills' => 'JavaScript, React, CSS',
            'experience' => '2 years of experience in web development',
            'field_of_interest' => 'Frontend Development',
            'expertise_level' => 'junior',
        ]);
    }
}

