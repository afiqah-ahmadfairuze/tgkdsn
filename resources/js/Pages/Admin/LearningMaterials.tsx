import { Head, router } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import AdminNavigation from '@/Components/AdminNavigation';
import axios from 'axios';
import { Book, Plus, Folder, Trash2, Printer } from 'lucide-react';

interface LearningCategory {
    id: number;
    name: string;
    description?: string;
}

interface Flashcard {
    id?: number;
    material_id?: number;
    word: string;
    description: string;
    description_eng: string;
    image: string | File | null;
}

interface LearningMaterial {
    id: number;
    title: string;
    description?: string;
    category?: string;
    cover_image?: string | null;
    learning_category_id?: number;
    flashcards_count?: number;
    flashcards?: Flashcard[];
}

interface AdminPageProps {
    auth: any;
    categories: LearningCategory[];
    materials: LearningMaterial[];
}

export default function LearningMaterials({ auth, categories: initialCategories, materials: initialMaterials }: AdminPageProps) {
    const [categories, setCategories] = useState<LearningCategory[]>(initialCategories);
    const [materials, setMaterials] = useState<LearningMaterial[]>(initialMaterials);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // Report state
    const [showMaterialsReport, setShowMaterialsReport] = useState(false);
    const [reportCategory, setReportCategory] = useState('');
    const [reportData, setReportData] = useState<any>(null);
    const [reportLoading, setReportLoading] = useState(false);

    // Modals
    const [showManageCategoriesModal, setShowManageCategoriesModal] = useState(false);
    const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
    const [showFlashcardsModal, setShowFlashcardsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Selected items
    const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
    const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);

    // Category form
    const [categoryForm, setCategoryForm] = useState({ name: '' });
    const [categoryLoading, setCategoryLoading] = useState(false);

    // Material form (Step 1: Create Material container)
    const [addForm, setAddForm] = useState({
        title: '',
        description: '',
        category: '',
        cover_image: null as File | null,
    });
    const [addFormProcessing, setAddFormProcessing] = useState(false);

    // Edit Material Details form
    const [editDetailsForm, setEditDetailsForm] = useState({
        title: '',
        description: '',
        category: '',
        cover_image: null as File | string | null,
    });
    const [editDetailsProcessing, setEditDetailsProcessing] = useState(false);

    // Flashcards form (Step 2: Add flashcards to Material)
    const getEmptyFlashcard = (): Flashcard => ({
        word: '',
        description: '',
        description_eng: '',
        image: null,
    });

    const [flashcardsForm, setFlashcardsForm] = useState({
        flashcards: [getEmptyFlashcard()],
    });
    const [flashcardsFormProcessing, setFlashcardsFormProcessing] = useState(false);

    // Overview stats
    const [totalMaterialsCount, setTotalMaterialsCount] = useState(materials.length);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Can implement server-side search if needed
    };

    // Category Management
    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setCategoryLoading(true);

        try {
            const response = await axios.post(route('admin.learning-materials.categories.store'), {
                name: categoryForm.name,
            });

            if (response.data.success && response.data.category) {
                setCategories([...categories, response.data.category]);
                setCategoryForm({ name: '' });
                alert(response.data.message || 'Category created successfully!');
            }
        } catch (error: any) {
            const errors = error.response?.data?.errors || {};
            const errorMessage = Object.values(errors)[0] || 'Error creating category';
            alert('Error: ' + errorMessage);
        } finally {
            setCategoryLoading(false);
        }
    };

    const handleDeleteCategory = async (category: LearningCategory) => {
        if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
            try {
                const response = await axios.delete(route('admin.learning-materials.categories.destroy', category.id));
                if (response.data.success) {
                    setCategories(categories.filter(c => c.id !== category.id));
                    alert(response.data.message || 'Category have been deleted successfully');
                }
            } catch (error: any) {
                const errors = error.response?.data?.errors || {};
                const errorMessage = Object.values(errors)[0] || 'Error deleting category';
                alert('Error: ' + errorMessage);
            }
        }
    };

    // Material Management (Step 1: Create Material container)
    const handleOpenAddModal = () => {
        setAddForm({ title: '', description: '', category: '', cover_image: null });
        setShowAddMaterialModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddMaterialModal(false);
    };

    const handleAddSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setAddFormProcessing(true);

        try {
            const formData = new FormData();
            formData.append('title', addForm.title);
            formData.append('description', addForm.description);
            formData.append('category', addForm.category);
            if (addForm.cover_image) {
                formData.append('cover_image', addForm.cover_image);
            }

            const response = await axios.post(route('admin.learning-materials.store'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.success && response.data.material) {
                setMaterials([...materials, response.data.material]);
                setAddForm({ title: '', description: '', category: '', cover_image: null });
                handleCloseAddModal();
                alert(response.data.message || 'Material created successfully!');
            }
        } catch (error: any) {
            const errors = error.response?.data?.errors || {};
            const errorMsg = Object.values(errors).length > 0
                ? Object.values(errors)[0]
                : error.response?.data?.message || 'Failed to create material';
            alert('Error creating material: ' + errorMsg);
        } finally {
            setAddFormProcessing(false);
        }
    };

    // Flashcards Management (Step 2: Add/Edit flashcards in Material)
    const handleOpenFlashcardsModal = (material: LearningMaterial) => {
        setSelectedMaterial(material);

        // Initialize edit details form with material's current data
        setEditDetailsForm({
            title: material.title || '',
            description: material.description || '',
            category: material.category || '',
            cover_image: material.cover_image || null,
        });

        // If material already has flashcards, load them; otherwise start with empty form
        if (material.flashcards && material.flashcards.length > 0) {
            const flashcardsWithDefaults = material.flashcards.map(f => ({
                ...f,
                description_eng: f.description_eng || ''
            }));
            setFlashcardsForm({ flashcards: flashcardsWithDefaults });
        } else {
            setFlashcardsForm({ flashcards: [getEmptyFlashcard()] });
        }

        setShowFlashcardsModal(true);
    };

    const handleCloseFlashcardsModal = () => {
        setShowFlashcardsModal(false);
        setSelectedMaterial(null);
    };

    const handleAddFlashcard = () => {
        if (flashcardsForm.flashcards.length < 20) {
            setFlashcardsForm({
                flashcards: [...flashcardsForm.flashcards, getEmptyFlashcard()]
            });
        }
    };

    const handleRemoveFlashcard = (index: number) => {
        // Prevent removing the last flashcard (minimum 1 required)
        if (flashcardsForm.flashcards.length > 1) {
            setFlashcardsForm({
                flashcards: flashcardsForm.flashcards.filter((_, i) => i !== index)
            });
        }
    };

    const handleUpdateFlashcard = (index: number, field: keyof Flashcard, value: any) => {
        const flashcards = [...flashcardsForm.flashcards];
        flashcards[index] = { ...flashcards[index], [field]: value };
        setFlashcardsForm({ flashcards });
    };

    const handleFlashcardsSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (selectedMaterial) {
            setFlashcardsFormProcessing(true);

            try {
                // Step 1: Validate and save material details (title, description, category, cover_image)
                if (!editDetailsForm.title || editDetailsForm.title.trim() === '') {
                    alert('Error: Material title is required');
                    setFlashcardsFormProcessing(false);
                    return;
                }

                const detailsFormData = new FormData();
                detailsFormData.append('title', editDetailsForm.title);
                detailsFormData.append('description', editDetailsForm.description);
                detailsFormData.append('category', editDetailsForm.category);
                if (editDetailsForm.cover_image && editDetailsForm.cover_image instanceof File) {
                    detailsFormData.append('cover_image', editDetailsForm.cover_image);
                }

                const detailsResponse = await axios.post(route('admin.learning-materials.details.update', selectedMaterial.id), detailsFormData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (!detailsResponse.data.success) {
                    alert('Error saving material details: ' + detailsResponse.data.message);
                    setFlashcardsFormProcessing(false);
                    return;
                }

                // Step 2: Validate and save flashcards
                const flashcards = flashcardsForm.flashcards;

                // Ensure at least 1 flashcard
                if (!flashcards || flashcards.length === 0) {
                    alert('Error: At least 1 flashcard is required');
                    setFlashcardsFormProcessing(false);
                    return;
                }

                // Validate each flashcard has required fields
                for (let i = 0; i < flashcards.length; i++) {
                    const f = flashcards[i];

                    if (!f.word || f.word.trim() === '') {
                        alert(`Error: Flashcard ${i + 1} - Word is required`);
                        setFlashcardsFormProcessing(false);
                        return;
                    }

                    if (!f.description || f.description.trim() === '') {
                        alert(`Error: Flashcard ${i + 1} - Description (BM) is required`);
                        setFlashcardsFormProcessing(false);
                        return;
                    }

                    if (!f.image) {
                        alert(`Error: Flashcard ${i + 1} - Image is required`);
                        setFlashcardsFormProcessing(false);
                        return;
                    }
                }

                // Use FormData approach
                const formData = new FormData();
                formData.append('_method', 'PUT');

                // Serialize flashcards as JSON string
                const flashcardsData = flashcards.map(f => ({
                    word: f.word,
                    description: f.description,
                    description_eng: f.description_eng || '',
                }));

                formData.append('flashcards_json', JSON.stringify(flashcardsData));

                // Add image files if they exist
                flashcards.forEach((flashcard, index) => {
                    if (flashcard.image && flashcard.image instanceof File) {
                        formData.append(`flashcard_images[${index}]`, flashcard.image);
                    }
                });

                // Use POST with _method: PUT
                const response = await axios.post(route('admin.learning-materials.update', selectedMaterial.id), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.success) {
                    alert(response.data.message || 'Material details and flashcards saved successfully!');
                    // Reload the page to refresh materials list
                    router.get(route('admin.learning-materials.index'));
                }
            } catch (error: any) {
                console.error('Error response:', error.response?.data);
                const errorMsg = error.response?.data?.message || 'Error saving material';
                alert('Error: ' + errorMsg);
            } finally {
                setFlashcardsFormProcessing(false);
            }
        }
    };

    // Delete Material
    // Handle material selection
    const handleSelectMaterial = (materialId: number) => {
        setSelectedMaterials(prev =>
            prev.includes(materialId)
                ? prev.filter(id => id !== materialId)
                : [...prev, materialId]
        );
    };

    // Handle select all materials
    const handleSelectAllMaterials = () => {
        if (selectedMaterials.length === filteredMaterials.length && filteredMaterials.length > 0) {
            setSelectedMaterials([]);
        } else {
            setSelectedMaterials(filteredMaterials.map(m => m.id));
        }
    };

    const handleOpenDeleteModal = () => {
        if (selectedMaterials.length > 0) {
            setShowDeleteModal(true);
        }
    };

    const handleDeleteConfirm = async () => {
        if (selectedMaterials.length > 0) {
            try {
                for (const materialId of selectedMaterials) {
                    await axios.delete(route('admin.learning-materials.destroy', materialId));
                }
                setMaterials(materials.filter(m => !selectedMaterials.includes(m.id)));
                setShowDeleteModal(false);
                setSelectedMaterials([]);
                const message = selectedMaterials.length === 1
                    ? 'Material deleted successfully!'
                    : `${selectedMaterials.length} materials deleted successfully!`;
                alert(message);
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Error deleting material(s)';
                alert('Error: ' + errorMessage);
            }
        }
    };

    // Fetch report data when report modal opens or category changes
    useEffect(() => {
        if (showMaterialsReport) {
            fetchReportData();
        }
    }, [showMaterialsReport, reportCategory]);

    const fetchReportData = async () => {
        try {
            setReportLoading(true);
            const response = await axios.get(route('admin.learning-materials.report'), {
                params: { category: reportCategory }
            });

            if (response.data.success) {
                setReportData(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            alert('Error loading report data');
        } finally {
            setReportLoading(false);
        }
    };

    // Filter materials
    const filteredMaterials = materials.filter(
        (material) =>
            (material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)) &&
            (categoryFilter === '' || material.category === categoryFilter)
    );

    // Report View
    if (showMaterialsReport) {
        return (
            <>
                <Head title="Learning Materials Report - Admin Panel" />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation auth={auth} themeColor="#4CD964" />
                    </div>

                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Report Header - Hidden on Print */}
                        <div className="print:hidden mb-6 sm:mb-8">
                            <button
                                onClick={() => setShowMaterialsReport(false)}
                                className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                ← Back to Learning Materials Management
                            </button>
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    Learning Materials Report
                                </h1>

                                {/* Report Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Category:
                                        </label>
                                        <select value={reportCategory} onChange={(e) => setReportCategory(e.target.value)} className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                                            <option value="">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Print Button */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => window.print()}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-xs sm:text-sm font-medium"
                                        >
                                            🖨️ Print Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Content */}
                        {reportLoading ? (
                            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                                <p className="text-gray-600">
                                    Loading report data...
                                </p>
                            </div>
                        ) : reportData ? (
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
                                    Learning Materials Report
                                </h2>

                                {/* Category Section */}
                                <div className="mb-8">
                                    <p className="text-lg font-semibold text-gray-800 mb-2">
                                        Category: <span className="text-lg font-semibold text-gray-800">{reportData.category}</span>
                                    </p>
                                </div>

                                {/* Total Materials Section */}
                                <div className="mb-8">
                                    <p className="text-lg font-semibold text-gray-800 mb-2">
                                        Total Materials: <span className="text-lg font-semibold text-gray-800">{reportData.total_materials}</span>
                                    </p>
                                </div>

                                {/* Most Learned Material Section */}
                                <div className="mb-8">
                                    <p className="text-lg font-semibold text-gray-800 mb-2">
                                        Most Learned Material: <span className="text-lg font-semibold text-gray-800">
                                            {reportData.most_learned_material ?
                                                `${reportData.most_learned_material.title} (${reportData.most_learned_material.learned_count} times learned)`
                                                : 'N/A'}
                                        </span>
                                    </p>
                                </div>

                                {/* Overall Materials Table */}
                                <div className="mt-8">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                        Overall Materials
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border-collapse text-xs sm:text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                        Material Name
                                                    </th>
                                                    <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                        Total Cards
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reportData.materials && reportData.materials.map((material: any) => (
                                                    <tr key={material.id}>
                                                        <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{material.title}</td>
                                                        <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600 text-center">{material.flashcards_count || 0}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {(!reportData.materials || reportData.materials.length === 0) && (
                                        <p className="text-center py-6 text-gray-600">
                                            No materials found for the selected category
                                        </p>
                                    )}
                                </div>

                                {/* Individual Material Card Details Tables */}
                                {reportData.materials && reportData.materials.map((material: any) => (
                                    <div key={material.id} className="mt-10">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                            {material.title} - Card Details
                                        </h3>
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full border-collapse text-xs sm:text-sm">
                                                <thead>
                                                    <tr>
                                                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                            Word
                                                        </th>
                                                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                            Description (BM)
                                                        </th>
                                                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                            Description (ENG)
                                                        </th>
                                                        <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">
                                                            Image
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {material.flashcards && material.flashcards.length > 0 ? (
                                                        material.flashcards.map((flashcard: any, idx: number) => (
                                                            <tr key={flashcard.id || idx}>
                                                                <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{flashcard.word}</td>
                                                                <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{flashcard.description}</td>
                                                                <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{flashcard.description_eng || '—'}</td>
                                                                <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">
                                                                    {flashcard.image ? (
                                                                        <img
                                                                            src={flashcard.image}
                                                                            alt={flashcard.word}
                                                                            className="max-h-16 max-w-24 rounded border border-gray-300"
                                                                        />
                                                                    ) : (
                                                                        '—'
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-gray-600">
                                                                No flashcards available
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Learning Material - TanganakDusun" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <AdminNavigation auth={auth} themeColor="#4CD964" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Heading */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3">
                            <Book className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-green-600" />
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                Learning Materials Management
                            </h1>
                        </div>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                            Create, manage, and organize learning materials with flashcards
                        </p>
                    </div>

                    <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-5">
                        {/* Main Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-5">
                            {/* Materials Overview Card */}
                            <div>
                                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-t-4 border-green-500">
                                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                        <Book className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                            Materials Overview
                                        </h2>
                                    </div>

                                    <div className="mb-4 sm:mb-6">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Category:
                                        </label>
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                        {/* Total Materials Card */}
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Total Materials
                                            </p>
                                            <p className="text-3xl sm:text-4xl font-bold text-green-600">{filteredMaterials.length}</p>
                                        </div>

                                        {/* Total Categories Card */}
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Total Categories
                                            </p>
                                            <p className="text-3xl sm:text-4xl font-bold text-green-600">{categories.length}</p>
                                        </div>

                                        {/* Total Flashcards Card */}
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Total Flashcards
                                            </p>
                                            <p className="text-3xl sm:text-4xl font-bold text-green-600">{filteredMaterials.reduce((sum, m) => sum + (m.flashcards_count || 0), 0)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Search and Action Bar */}
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                                    {/* Search Bar */}
                                    <form onSubmit={handleSearch} className="flex-1 min-w-0">
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search by title or description..."
                                                className="w-full pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                                            />
                                        </div>
                                    </form>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
                                        <button
                                            onClick={() => setShowManageCategoriesModal(true)}
                                            disabled={selectedMaterials.length > 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <Folder className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                            <span>Manage Categories</span>
                                        </button>
                                        <button
                                            onClick={handleOpenAddModal}
                                            disabled={selectedMaterials.length > 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                            <span>Add Material</span>
                                        </button>
                                        <button
                                            onClick={() => selectedMaterials.length === 1 && handleOpenFlashcardsModal(filteredMaterials.find(m => m.id === selectedMaterials[0])!)}
                                            disabled={selectedMaterials.length !== 1}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <span>Edit Material</span>
                                        </button>
                                        <button
                                            onClick={handleOpenDeleteModal}
                                            disabled={selectedMaterials.length === 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                            <span className="hidden sm:inline">Delete {selectedMaterials.length > 0 && `(${selectedMaterials.length})`}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Materials Table */}
                            {filteredMaterials.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                                        Not found
                                    </h3>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[600px]">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-green-600 text-white sticky top-0">
                                                <tr>
                                                    <th className="px-1 sm:px-2 py-1 sm:py-2 text-left whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedMaterials.length === filteredMaterials.length && filteredMaterials.length > 0}
                                                            ref={el => {
                                                                if (el) {
                                                                    el.indeterminate = selectedMaterials.length > 0 && selectedMaterials.length < filteredMaterials.length;
                                                                }
                                                            }}
                                                            onChange={handleSelectAllMaterials}
                                                            disabled={filteredMaterials.length === 0}
                                                            className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3 sm:w-4 sm:h-4 disabled:cursor-not-allowed"
                                                        />
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Title
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Category
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Flashcards
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredMaterials.map((material, idx) => (
                                                    <tr key={material.id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition`}>
                                                        <td className="px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedMaterials.includes(material.id)}
                                                                onChange={() => handleSelectMaterial(material.id)}
                                                                className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3 sm:w-4 sm:h-4"
                                                            />
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 font-medium whitespace-nowrap max-w-xs truncate">
                                                            {material.title}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                            {material.category ? (
                                                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-800">
                                                                    {material.category}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap text-center">
                                                            {material.flashcards_count || 0}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="w-full lg:w-72 lg:sticky lg:top-8 h-fit flex-shrink-0">
                            {/* About & Tips */}
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-4 sm:p-6 border border-green-100 mb-3">
                                <div className="space-y-4">
                                    {/* About Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                                            About
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                            Create and manage learning materials with flashcards. Each material can contain up to 20 flashcards with words, descriptions, and images to enhance learning.
                                        </p>
                                    </div>

                                    {/* Tips Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                                            Tips
                                        </h3>
                                        <ul className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2 list-disc list-inside">
                                            <li>Organize materials by categories</li>
                                            <li>Add up to 20 flashcards per material</li>
                                            <li>Include clear descriptions</li>
                                            <li>Upload images for visual learning</li>
                                            <li>Edit or delete materials anytime</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* View & Print Report Card */}
                            <button
                                onClick={() => setShowMaterialsReport(true)}
                                className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Printer className="h-10 w-10 text-green-600" />
                                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                        Print Report
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    View & Print Learning Materials Report
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Filter by category and print a detailed report of all materials with flashcard details
                                </p>
                                <div className="flex items-center text-green-600 font-medium text-sm hover:text-green-700">
                                    View Report →
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 1: Create Material Modal */}
            {showAddMaterialModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Create New Material
                            </h2>
                            <button onClick={handleCloseAddModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Material Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={addForm.title}
                                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter material title"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={addForm.description}
                                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    placeholder="Enter material description"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={addForm.category}
                                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-1">
                                    Cover Image
                                </label>
                                {addForm.cover_image && (
                                    <div className="mb-2">
                                        <img
                                            src={URL.createObjectURL(addForm.cover_image)}
                                            alt="Cover preview"
                                            className="max-h-32 rounded-md border border-gray-300"
                                        />
                                    </div>
                                )}
                                <input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setAddForm({ ...addForm, cover_image: file });
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Max file size: 2MB. Supported formats: JPG, PNG, GIF
                                </p>
                            </div>

                            <p className="text-xs text-gray-500 italic">
                                Note: You'll add flashcards in the next step.
                            </p>

                            <div className="flex gap-3 justify-end pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseAddModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addFormProcessing}
                                    className="px-4 py-2 text-sm font-medium rounded-md hover:opacity-90 transition bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {addFormProcessing ? 'Creating...' : 'Create Material'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Step 2: Add Flashcards & Edit Details Modal */}
            {showFlashcardsModal && selectedMaterial && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Edit Material Details & Flashcards
                            </h2>
                            <button onClick={handleCloseFlashcardsModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleFlashcardsSubmit} className="p-6 space-y-6">
                            {/* Edit Material Details Section */}
                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Material Details
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Material Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={editDetailsForm.title}
                                        onChange={(e) => setEditDetailsForm({ ...editDetailsForm, title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter material title"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={editDetailsForm.description}
                                        onChange={(e) => setEditDetailsForm({ ...editDetailsForm, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter material description"
                                        rows={2}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={editDetailsForm.category}
                                        onChange={(e) => setEditDetailsForm({ ...editDetailsForm, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cover Image
                                    </label>
                                    {editDetailsForm.cover_image && typeof editDetailsForm.cover_image === 'string' && (
                                        <div className="mb-2">
                                            <img
                                                src={editDetailsForm.cover_image}
                                                alt="Cover preview"
                                                className="max-h-32 rounded-md border border-gray-300"
                                            />
                                        </div>
                                    )}
                                    {editDetailsForm.cover_image && editDetailsForm.cover_image instanceof File && (
                                        <div className="mb-2">
                                            <img
                                                src={URL.createObjectURL(editDetailsForm.cover_image)}
                                                alt="Cover preview"
                                                className="max-h-32 rounded-md border border-gray-300"
                                            />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setEditDetailsForm({ ...editDetailsForm, cover_image: file });
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Max file size: 2MB. Supported formats: JPG, PNG, GIF
                                    </p>
                                </div>
                            </div>

                            {/* Flashcards Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Flashcards ({flashcardsForm.flashcards.length}/20)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddFlashcard}
                                        disabled={flashcardsForm.flashcards.length >= 20}
                                        className="px-3 py-1 text-black rounded text-sm transition disabled:bg-gray-300"
                                        style={{ backgroundColor: flashcardsForm.flashcards.length >= 20 ? '#D1D5DB' : '#4CD964' }}
                                    >
                                        + Add Flashcard
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 italic">
                                    Minimum 1 flashcard required. You can add up to 20 flashcards total.
                                </p>
                            </div>

                            {/* Flashcards */}
                            <div className="space-y-4">
                                {flashcardsForm.flashcards.map((flashcard, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-medium text-gray-900">
                                                Flashcard {index + 1}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveFlashcard(index)}
                                                disabled={flashcardsForm.flashcards.length === 1}
                                                className={`px-2 py-1 text-white rounded text-sm transition ${
                                                    flashcardsForm.flashcards.length === 1
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700'
                                                }`}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        {/* Word */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Word <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={flashcard.word}
                                                onChange={(e) => handleUpdateFlashcard(index, 'word', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="Enter word"
                                                required
                                            />
                                        </div>

                                        {/* Description (BM) */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Description (BM) <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                value={flashcard.description}
                                                onChange={(e) => handleUpdateFlashcard(index, 'description', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="Enter description in Bahasa Malaysia"
                                                rows={2}
                                                required
                                            />
                                        </div>

                                        {/* Description (ENG) */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Description (ENG) <span className="text-gray-500 text-xs">(Optional)</span>
                                            </label>
                                            <textarea
                                                value={flashcard.description_eng || ''}
                                                onChange={(e) => handleUpdateFlashcard(index, 'description_eng', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="Enter description in English"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Image */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Image <span className="text-red-500">*</span>
                                                {flashcard.image && typeof flashcard.image === 'string' && (
                                                    <span className="text-xs text-gray-500 ml-2">
                                                        (Change image if needed)
                                                    </span>
                                                )}
                                            </label>

                                            {/* Image Preview */}
                                            {flashcard.image && (
                                                <div className="mb-2">
                                                    {typeof flashcard.image === 'string' ? (
                                                        <img
                                                            src={flashcard.image}
                                                            alt="Flashcard preview"
                                                            className="max-h-32 rounded-md border border-gray-300"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={URL.createObjectURL(flashcard.image)}
                                                            alt="Flashcard preview"
                                                            className="max-h-32 rounded-md border border-gray-300"
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        handleUpdateFlashcard(index, 'image', file);
                                                    }
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                {flashcard.image && typeof flashcard.image === 'string'
                                                    ? 'Upload a new image to replace the current one'
                                                    : 'Max file size: 2MB. Supported formats: JPG, PNG, GIF'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 justify-end pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseFlashcardsModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={flashcardsFormProcessing}
                                    className="px-4 py-2 text-sm font-medium rounded-md hover:opacity-90 transition bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {flashcardsFormProcessing ? 'Saving...' : 'Save All Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedMaterials.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 text-center">
                                Delete Material
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 text-center">
                                {selectedMaterials.length === 1
                                    ? 'Are you sure you want to delete 1 material? This cannot be undone.'
                                    : `Are you sure you want to delete ${selectedMaterials.length} materials? This cannot be undone.`}
                            </p>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Categories Modal */}
            {showManageCategoriesModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Manage Categories
                            </h2>
                            <button
                                onClick={() => setShowManageCategoriesModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Create Category Form */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Create New Category
                                </h3>
                                <form onSubmit={handleCreateCategory} className="space-y-3">
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Category Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="category-name"
                                                type="text"
                                                value={categoryForm.name}
                                                onChange={(e) => setCategoryForm({ name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                                placeholder="Enter category name"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={categoryLoading}
                                            className="px-4 py-2 font-medium rounded-md hover:opacity-90 transition disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 whitespace-nowrap"
                                        >
                                            {categoryLoading ? 'Creating...' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Categories List */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Available Categories
                                </h3>
                                {categories.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                                                        Category Name
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {categories.map((cat) => (
                                                    <tr key={cat.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{cat.name}</td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <button
                                                                onClick={() => handleDeleteCategory(cat)}
                                                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        No categories available. Create one to get started!
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
                            <button
                                onClick={() => setShowManageCategoriesModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
