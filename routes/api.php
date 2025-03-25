<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\CodingQuestionController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\InterviewerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
  // Auth
  Route::post('/logout', [AuthController::class, 'logout']);
  Route::get('/user', [AuthController::class, 'user']);

  // Profile
  Route::get('/profile', [ProfileController::class, 'show']);
  Route::post('/profile', [ProfileController::class, 'update']);
  Route::get('/profile/{id}/resume', [ProfileController::class, 'downloadResume']);

  // Interviewers
  Route::get('/interviewers', [InterviewerController::class, 'index']);
  Route::get('/interviewers/{id}', [InterviewerController::class, 'show']);
  Route::get('/interviewers/{id}/availability', [InterviewerController::class, 'availability']);
  
  // Availability
  Route::get('/availability', [AvailabilityController::class, 'index']);
  Route::post('/availability', [AvailabilityController::class, 'store']);
  Route::get('/availability/{id}', [AvailabilityController::class, 'show']);
  Route::put('/availability/{id}', [AvailabilityController::class, 'update']);
  Route::delete('/availability/{id}', [AvailabilityController::class, 'destroy']);
  Route::get('/availability/dates/{interviewerId}', [AvailabilityController::class, 'availableDates']);
  Route::get('/availability/slots/{interviewerId}/{date}', [AvailabilityController::class, 'availableSlots']);

  // Interviews
  Route::get('/interviews', [InterviewController::class, 'index']);
  Route::post('/interviews', [InterviewController::class, 'store']);
  Route::get('/interviews/{id}', [InterviewController::class, 'show']);
  Route::put('/interviews/{id}', [InterviewController::class, 'update']);
  Route::delete('/interviews/{id}', [InterviewController::class, 'destroy']);
  Route::get('/upcoming-interviews', [InterviewController::class, 'upcoming']);
  Route::post('/interviews/{id}/code', [InterviewController::class, 'submitCode']);
  Route::post('/interviews/{id}/question', [InterviewController::class, 'setQuestion']);
  Route::post('/execute-code', [InterviewController::class, 'executeCode']);
  Route::get('/interviews/{id}/can-join', [InterviewController::class, 'canJoin']);

  // Feedback
  Route::post('/feedback', [FeedbackController::class, 'store']);
  Route::get('/feedback/{id}', [FeedbackController::class, 'show']);
  Route::put('/feedback/{id}', [FeedbackController::class, 'update']);

  // Messages
  Route::get('/interviews/{interviewId}/messages', [MessageController::class, 'index']);
  Route::post('/messages', [MessageController::class, 'store']);

  // Coding Questions
  Route::get('/coding-questions', [CodingQuestionController::class, 'index']);
  Route::post('/coding-questions', [CodingQuestionController::class, 'store']);
  Route::get('/coding-questions/{id}', [CodingQuestionController::class, 'show']);
  Route::put('/coding-questions/{id}', [CodingQuestionController::class, 'update']);
  Route::delete('/coding-questions/{id}', [CodingQuestionController::class, 'destroy']);

  // Admin routes
  Route::get('/admin/users', [AdminController::class, 'users']);
  Route::post('/admin/users', [AdminController::class, 'createUser']);
  Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
  Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
  Route::get('/admin/statistics', [AdminController::class, 'statistics']);
});

