<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LearningCategory;
use App\Models\LearningMaterial;
use App\Models\Flashcard;
use App\Models\UserMaterialProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class LearningMaterialController extends Controller
{
    /* Show the admin all learning materials */
    public function index(): Response
    {
        /* Get all categories and materials */
        $categories = LearningCategory::orderBy('name')->get();
        $materials = LearningMaterial::with('flashcards')
            ->withCount('flashcards')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($material) {
                /* Add full URLs to cover images */
                if ($material->cover_image) {
                    $material->cover_image = asset('storage/' . $material->cover_image);
                }
                /* Add full URLs to flashcard images */
                if ($material->flashcards) {
                    $material->flashcards = $material->flashcards->map(function ($flashcard) {
                        if ($flashcard->image) {
                            $flashcard->image = asset('storage/' . $flashcard->image);
                        }
                        return $flashcard;
                    });
                }
                return $material;
            });

        /* Show the admin the learning materials page */
        return Inertia::render('Admin/LearningMaterials', [
            'categories' => $categories,
            'materials' => $materials,
        ]);
    }

    /* Create a new learning material category */
    public function storeCategory(Request $request)
    {
        /* Make sure the category name is valid and not already used */
        $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:learning_categories,name'],
        ]);

        /* Save the new category */
        $category = LearningCategory::create([
            'name' => $request->input('name'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully!',
            'category' => $category,
        ]);
    }

    /* Delete a learning material category and everything in it */
    public function destroyCategory(LearningCategory $category)
    {
        /* Delete all materials in this category */
        foreach ($category->materials as $material) {
            /* Delete all flashcards for each material */
            foreach ($material->flashcards as $flashcard) {
                /* Delete flashcard image if it exists */
                if ($flashcard->image && Storage::disk('public')->exists($flashcard->image)) {
                    Storage::disk('public')->delete($flashcard->image);
                }
                $flashcard->delete();
            }
            $material->delete();
        }

        /* Delete the category */
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully',
        ]);
    }

    /* Create a new learning material (step 1: basic info) */
    public function storeMaterial(Request $request)
    {
        /* Make sure the material info is valid */
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
        ]);

        $coverImage = null;

        /* Save the cover image if they uploaded one */
        if ($request->hasFile('cover_image')) {
            $coverImage = $request->file('cover_image')->store('learning_materials', 'public');
        }

        /* Create the material in the database */
        $material = LearningMaterial::create([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'category' => $request->input('category'),
            'cover_image' => $coverImage,
        ]);

        /* Tell the admin the material was created */
        return response()->json([
            'success' => true,
            'message' => 'Material created successfully! Now add flashcards to it.',
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'description' => $material->description,
                'category' => $material->category,
                'cover_image' => $coverImage ? asset('storage/' . $coverImage) : null,
            ],
        ]);
    }

    /* Update a learning material's basic info */
    public function updateMaterialDetails(Request $request, LearningMaterial $material)
    {
        /* Make sure the new info is valid */
        $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'max:2048'],
        ]);

        /* Handle the cover image */
        $coverImage = $material->cover_image;
        if ($request->hasFile('cover_image')) {
            /* Delete the old cover image if it exists */
            if ($coverImage && Storage::disk('public')->exists($coverImage)) {
                Storage::disk('public')->delete($coverImage);
            }
            $coverImage = $request->file('cover_image')->store('learning_materials', 'public');
        }

        /* Save the changes */
        $material->update([
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'category' => $request->input('category'),
            'cover_image' => $coverImage,
        ]);

        /* Tell the admin it was updated */
        return response()->json([
            'success' => true,
            'message' => 'Material details updated successfully!',
            'material' => [
                'id' => $material->id,
                'title' => $material->title,
                'description' => $material->description,
                'category' => $material->category,
                'cover_image' => $material->cover_image ? asset('storage/' . $material->cover_image) : null,
            ],
        ]);
    }

    /* Add or update flashcards for a learning material (step 2) */
    public function updateMaterial(Request $request, LearningMaterial $material)
    {
        /* Get the flashcards data from the form */
        $flashcardsJson = $request->input('flashcards_json');

        /* Make sure they provided flashcard data */
        if (!$flashcardsJson) {
            return response()->json([
                'success' => false,
                'message' => 'No flashcards data provided',
            ], 422);
        }

        /* Turn the JSON into an array */
        $flashcardsData = json_decode($flashcardsJson, true);

        /* Make sure they provided between 1 and 20 flashcards */
        if (count($flashcardsData) < 1 || count($flashcardsData) > 20) {
            return response()->json([
                'success' => false,
                'message' => 'Material must have between 1 and 20 flashcards',
            ], 422);
        }

        /* Process the flashcards and handle images */
        $oldFlashcards = $material->flashcards->keyBy('id');
        $preservedImages = [];
        $newFlashcards = $this->processFlashcards($request, $flashcardsData, $material->id, $oldFlashcards, $preservedImages);

        /* Delete old flashcards and save new ones */
        $this->deleteOldFlashcards($oldFlashcards, $preservedImages);
        $this->createFlashcards($newFlashcards);

        /* Tell the admin the flashcards were saved */
        return response()->json([
            'success' => true,
            'message' => 'Flashcards saved successfully!',
        ]);
    }

    /* Prepare all the flashcard data */
    private function processFlashcards($request, $flashcardsData, $materialId, $oldFlashcards, &$preservedImages)
    {
        $newFlashcards = [];
        $oldFlashcardsList = $oldFlashcards->values();

        /* Go through each flashcard and prepare its data */
        foreach ($flashcardsData as $index => $flashcardData) {
            $imagePath = $this->handleFlashcardImage($request, $index, $oldFlashcardsList, $preservedImages);

            $newFlashcards[] = [
                'material_id' => $materialId,
                'word' => $flashcardData['word'],
                'description' => $flashcardData['description'],
                'description_eng' => $flashcardData['description_eng'] ?? '',
                'image' => $imagePath,
            ];
        }

        return $newFlashcards;
    }

    /* Handle saving or keeping a flashcard's image */
    private function handleFlashcardImage($request, $index, $oldFlashcardsList, &$preservedImages)
    {
        /* If they uploaded a new image, save it */
        if ($request->hasFile("flashcard_images.{$index}")) {
            return $request->file("flashcard_images.{$index}")->store('flashcards', 'public');
        }

        /* If there's an old image, keep it */
        if (isset($oldFlashcardsList[$index]) && $oldFlashcardsList[$index]->image) {
            $imagePath = $oldFlashcardsList[$index]->image;
            $preservedImages[] = $imagePath;
            return $imagePath;
        }

        return null;
    }

    /* Delete old flashcards that aren't being kept */
    private function deleteOldFlashcards($oldFlashcards, $preservedImages)
    {
        foreach ($oldFlashcards as $oldFlashcard) {
            /* Delete the image if it's not being preserved */
            if ($oldFlashcard->image && !in_array($oldFlashcard->image, $preservedImages) && Storage::disk('public')->exists($oldFlashcard->image)) {
                Storage::disk('public')->delete($oldFlashcard->image);
            }
            $oldFlashcard->delete();
        }
    }

    /* Save all the new flashcards to the database */
    private function createFlashcards($flashcardsData)
    {
        foreach ($flashcardsData as $flashcardData) {
            Flashcard::create($flashcardData);
        }
    }

    /* Delete a learning material and all its flashcards */
    public function destroyMaterial(LearningMaterial $material)
    {
        /* Delete all flashcards and their images */
        foreach ($material->flashcards as $flashcard) {
            if ($flashcard->image && Storage::disk('public')->exists($flashcard->image)) {
                Storage::disk('public')->delete($flashcard->image);
            }
            $flashcard->delete();
        }

        /* Delete the material */
        $material->delete();

        return response()->json([
            'success' => true,
            'message' => 'Material deleted successfully',
        ]);
    }

    /* Get all learning materials for students to use */
    public function getPublicMaterials()
    {
        /* Get all materials and their flashcards */
        $materials = LearningMaterial::with('flashcards')
            ->orderBy('title')
            ->get()
            ->map(function ($material) {
                /* Add full URLs to cover images */
                if ($material->cover_image) {
                    $material->cover_image = asset('storage/' . $material->cover_image);
                }
                /* Add full URLs to flashcard images */
                if ($material->flashcards) {
                    $material->flashcards = $material->flashcards->map(function ($flashcard) {
                        if ($flashcard->image) {
                            $flashcard->image = asset('storage/' . $flashcard->image);
                        }
                        return $flashcard;
                    });
                }
                return $material;
            });

        /* Get all categories */
        $categories = LearningCategory::orderBy('name')->get();

        /* Send everything back */
        return response()->json([
            'materials' => $materials,
            'categories' => $categories,
        ]);
    }

    /* Mark that a student finished learning a material */
    public function markAsCompleted(Request $request, $materialId)
    {
        /* Make sure the student is logged in */
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not authenticated',
            ], 401);
        }

        /* Make sure the material exists */
        $material = LearningMaterial::find($materialId);

        if (!$material) {
            return response()->json([
                'success' => false,
                'message' => 'Material not found',
            ], 404);
        }

        /* Save their progress */
        $progress = UserMaterialProgress::updateOrCreate(
            [
                'user_id' => $user->id,
                'material_id' => $materialId,
            ],
            [
                'completed' => true,
                'completed_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Material marked as completed!',
            'progress' => $progress,
        ]);
    }

    /* Get report statistics about learning materials */
    public function getReportData(Request $request)
    {
        /* Check if the admin wants to filter by category */
        $category = $request->query('category', '');

        /* Get materials (filtered by category if needed) */
        $materialsQuery = LearningMaterial::with(['flashcards']);

        if ($category !== '') {
            $materialsQuery->where('category', $category);
        }

        $materials = $materialsQuery->withCount('flashcards')->get();

        /* Count how many students completed each material */
        $learnedCounts = UserMaterialProgress::where('completed', true)
            ->selectRaw('material_id, COUNT(*) as learned_count')
            ->groupBy('material_id')
            ->pluck('learned_count', 'material_id');

        /* Find which material was learned by the most students */
        $mostLearnedMaterial = null;
        $maxLearnedCount = 0;

        foreach ($materials as $material) {
            $learnedCount = $learnedCounts[$material->id] ?? 0;
            if ($learnedCount > $maxLearnedCount) {
                $maxLearnedCount = $learnedCount;
                $mostLearnedMaterial = $material;
            }
        }

        /* Prepare all the material data with flashcards */
        $materialsData = $materials->map(function ($material) use ($learnedCounts) {
            return [
                'id' => $material->id,
                'title' => $material->title,
                'category' => $material->category,
                'flashcards_count' => $material->flashcards_count,
                'learned_count' => $learnedCounts[$material->id] ?? 0,
                'flashcards' => $material->flashcards->map(function ($flashcard) {
                    return [
                        'id' => $flashcard->id,
                        'word' => $flashcard->word,
                        'description' => $flashcard->description,
                        'description_eng' => $flashcard->description_eng ?? '',
                        'image' => $flashcard->image ? asset('storage/' . $flashcard->image) : null,
                    ];
                }),
            ];
        });

        /* Send back the report data */
        return response()->json([
            'success' => true,
            'data' => [
                'category' => $category === '' ? 'All Categories' : $category,
                'total_materials' => $materials->count(),
                'most_learned_material' => $mostLearnedMaterial ? [
                    'title' => $mostLearnedMaterial->title,
                    'learned_count' => $maxLearnedCount,
                ] : null,
                'materials' => $materialsData,
            ],
        ]);
    }
}
