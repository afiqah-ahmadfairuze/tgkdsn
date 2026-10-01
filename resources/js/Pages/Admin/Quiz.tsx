import { Head, router } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import AdminNavigation from '@/Components/AdminNavigation';
import InputError from '@/Components/InputError';
import ReportViewer from '@/Components/ReportViewer';
import axios from 'axios';
import { BookOpen, Plus, Folder, Trash2, Printer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Category {
    id: number;
    name: string;
}

interface QuizQuestion {
    id?: number;
    quiz_id?: number;
    question_bm: string;
    question_eng: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: 'A' | 'B' | 'C' | 'D';
    marks: number;
    question_image?: string | File | null;
}

interface Quiz {
    id: number;
    title: string;
    description?: string;
    category?: string;
    total_marks: number;
    questions_count?: number;
    questions?: QuizQuestion[];
    total_attempts?: number;
    cover_image?: string | null;
}

interface QuizProps {
    quizzes: Quiz[];
    search: string;
    categories: Category[];
}

export default function Quiz({ quizzes: initialQuizzes, categories: initialCategories }: QuizProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [quizzes, setQuizzes] = useState<Quiz[]>(initialQuizzes);
    const [categories, setCategories] = useState<Category[]>(initialCategories);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQuestionsModal, setShowQuestionsModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
    const [selectedQuizzes, setSelectedQuizzes] = useState<number[]>([]);
    const [categoryLoading, setCategoryLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [showCategoryDeleteModal, setShowCategoryDeleteModal] = useState(false);

    // Quiz Overview state
    const [totalQuizCount, setTotalQuizCount] = useState(0);
    const [mostAttemptedQuiz, setMostAttemptedQuiz] = useState<Quiz | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);

    // Report state
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    // Print Report state
    const [showQuizPrintReport, setShowQuizPrintReport] = useState(false);
    const [printReportCategory, setPrintReportCategory] = useState('');

    // Form for creating new category
    const [categoryForm, setCategoryForm] = useState({
        name: '',
    });

    // Fetch quiz overview on mount and when category filter changes
    useEffect(() => {
        fetchQuizOverview();
    }, [categoryFilter, quizzes]);

    const fetchQuizOverview = async () => {
        try {
            setOverviewLoading(true);

            // Filter quizzes by category if selected
            const filtered = categoryFilter === ''
                ? quizzes
                : quizzes.filter(q => q.category === categoryFilter);

            // Calculate total quiz count
            setTotalQuizCount(filtered.length);

            // Find most attempted quiz overall (not filtered by category)
            const mostAttempted = quizzes.reduce((prev, current) =>
                ((prev.total_attempts || 0) > (current.total_attempts || 0)) ? prev : current
            , quizzes[0] || null);
            setMostAttemptedQuiz(mostAttempted);
        } catch (error) {
            console.error('Error fetching quiz overview:', error);
        } finally {
            setOverviewLoading(false);
        }
    };

    // Fetch categories on mount and when modal opens
    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (showCategoryModal) {
            fetchCategories();
        }
    }, [showCategoryModal]);

    const fetchCategories = async () => {
        try {
            setCategoryLoading(true);
            const response = await axios.get(route('admin.categories.index'));
            if (response.data.success) {
                setCategories(response.data.categories);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoryLoading(false);
        }
    };

    // Helper function to create empty question object
    const getEmptyQuestion = (): QuizQuestion => ({
        question_bm: '',
        question_eng: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A',
        marks: 1,
        question_image: null,
    });

    // Form for creating new quiz
    const [addForm, setAddForm] = useState({
        title: '',
        description: '',
        category: '',
        cover_image: null as File | null,
    });
    const [addFormErrors, setAddFormErrors] = useState<any>({});
    const [addFormProcessing, setAddFormProcessing] = useState(false);

    // Form for editing quiz details
    const [editDetailsForm, setEditDetailsForm] = useState({
        title: '',
        description: '',
        category: '',
        cover_image: null as File | null,
    });
    const [editDetailsFormErrors, setEditDetailsFormErrors] = useState<any>({});
    const [editDetailsFormProcessing, setEditDetailsFormProcessing] = useState(false);
    const [editDetailsPreviewImage, setEditDetailsPreviewImage] = useState<string | null>(null);

    // Form for adding questions
    const [questionsForm, setQuestionsForm] = useState({
        questions: [getEmptyQuestion()],
    });
    const [questionsFormErrors, setQuestionsFormErrors] = useState<any>({});
    const [questionsFormProcessing, setQuestionsFormProcessing] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.quiz.index'), { search: searchQuery });
    };

    const handleOpenAddModal = () => {
        setAddForm({ title: '', description: '', category: '', cover_image: null });
        setAddFormErrors({});
        setShowAddModal(true);
    };

    const handleCloseAddModal = () => {
        setShowAddModal(false);
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

            const response = await axios.post(route('admin.quiz.store'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.success && response.data.quiz) {
                // Optimistically add the new quiz to state
                setQuizzes([...quizzes, response.data.quiz]);
                setAddForm({ title: '', description: '', category: '', cover_image: null });
                setAddFormErrors({});
                handleCloseAddModal();
                alert(response.data.message || 'Quiz created successfully!');
            }
        } catch (error: any) {
            const errors = error.response?.data?.errors || {};
            setAddFormErrors(errors);
            console.error('Form errors:', error.response?.data);
            const errorMsg = Object.values(errors).length > 0
                ? Object.values(errors)[0]
                : error.response?.data?.message || 'Failed to create quiz';
            alert('Error creating quiz: ' + errorMsg);
        } finally {
            setAddFormProcessing(false);
        }
    };

    const handleCloseEditDetailsModal = () => {
        setEditDetailsForm({ title: '', description: '', category: '', cover_image: null });
        setEditDetailsFormErrors({});
        setEditDetailsPreviewImage(null);
    };

    const handleEditDetailsSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (selectedQuiz) {
            setEditDetailsFormProcessing(true);

            try {
                const formData = new FormData();
                formData.append('title', editDetailsForm.title);
                formData.append('description', editDetailsForm.description);
                formData.append('category', editDetailsForm.category);
                if (editDetailsForm.cover_image) {
                    formData.append('cover_image', editDetailsForm.cover_image);
                }

                const response = await axios.post(
                    route('admin.quiz.details.update', selectedQuiz.id),
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                if (response.data.success) {
                    // Update quiz in state
                    const updatedQuizzes = quizzes.map(q =>
                        q.id === selectedQuiz.id
                            ? {
                                ...q,
                                title: response.data.quiz.title,
                                description: response.data.quiz.description,
                                category: response.data.quiz.category,
                                cover_image: response.data.quiz.cover_image,
                            }
                            : q
                    );
                    setQuizzes(updatedQuizzes);
                    handleCloseEditDetailsModal();
                    alert(response.data.message || 'Quiz details updated successfully!');
                }
            } catch (error: any) {
                const errors = error.response?.data?.errors || {};
                setEditDetailsFormErrors(errors);
                console.error('Form errors:', error.response?.data);
                const errorMsg = Object.values(errors).length > 0
                    ? Object.values(errors)[0]
                    : error.response?.data?.message || 'Failed to update quiz';
                alert('Error: ' + errorMsg);
            } finally {
                setEditDetailsFormProcessing(false);
            }
        }
    };

    const handleOpenQuestionsModal = (quiz: Quiz) => {
        setSelectedQuiz(quiz);
        setQuestionsFormErrors({});

        // Initialize edit details form with current quiz data
        setEditDetailsForm({
            title: quiz.title,
            description: quiz.description || '',
            category: quiz.category || '',
            cover_image: null,
        });
        setEditDetailsFormErrors({});
        setEditDetailsPreviewImage(quiz.cover_image || null);

        // If quiz already has questions, load them; otherwise start with empty form
        if (quiz.questions && quiz.questions.length > 0) {
            // Ensure all marks are converted to numbers (in case they come as strings from server)
            const normalizedQuestions = quiz.questions.map(q => ({
                ...q,
                marks: typeof q.marks === 'string' ? parseInt(q.marks, 10) : q.marks,
            }));
            setQuestionsForm({ questions: normalizedQuestions });
        } else {
            setQuestionsForm({ questions: [getEmptyQuestion()] });
        }

        setShowQuestionsModal(true);
    };

    const handleCloseQuestionsModal = () => {
        setShowQuestionsModal(false);
        setSelectedQuiz(null);
        setEditDetailsForm({ title: '', description: '', category: '', cover_image: null });
        setEditDetailsPreviewImage(null);
    };

    const handleAddQuestion = () => {
        if (questionsForm.questions.length < 20) {
            setQuestionsForm({
                questions: [...questionsForm.questions, getEmptyQuestion()]
            });
        }
    };

    const handleRemoveQuestion = (index: number) => {
        // Prevent removing the last question (minimum 1 required)
        if (questionsForm.questions.length > 1) {
            setQuestionsForm({
                questions: questionsForm.questions.filter((_, i) => i !== index)
            });
        }
    };

    const handleUpdateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
        const questions = [...questionsForm.questions];
        questions[index] = { ...questions[index], [field]: value };
        setQuestionsForm({ questions });
    };

    const handleQuestionsSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (selectedQuiz) {
            setQuestionsFormProcessing(true);

            try {
                // First, save quiz details if they've been modified
                try {
                    const detailsFormData = new FormData();
                    detailsFormData.append('title', editDetailsForm.title);
                    detailsFormData.append('description', editDetailsForm.description);
                    detailsFormData.append('category', editDetailsForm.category);
                    if (editDetailsForm.cover_image) {
                        detailsFormData.append('cover_image', editDetailsForm.cover_image);
                    }

                    await axios.post(
                        route('admin.quiz.details.update', selectedQuiz.id),
                        detailsFormData,
                        {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );
                    console.log('Quiz details saved successfully');
                } catch (detailsError: any) {
                    console.error('Error saving quiz details:', detailsError.response?.data);
                    const detailsErrors = detailsError.response?.data?.errors || {};
                    setEditDetailsFormErrors(detailsErrors);

                    const errorMsg = detailsError.response?.data?.message || 'Failed to save quiz details';
                    alert('Error saving details: ' + errorMsg);
                    setQuestionsFormProcessing(false);
                    return;
                }

                // Client-side validation for questions
                const questions = questionsForm.questions;

                // Ensure at least 1 question
                if (!questions || questions.length === 0) {
                    alert('Error: At least 1 question is required');
                    setQuestionsFormProcessing(false);
                    return;
                }

                // Validate each question has required fields and proper data types
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];

                    if (!q.question_bm || q.question_bm.trim() === '') {
                        alert(`Error: Question ${i + 1} - Question (BM) is required`);
                        setQuestionsFormProcessing(false);
                        return;
                    }

                    if (!q.question_eng || q.question_eng.trim() === '') {
                        alert(`Error: Question ${i + 1} - Question (ENG) is required`);
                        setQuestionsFormProcessing(false);
                        return;
                    }

                    if (!q.option_a || q.option_a.trim() === '') {
                        alert(`Error: Question ${i + 1} - Option A is required`);
                        setQuestionsFormProcessing(false);
                        return;
                    }

                    if (!q.option_b || q.option_b.trim() === '') {
                        alert(`Error: Question ${i + 1} - Option B is required`);
                        setQuestionsFormProcessing(false);
                        return;
                    }

                    if (!q.option_c || q.option_c.trim() === '') {
                        alert(`Error: Question ${i + 1} - Option C is required`);
                        setQuestionsFormProcessing(false);
                        return;
                    }

                    if (!q.option_d || q.option_d.trim() === '') {
                        alert(`Error: Question ${i + 1} - Option D is required`);
                        setQuestionsFormProcessing(false);
                        return;
                    }

                    if (!q.correct_answer || !['A', 'B', 'C', 'D'].includes(q.correct_answer)) {
                        alert(`Error: Question ${i + 1} - Correct answer must be A, B, C, or D`);
                        setQuestionsFormProcessing(false);
                        return;
                    }

                    // Ensure marks is a valid positive integer
                    const marksValue = parseInt(q.marks.toString(), 10);
                    if (isNaN(marksValue) || marksValue < 1) {
                        alert(`Error: Question ${i + 1} - Marks must be a positive number (minimum 1)`);
                        setQuestionsFormProcessing(false);
                        return;
                    }
                }

                // Now save questions
                const formData = new FormData();

                // Add _method for FormData PUT request (Laravel convention)
                formData.append('_method', 'PUT');

                // Serialize questions as JSON string in FormData
                const questionsData = questions.map(q => ({
                    question_bm: q.question_bm,
                    question_eng: q.question_eng,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    option_d: q.option_d,
                    correct_answer: q.correct_answer,
                    marks: parseInt(q.marks.toString(), 10),
                    existing_image: (q.question_image && typeof q.question_image === 'string') ? q.question_image : null,
                }));

                formData.append('questions_json', JSON.stringify(questionsData));

                // Add image files if they exist
                questions.forEach((question, index) => {
                    if (question.question_image && question.question_image instanceof File) {
                        formData.append(`question_images[${index}]`, question.question_image);
                    }
                });

                console.log('Submitting questions to quiz:', selectedQuiz.id);
                console.log('FormData questions_json:', questionsData);

                // Use POST with _method: PUT (like Dictionary does)
                const response = await axios.post(route('admin.quiz.update', selectedQuiz.id), formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (response.data.success) {
                    alert('Quiz details and questions saved successfully!');
                    // Reload the page to refresh quiz list (like Dictionary does)
                    router.get(route('admin.quiz.index'));
                }
            } catch (error: any) {
                console.error('Error response:', error.response?.data);
                const errors = error.response?.data?.errors || {};
                const errorMsg = error.response?.data?.message || '';

                setQuestionsFormErrors(errors);

                let errorMessage = 'Error saving questions';
                if (errorMsg) {
                    errorMessage = errorMsg;
                } else if (Object.keys(errors).length > 0) {
                    const errorList = Object.entries(errors).map(([key, value]: [string, any]) => {
                        return Array.isArray(value) ? value.join(', ') : value;
                    }).join('; ');
                    errorMessage = errorList || 'Validation error occurred';
                }

                alert('Error: ' + errorMessage);
            } finally {
                setQuestionsFormProcessing(false);
            }
        }
    };

    // Handle checkbox selection
    const handleSelectQuiz = (quizId: number) => {
        setSelectedQuizzes(prev =>
            prev.includes(quizId)
                ? prev.filter(id => id !== quizId)
                : [...prev, quizId]
        );
    };

    // Handle select all checkbox
    const handleSelectAll = () => {
        if (selectedQuizzes.length === filteredQuizzes.length && filteredQuizzes.length > 0) {
            // Deselect all
            setSelectedQuizzes([]);
        } else {
            // Select all
            setSelectedQuizzes(filteredQuizzes.map(q => q.id));
        }
    };

    // Handle delete for multiple quizzes
    const handleDeleteConfirm = async () => {
        if (selectedQuizzes.length > 0) {
            try {
                // Delete quizzes one by one
                for (const quizId of selectedQuizzes) {
                    await axios.delete(route('admin.quiz.destroy', quizId));
                }
                // Optimistically remove quizzes from state
                setQuizzes(quizzes.filter(q => !selectedQuizzes.includes(q.id)));
                setShowDeleteModal(false);
                setSelectedQuizzes([]);
                const message = selectedQuizzes.length === 1
                    ? 'Quiz deleted successfully!'
                    : `${selectedQuizzes.length} quizzes deleted successfully!`;
                alert(message);
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'Error deleting quiz(zes)';
                alert('Error: ' + errorMessage);
            }
        }
    };

    const handleOpenDeleteModal = () => {
        if (selectedQuizzes.length > 0) {
            setShowDeleteModal(true);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setCategoryLoading(true);

        try {
            const response = await axios.post(route('admin.categories.store'), {
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

    const handleDeleteCategory = async (category: Category) => {
        if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
            try {
                const response = await axios.delete(route('admin.categories.destroy', category.id));
                if (response.data.success) {
                    setCategories(categories.filter(c => c.id !== category.id));
                    setShowCategoryDeleteModal(false);
                    setSelectedCategory(null);
                    alert(response.data.message || 'Category deleted successfully!');
                }
            } catch (error: any) {
                const errors = error.response?.data?.errors || {};
                const errorMessage = Object.values(errors)[0] || 'Error deleting category';
                alert('Error: ' + errorMessage);
            }
        }
    };

    const filteredQuizzes = quizzes.filter(
        (quiz) =>
            (quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (quiz.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)) &&
            (categoryFilter === '' || quiz.category === categoryFilter)
    );

    // Get quizzes for print report based on selected category
    const getPrintReportQuizzes = () => {
        return printReportCategory === ''
            ? quizzes
            : quizzes.filter(q => q.category === printReportCategory);
    };

    const printReportQuizzes = getPrintReportQuizzes();

    // Get most attempted quiz in the selected category
    const getMostAttemptedQuizInCategory = () => {
        if (printReportQuizzes.length === 0) return null;
        return printReportQuizzes.reduce((prev, current) =>
            ((prev.total_attempts || 0) > (current.total_attempts || 0)) ? prev : current
        );
    };

    const mostAttemptedQuizInCategory = getMostAttemptedQuizInCategory();

    // Get chart data for quiz attempt distribution
    const getQuizChartData = () => {
        return printReportQuizzes.map(quiz => ({
            name: quiz.title,
            attempts: quiz.total_attempts || 0,
        }));
    };

    const quizChartData = getQuizChartData();

    // Show print report if requested
    if (showQuizPrintReport) {
        return (
            <>
                <Head title="Quiz Report - Admin Panel" />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation themeColor="#FFD93D" />
                    </div>

                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Report Header - Hidden on Print */}
                        <div className="print:hidden mb-6 sm:mb-8">
                            <button
                                onClick={() => setShowQuizPrintReport(false)}
                                className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                ← Back to Quiz Management
                            </button>
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Quiz Report</h1>

                                {/* Report Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Category:</label>
                                        <select value={printReportCategory} onChange={(e) => setPrintReportCategory(e.target.value)} className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500">
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
                                            className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-xs sm:text-sm font-medium"
                                        >
                                            🖨️ Print Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Quiz Report</h2>

                            {/* Category Section */}
                            <div className="mb-8">
                                <p className="text-lg font-semibold text-gray-800 mb-2">
                                    Category: <span className="text-lg font-semibold text-gray-800">{printReportCategory === '' ? 'All Categories' : printReportCategory}</span>
                                </p>
                            </div>

                            {/* Total Quizzes Section */}
                            <div className="mb-8">
                                <p className="text-lg font-semibold text-gray-800 mb-2">
                                    Total Quizzes: <span className="text-lg font-semibold text-gray-800">{printReportQuizzes.length}</span>
                                </p>
                            </div>

                            {/* Most Attempted Quiz Section */}
                            <div className="mb-8">
                                <p className="text-lg font-semibold text-gray-800 mb-2">
                                    Most Quiz Attempted: <span className="text-lg font-semibold text-gray-800">{mostAttemptedQuizInCategory?.title || 'N/A'} ({mostAttemptedQuizInCategory?.total_attempts || 0} attempts)</span>
                                </p>
                            </div>

                            {/* Chart Section */}
                            <div className="mt-10 mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quiz Attempts Distribution</h3>
                                <div className="w-full h-80 bg-gray-50 rounded-lg p-4">
                                    {quizChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={quizChartData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="name"
                                                    tick={{ fill: '#4B5563', fontSize: 12 }}
                                                    axisLine={{ stroke: '#D1D5DB' }}
                                                />
                                                <YAxis
                                                    tick={{ fill: '#4B5563', fontSize: 12 }}
                                                    axisLine={{ stroke: '#D1D5DB' }}
                                                    label={{ value: 'Number of Attempts', angle: -90, position: 'insideLeft' }}
                                                />
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#F9FAFB', border: '1px solid #D1D5DB' }}
                                                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                                                />
                                                <Bar dataKey="attempts" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex items-center justify-center h-full">
                                            <p className="text-gray-500">No quiz data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Overall Quizzes Table */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Quizzes</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse text-xs sm:text-sm">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Quiz Name</th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Total Questions</th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Total Marks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {printReportQuizzes.map((quiz) => (
                                                <tr key={quiz.id}>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{quiz.title}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600 text-center">{quiz.questions_count || 0}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600 text-center">{quiz.total_marks}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {printReportQuizzes.length === 0 && (
                                    <p className="text-center py-6 text-gray-600">Not found</p>
                                )}
                            </div>

                            {/* Individual Quiz Details Tables */}
                            {printReportQuizzes.map((quiz) => (
                                <div key={quiz.id} className="mt-10">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{quiz.title} Details</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full border-collapse text-xs sm:text-sm">
                                            <thead>
                                                <tr>
                                                    <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Question</th>
                                                    <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Image</th>
                                                    <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Option A</th>
                                                    <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Option B</th>
                                                    <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Option C</th>
                                                    <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Option D</th>
                                                    <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Correct Answer</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {quiz.questions && quiz.questions.length > 0 ? (
                                                    quiz.questions.map((question, idx) => (
                                                        <tr key={question.id || idx}>
                                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">
                                                                <div className="font-medium">{question.question_bm}</div>
                                                                <div className="text-xs text-gray-500 italic mt-1">{question.question_eng}</div>
                                                            </td>
                                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">
                                                                {question.question_image ? (
                                                                    <img
                                                                        src={typeof question.question_image === 'string' ? question.question_image : URL.createObjectURL(question.question_image)}
                                                                        alt="Question"
                                                                        className="max-h-16 max-w-24 rounded border border-gray-300"
                                                                    />
                                                                ) : (
                                                                    '—'
                                                                )}
                                                            </td>
                                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{question.option_a}</td>
                                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{question.option_b}</td>
                                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{question.option_c}</td>
                                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{question.option_d}</td>
                                                            <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600 font-medium">{question.correct_answer}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={7} className="border border-gray-300 px-2 sm:px-3 py-2 text-center text-gray-600">No questions available</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}

                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show report viewer if a report is selected
    if (selectedReport) {
        return (
            <>
                <Head title="Quiz Management - TanganakDusun" />
                <div className="min-h-screen bg-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation themeColor="#FFD93D" />
                    </div>
                    <ReportViewer
                        reportType={selectedReport}
                        onBack={() => setSelectedReport(null)}
                    />
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Quiz - TanganakDusun" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <AdminNavigation themeColor="#FFD93D" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Heading */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-yellow-600" />
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                Quiz Management
                            </h1>
                        </div>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                            Create, manage, and organize quiz content for learners
                        </p>
                    </div>

                    <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-5">
                        {/* Main Content */}
                        <div className="flex-1 min-w-0 flex flex-col gap-5">
                            {/* Quiz Overview Card */}
                            <div>
                                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-t-4 border-yellow-500">
                                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                        <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                            Quiz Overview
                                        </h2>
                                    </div>

                                    <div className="mb-4 sm:mb-6">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Category:
                                        </label>
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                                        {/* Total Quizzes Card */}
                                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 sm:p-4 border border-yellow-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Total Quizzes
                                            </p>
                                            {overviewLoading ? (
                                                <div className="h-8 sm:h-10 bg-blue-200 rounded animate-pulse"></div>
                                            ) : (
                                                <p className="text-3xl sm:text-4xl font-bold text-yellow-600">{totalQuizCount}</p>
                                            )}
                                        </div>

                                        {/* Most Attempted Quiz Card */}
                                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 sm:p-4 border border-yellow-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Most Attempted
                                            </p>
                                            {overviewLoading ? (
                                                <div className="space-y-1">
                                                    <div className="h-4 bg-blue-200 rounded animate-pulse"></div>
                                                    <div className="h-3 bg-blue-200 rounded animate-pulse w-3/4"></div>
                                                </div>
                                            ) : mostAttemptedQuiz ? (
                                                <div className="space-y-1">
                                                    <p className="text-sm sm:text-base font-semibold text-yellow-600 truncate">{mostAttemptedQuiz.title}</p>
                                                    <p className="text-xs text-gray-600 line-clamp-1">
                                                        {mostAttemptedQuiz.total_attempts || 0} attempts
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-xs sm:text-sm text-gray-600">
                                                    No data
                                                </p>
                                            )}
                                        </div>

                                        {/* Total Categories Card */}
                                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 sm:p-4 border border-yellow-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Total Categories
                                            </p>
                                            {overviewLoading ? (
                                                <div className="h-8 sm:h-10 bg-blue-200 rounded animate-pulse"></div>
                                            ) : (
                                                <p className="text-3xl sm:text-4xl font-bold text-yellow-600">{categories.length}</p>
                                            )}
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
                                                className="w-full pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                                            />
                                        </div>
                                    </form>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
                                        <button
                                            onClick={() => setShowCategoryModal(true)}
                                            disabled={selectedQuizzes.length > 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedQuizzes.length > 0 ? "Deselect quizzes to manage categories" : "Manage quiz categories"}
                                        >
                                            <Folder className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                            <span>Manage Category</span>
                                        </button>
                                        <button
                                            onClick={handleOpenAddModal}
                                            disabled={selectedQuizzes.length > 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedQuizzes.length > 0 ? "Deselect quizzes to create a new one" : "Create a new quiz"}
                                        >
                                            <Plus className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                            <span>Create Quiz</span>
                                        </button>
                                        <button
                                            onClick={() => selectedQuizzes.length === 1 && handleOpenQuestionsModal(quizzes.find(q => q.id === selectedQuizzes[0])!)}
                                            disabled={selectedQuizzes.length !== 1}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedQuizzes.length === 1 ? "Edit selected quiz" : selectedQuizzes.length === 0 ? "Select one quiz to edit" : "Select only one quiz to edit"}
                                        >
                                            <span>Edit Quiz</span>
                                        </button>
                                        <button
                                            onClick={handleOpenDeleteModal}
                                            disabled={selectedQuizzes.length === 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedQuizzes.length > 0 ? `Delete ${selectedQuizzes.length} selected quiz(zes)` : "Select at least one quiz to delete"}
                                        >
                                            <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                            <span className="hidden sm:inline">Delete {selectedQuizzes.length > 0 && `(${selectedQuizzes.length})`}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Quizzes Table */}
                            {filteredQuizzes.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900">Not found</h3>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[600px]">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-yellow-600 text-white sticky top-0">
                                                <tr>
                                                    <th className="px-1 sm:px-2 py-1 sm:py-2 text-left whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedQuizzes.length === filteredQuizzes.length && filteredQuizzes.length > 0}
                                                            ref={el => {
                                                                if (el) {
                                                                    el.indeterminate = selectedQuizzes.length > 0 && selectedQuizzes.length < filteredQuizzes.length;
                                                                }
                                                            }}
                                                            onChange={handleSelectAll}
                                                            disabled={filteredQuizzes.length === 0}
                                                            className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 w-3 h-3 sm:w-4 sm:h-4 disabled:cursor-not-allowed"
                                                            title={filteredQuizzes.length === 0 ? "No quizzes to select" : "Select all quizzes"}
                                                        />
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Title</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Category</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Questions</th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">Total Marks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredQuizzes.map((quiz, idx) => (
                                                    <tr key={quiz.id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-yellow-50 transition`}>
                                                        <td className="px-1 sm:px-2 py-1 sm:py-2 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedQuizzes.includes(quiz.id)}
                                                                onChange={() => handleSelectQuiz(quiz.id)}
                                                                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500 w-3 h-3 sm:w-4 sm:h-4"
                                                            />
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 font-medium whitespace-nowrap max-w-xs truncate">
                                                            {quiz.title}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                                                            {quiz.category ? (
                                                                <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-800">
                                                                    {quiz.category}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-400">—</span>
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap text-center">
                                                            {quiz.questions_count || 0}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 whitespace-nowrap text-center">
                                                            {quiz.total_marks}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* About & Tips Sidebar */}
                        <div className="w-full lg:w-72 lg:sticky lg:top-8 h-fit flex-shrink-0">
                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg shadow-md p-4 sm:p-6 border border-yellow-100">
                                <div className="space-y-4">
                                    {/* About Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">About</h3>
                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                            Create and manage interactive quizzes with customizable categories. Track learner performance through detailed analytics and performance metrics to identify knowledge gaps and improve learning outcomes.
                                        </p>
                                    </div>

                                    {/* Tips Section */}
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">Tips</h3>
                                        <ul className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2 list-disc list-inside">
                                            <li>Use Overview card to track quiz stats</li>
                                            <li>Filter and search quizzes by category</li>
                                            <li>Add up to 20 questions per quiz</li>
                                            <li>Manage categories for organization</li>
                                            <li>View and print detailed reports</li>
                                            <li>Edit or delete anytime</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* View & Print Quiz Report Card */}
                            <button
                                onClick={() => setShowQuizPrintReport(true)}
                                className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 mt-3"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Printer className="h-10 w-10 text-yellow-600" />
                                    <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full">
                                        Print Report
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    View & Print Quiz Report
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Filter by category and print a detailed report of all quizzes with full details
                                </p>
                                <div className="flex items-center text-yellow-600 font-medium text-sm hover:text-yellow-600-dark">
                                    View Report →
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Step 1: Create Quiz Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Create New Quiz</h2>
                            <button onClick={handleCloseAddModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Quiz Title <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="title"
                                    type="text"
                                    value={addForm.title}
                                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="Enter quiz title"
                                    required
                                />
                                <InputError message={addFormErrors.title} className="mt-1" />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={addForm.description}
                                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    placeholder="Enter quiz description"
                                    rows={3}
                                />
                                <InputError message={addFormErrors.description} className="mt-1" />
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    id="category"
                                    value={addForm.category}
                                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                                <InputError message={addFormErrors.category} className="mt-1" />
                            </div>

                            <div>
                                <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-1">
                                    Cover Image
                                </label>
                                <input
                                    id="cover_image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setAddForm({ ...addForm, cover_image: e.target.files?.[0] || null })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Max size: 2MB</p>
                                <InputError message={addFormErrors.cover_image} className="mt-1" />
                            </div>

                            <p className="text-xs text-gray-500 italic">Note: You'll add questions in the next step.</p>

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
                                    className="px-4 py-2 text-sm font-medium rounded-md hover:opacity-90 transition bg-yellow-600 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {addFormProcessing ? 'Creating...' : 'Create Quiz'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Step 2: Add Questions Modal */}
            {showQuestionsModal && selectedQuiz && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Add Questions & Edit Quiz Details</h2>
                            <button onClick={handleCloseQuestionsModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleQuestionsSubmit} className="p-6 space-y-6">
                            {/* Edit Quiz Details Section */}
                            <div className="border-b pb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Quiz Details</h3>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="questions-modal-title" className="block text-sm font-medium text-gray-700 mb-1">
                                            Quiz Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="questions-modal-title"
                                            type="text"
                                            value={editDetailsForm.title}
                                            onChange={(e) => setEditDetailsForm({ ...editDetailsForm, title: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            placeholder="Enter quiz title"
                                            required
                                        />
                                        <InputError message={editDetailsFormErrors.title} className="mt-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="questions-modal-description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            id="questions-modal-description"
                                            value={editDetailsForm.description}
                                            onChange={(e) => setEditDetailsForm({ ...editDetailsForm, description: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            placeholder="Enter quiz description"
                                            rows={3}
                                        />
                                        <InputError message={editDetailsFormErrors.description} className="mt-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="questions-modal-category" className="block text-sm font-medium text-gray-700 mb-1">
                                            Category
                                        </label>
                                        <select
                                            id="questions-modal-category"
                                            value={editDetailsForm.category}
                                            onChange={(e) => setEditDetailsForm({ ...editDetailsForm, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={editDetailsFormErrors.category} className="mt-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="questions-modal-cover-image" className="block text-sm font-medium text-gray-700 mb-1">
                                            Cover Image
                                        </label>

                                        {/* Current Cover Image Preview */}
                                        {editDetailsPreviewImage && (
                                            <div className="mb-3 border border-gray-300 rounded-md p-2">
                                                <p className="text-xs text-gray-600 mb-2">Current Cover Image:</p>
                                                <img
                                                    src={editDetailsPreviewImage}
                                                    alt="Current cover"
                                                    className="max-h-40 rounded-md"
                                                />
                                            </div>
                                        )}

                                        <input
                                            id="questions-modal-cover-image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setEditDetailsForm({ ...editDetailsForm, cover_image: file });
                                                    const reader = new FileReader();
                                                    reader.onload = (event) => {
                                                        setEditDetailsPreviewImage(event.target?.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Max size: 2MB. Leave empty to keep current image.</p>
                                        <InputError message={editDetailsFormErrors.cover_image} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Add Questions Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Questions ({questionsForm.questions.length}/20)
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={handleAddQuestion}
                                        disabled={questionsForm.questions.length >= 20}
                                        className="px-3 py-1 text-black rounded text-sm transition disabled:bg-gray-300"
                                        style={{ backgroundColor: questionsForm.questions.length >= 20 ? '#D1D5DB' : '#FFD700' }}
                                    >
                                        + Add Question
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 italic">Minimum 1 question required. You can add up to 20 questions total.</p>
                            </div>

                            {/* Questions */}
                            <div className="space-y-4">
                                {questionsForm.questions.map((question, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveQuestion(index)}
                                                disabled={questionsForm.questions.length === 1}
                                                className={`px-2 py-1 text-white rounded text-sm transition ${
                                                    questionsForm.questions.length === 1
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-red-600 hover:bg-red-700'
                                                }`}
                                                title={questionsForm.questions.length === 1 ? 'At least 1 question is required' : 'Remove this question'}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        {/* Question BM */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Question (BM) <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={question.question_bm}
                                                onChange={(e) => handleUpdateQuestion(index, 'question_bm', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                placeholder="Enter question in Bahasa Melayu"
                                                required
                                            />
                                        </div>

                                        {/* Question ENG */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Question (ENG) <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={question.question_eng}
                                                onChange={(e) => handleUpdateQuestion(index, 'question_eng', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                placeholder="Enter question in English"
                                                required
                                            />
                                        </div>

                                        {/* Options */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            {['option_a', 'option_b', 'option_c', 'option_d'].map((opt, i) => (
                                                <div key={i}>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                                        Option {String.fromCharCode(65 + i)} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={question[opt as keyof QuizQuestion] as string}
                                                        onChange={(e) => handleUpdateQuestion(index, opt as keyof QuizQuestion, e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Correct Answer & Marks */}
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Correct Answer <span className="text-red-500">*</span></label>
                                                <select
                                                    value={question.correct_answer}
                                                    onChange={(e) => handleUpdateQuestion(index, 'correct_answer', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                    required
                                                >
                                                    <option value="A">A</option>
                                                    <option value="B">B</option>
                                                    <option value="C">C</option>
                                                    <option value="D">D</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Marks <span className="text-red-500">*</span></label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={isNaN(question.marks as any) ? '' : question.marks}
                                                    onChange={(e) => {
                                                        const value = e.target.value;
                                                        const numValue = value === '' ? 1 : parseInt(value, 10);
                                                        handleUpdateQuestion(index, 'marks', isNaN(numValue) ? 1 : numValue);
                                                    }}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Question Image - Optional */}
                                        <div className="mb-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Question Image</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    handleUpdateQuestion(index, 'question_image', file || null);
                                                }}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Max file size: 2MB. Supported formats: JPG, PNG, GIF</p>

                                            {/* Image Preview */}
                                            {question.question_image && (
                                                <div className="mt-2">
                                                    {typeof question.question_image === 'string' ? (
                                                        <img
                                                            src={question.question_image}
                                                            alt="Question preview"
                                                            className="max-h-32 rounded-md border border-gray-300"
                                                        />
                                                    ) : (
                                                        <img
                                                            src={URL.createObjectURL(question.question_image)}
                                                            alt="Question preview"
                                                            className="max-h-32 rounded-md border border-gray-300"
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-3 justify-end pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={handleCloseQuestionsModal}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={questionsFormProcessing}
                                    className="px-4 py-2 text-sm font-medium rounded-md hover:opacity-90 transition bg-yellow-600 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    {questionsFormProcessing ? 'Saving...' : 'Save All Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedQuizzes.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 text-center">
                                Delete {selectedQuizzes.length === 1 ? 'Quiz' : `${selectedQuizzes.length} Quizzes`}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 text-center">
                                {selectedQuizzes.length === 1
                                    ? `Are you sure you want to delete the selected quiz? This cannot be undone.`
                                    : `Are you sure you want to delete ${selectedQuizzes.length} selected quizzes? This cannot be undone.`}
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
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Manage Categories</h2>
                            <button
                                onClick={() => setShowCategoryModal(false)}
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Category</h3>
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
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                placeholder="Enter category name"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={categoryLoading}
                                            className="px-4 py-2 font-medium rounded-md hover:opacity-90 transition disabled:opacity-50 bg-yellow-600 text-white hover:bg-green-700 whitespace-nowrap"
                                        >
                                            {categoryLoading ? 'Creating...' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Categories List */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Categories</h3>
                                {categories.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-md">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Category Name</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Action</th>
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
                                    <p className="text-sm text-gray-500">No categories available. Create one to get started!</p>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t">
                            <button
                                onClick={() => setShowCategoryModal(false)}
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
