<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Quiz;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /* Get all quiz categories */
    public function index(): JsonResponse
    {
        /* Get all categories sorted by name */
        $categories = Category::orderBy('name')->get();
        return response()->json([
            'success' => true,
            'categories' => $categories,
        ]);
    }

    /* Create a new quiz category */
    public function store(Request $request): JsonResponse
    {
        /* Make sure the category name is valid and not already used */
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
        ]);

        /* Save the new category */
        $category = Category::create([
            'name' => $request->input('name'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully',
            'category' => $category,
        ], 201);
    }

    /* Delete a quiz category and all quizzes in it */
    public function destroy(int $id): JsonResponse
    {
        /* Find the category */
        $category = Category::findOrFail($id);

        /* Delete all quizzes in this category */
        Quiz::where('category', $category->name)->delete();

        /* Delete the category */
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category and all its quizzes have been deleted successfully',
        ]);
    }
}
