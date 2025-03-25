<?php

namespace Database\Seeders;

use App\Models\CodingQuestion;
use App\Models\User;
use Illuminate\Database\Seeder;

class CodingQuestionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $interviewer = User::where('role', 'interviewer')->first();

        if (!$interviewer) {
            return;
        }

        // Create some sample coding questions
        CodingQuestion::create([
            'title' => 'Reverse a String',
            'description' => 'Write a function that reverses a string. The input string is given as an array of characters.',
            'difficulty' => 'easy',
            'language' => 'javascript',
            'created_by' => $interviewer->id,
            'starter_code' => 'function reverseString(str) {\n  // Your code here\n}',
            'test_cases' => 'reverseString("hello") // should return "olleh"\nreverseString("world") // should return "dlrow"',
            'solution' => 'function reverseString(str) {\n  return str.split("").reverse().join("");\n}',
        ]);

        CodingQuestion::create([
            'title' => 'Two Sum',
            'description' => 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            'difficulty' => 'easy',
            'language' => 'javascript',
            'created_by' => $interviewer->id,
            'starter_code' => 'function twoSum(nums, target) {\n  // Your code here\n}',
            'test_cases' => 'twoSum([2,7,11,15], 9) // should return [0,1]\ntwoSum([3,2,4], 6) // should return [1,2]',
            'solution' => 'function twoSum(nums, target) {\n  const map = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map[complement] !== undefined) {\n      return [map[complement], i];\n    }\n    map[nums[i]] = i;\n  }\n  return [];\n}',
        ]);

        CodingQuestion::create([
            'title' => 'Longest Substring Without Repeating Characters',
            'description' => 'Given a string s, find the length of the longest substring without repeating characters.',
            'difficulty' => 'medium',
            'language' => 'javascript',
            'created_by' => $interviewer->id,
            'starter_code' => 'function lengthOfLongestSubstring(s) {\n  // Your code here\n}',
            'test_cases' => 'lengthOfLongestSubstring("abcabcbb") // should return 3\nlengthOfLongestSubstring("bbbbb") // should return 1',
            'solution' => 'function lengthOfLongestSubstring(s) {\n  let maxLength = 0;\n  let start = 0;\n  const charMap = {};\n  \n  for (let end = 0; end < s.length; end++) {\n    const currentChar = s[end];\n    if (charMap[currentChar] !== undefined && charMap[currentChar] >= start) {\n      start = charMap[currentChar] + 1;\n    }\n    charMap[currentChar] = end;\n    maxLength = Math.max(maxLength, end - start + 1);\n  }\n  \n  return maxLength;\n}',
        ]);
    }
}

