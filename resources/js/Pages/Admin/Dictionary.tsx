import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AdminNavigation from '@/Components/AdminNavigation';
import ReportViewer from '@/Components/ReportViewer';
import axios from 'axios';
import { Globe, Plus, Folder, Trash2, Printer } from 'lucide-react';

interface DictionaryEntry {
    entry_id: number;
    dusun_word: string;
    bm_translation: string;
    en_translation?: string;
    pronunciation?: string;
    dusun_example_sentence?: string;
    bm_example_translation?: string;
    en_example_translation?: string;
    word_picture?: string;
    category_id?: number;
    category_name?: string;
    search_count: number;
}

interface DictionaryCategory {
    id: number;
    name: string;
    description?: string;
}

interface OverviewData {
    total_words: number;
    top_searched: Array<{ dusun_word: string; search_count: number }>;
}

interface DictionaryProps {
    entries: DictionaryEntry[];
    categories: DictionaryCategory[];
    search: string;
    categoryFilter?: number | null;
    overview: OverviewData;
}

export default function Dictionary({ entries: initialEntries, categories: initialCategories, search: initialSearch, categoryFilter: initialCategoryFilter, overview }: DictionaryProps) {
    const [searchQuery, setSearchQuery] = useState(initialSearch || '');
    const [categoryFilter, setCategoryFilter] = useState<number | null>(initialCategoryFilter || null);
    const [categories, setCategories] = useState<DictionaryCategory[]>(initialCategories);
    const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
    const [entries] = useState<DictionaryEntry[]>(initialEntries);
    const [overviewData] = useState<OverviewData>(overview);

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<string | null>(null);

    // Print Report state
    const [showPrintReport, setShowPrintReport] = useState(false);
    const [reportCategoryFilter, setReportCategoryFilter] = useState<number | null>(null);

    // Edit form state
    const [editForm, setEditForm] = useState({
        entry_id: 0,
        dusun_word: '',
        bm_translation: '',
        en_translation: '',
        pronunciation: '',
        dusun_example_sentence: '',
        bm_example_translation: '',
        en_example_translation: '',
        dictionary_category_id: '',
        word_picture: null as File | null,
        existing_picture: null as string | null,
    });
    const [editFormErrors, setEditFormErrors] = useState<any>({});
    const [editFormProcessing, setEditFormProcessing] = useState(false);

    const [addForm, setAddForm] = useState({
        dusun_word: '',
        bm_translation: '',
        en_translation: '',
        pronunciation: '',
        dusun_example_sentence: '',
        bm_example_translation: '',
        en_example_translation: '',
        dictionary_category_id: '',
        word_picture: null as File | null,
    });

    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: '',
    });

    const [addFormErrors, setAddFormErrors] = useState<any>({});
    const [categoryFormErrors, setCategoryFormErrors] = useState<any>({});
    const [addFormProcessing, setAddFormProcessing] = useState(false);
    const [categoryFormProcessing, setCategoryFormProcessing] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.dictionary.index'), { search: searchQuery, category: categoryFilter || undefined });
    };

    const handleCategoryFilterChange = (newFilter: number | null) => {
        setCategoryFilter(newFilter);
        router.get(route('admin.dictionary.index'), { search: searchQuery, category: newFilter || undefined });
    };

    const handleSelectEntry = (entryId: number) => {
        setSelectedEntries((prev) =>
            prev.includes(entryId) ? prev.filter((id) => id !== entryId) : [...prev, entryId]
        );
    };

    const handleSelectAll = () => {
        if (selectedEntries.length === filteredEntries.length) {
            setSelectedEntries([]);
        } else {
            setSelectedEntries(filteredEntries.map((entry) => entry.entry_id));
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        setCategoryFormProcessing(true);

        try {
            const response = await axios.post(route('admin.dictionary.categories.store'), categoryForm);

            if (response.data.success) {
                alert(response.data.message || 'Category created successfully!');
                setCategories([...categories, { id: Math.max(...categories.map(c => c.id), 0) + 1, name: categoryForm.name, description: categoryForm.description }]);
                setCategoryForm({ name: '', description: '' });
            }
        } catch (error: any) {
            const errors = error.response?.data?.errors || {};
            setCategoryFormErrors(errors);
        } finally {
            setCategoryFormProcessing(false);
        }
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddFormProcessing(true);

        try {
            const formData = new FormData();
            formData.append('dusun_word', addForm.dusun_word);
            formData.append('bm_translation', addForm.bm_translation);
            formData.append('en_translation', addForm.en_translation);
            formData.append('pronunciation', addForm.pronunciation);
            formData.append('dusun_example_sentence', addForm.dusun_example_sentence);
            formData.append('bm_example_translation', addForm.bm_example_translation);
            formData.append('en_example_translation', addForm.en_example_translation);
            if (addForm.dictionary_category_id) {
                formData.append('dictionary_category_id', addForm.dictionary_category_id);
            }
            if (addForm.word_picture) {
                formData.append('word_picture', addForm.word_picture);
            }

            const response = await axios.post(route('admin.dictionary.store'), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                alert(response.data.message || 'Entry added successfully!');
                setShowAddModal(false);
                setAddForm({
                    dusun_word: '',
                    bm_translation: '',
                    en_translation: '',
                    pronunciation: '',
                    dusun_example_sentence: '',
                    bm_example_translation: '',
                    en_example_translation: '',
                    dictionary_category_id: '',
                    word_picture: null,
                });
                setSelectedEntries([]);
                router.get(route('admin.dictionary.index'), { category: categoryFilter || undefined });
            }
        } catch (error: any) {
            const errors = error.response?.data?.errors || {};
            setAddFormErrors(errors);
        } finally {
            setAddFormProcessing(false);
        }
    };

    const handleOpenEditModal = (entry: DictionaryEntry) => {
        setEditForm({
            entry_id: entry.entry_id,
            dusun_word: entry.dusun_word,
            bm_translation: entry.bm_translation,
            en_translation: entry.en_translation || '',
            pronunciation: entry.pronunciation || '',
            dusun_example_sentence: entry.dusun_example_sentence || '',
            bm_example_translation: entry.bm_example_translation || '',
            en_example_translation: entry.en_example_translation || '',
            dictionary_category_id: entry.category_id ? entry.category_id.toString() : '',
            word_picture: null,
            existing_picture: entry.word_picture || null,
        });
        setEditFormErrors({});
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditFormProcessing(true);

        try {
            const formData = new FormData();
            formData.append('entry_id', editForm.entry_id.toString());
            formData.append('dusun_word', editForm.dusun_word);
            formData.append('bm_translation', editForm.bm_translation);
            formData.append('en_translation', editForm.en_translation);
            formData.append('pronunciation', editForm.pronunciation);
            formData.append('dusun_example_sentence', editForm.dusun_example_sentence);
            formData.append('bm_example_translation', editForm.bm_example_translation);
            formData.append('en_example_translation', editForm.en_example_translation);
            if (editForm.dictionary_category_id) {
                formData.append('dictionary_category_id', editForm.dictionary_category_id);
            }
            if (editForm.word_picture) {
                formData.append('word_picture', editForm.word_picture);
            }
            formData.append('_method', 'PUT');

            const response = await axios.post(route('admin.dictionary.update', editForm.entry_id), formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                alert(response.data.message || 'Entry updated successfully!');
                setShowEditModal(false);
                setEditForm({
                    entry_id: 0,
                    dusun_word: '',
                    bm_translation: '',
                    en_translation: '',
                    pronunciation: '',
                    dusun_example_sentence: '',
                    bm_example_translation: '',
                    en_example_translation: '',
                    dictionary_category_id: '',
                    word_picture: null,
                    existing_picture: null,
                });
                setSelectedEntries([]);
                router.get(route('admin.dictionary.index'), { category: categoryFilter || undefined });
            }
        } catch (error: any) {
            const errors = error.response?.data?.errors || {};
            setEditFormErrors(errors);
        } finally {
            setEditFormProcessing(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (selectedEntries.length === 0) return;

        try {
            const response = await axios.delete(route('admin.dictionary.destroy'), {
                data: { entry_ids: selectedEntries },
            });

            if (response.data.success) {
                alert(response.data.message || 'Entries deleted successfully!');
                setShowDeleteModal(false);
                setSelectedEntries([]);
                router.get(route('admin.dictionary.index'), { category: categoryFilter || undefined });
            }
        } catch (error: any) {
            console.error('Error deleting entries:', error);
            alert('Error deleting entries. Please try again.');
        }
    };

    const filteredEntries = entries.filter(
        (entry) =>
            entry.dusun_word.toLowerCase().includes(searchQuery.toLowerCase()) ||
            entry.bm_translation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (entry.en_translation && entry.en_translation.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Filter entries for print report based on category filter
    const getReportFilteredEntries = () => {
        let filtered = entries;

        // Apply category filter if selected
        if (reportCategoryFilter) {
            filtered = filtered.filter(e => e.category_id === reportCategoryFilter);
        }

        return filtered;
    };

    const reportFilteredEntries = getReportFilteredEntries();

    // Get top 3 most searched
    const getReportTop3Searched = () => {
        return [...reportFilteredEntries]
            .sort((a, b) => b.search_count - a.search_count)
            .slice(0, 3);
    };

    // Show print report if requested
    if (showPrintReport) {
        return (
            <>
                <Head title="Dictionary Report - Admin Panel" />
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation themeColor="#4285F4" />
                    </div>

                    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Report Header - Hidden on Print */}
                        <div className="print:hidden mb-6 sm:mb-8">
                            <button
                                onClick={() => setShowPrintReport(false)}
                                className="mb-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                            >
                                ← Back to Dictionary Management
                            </button>
                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Dictionary Report</h1>

                                {/* Report Filters */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Category:</label>
                                        <select value={reportCategoryFilter || ''} onChange={(e) => setReportCategoryFilter(e.target.value ? parseInt(e.target.value, 10) : null)} className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            <option value="">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Print Button */}
                                    <div className="flex items-end">
                                        <button
                                            onClick={() => window.print()}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs sm:text-sm font-medium"
                                        >
                                            🖨️ Print Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Report Content */}
                        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">Dictionary Report</h2>

                            {/* Total Words Section */}
                            <div className="mb-8">
                                <p className="text-lg font-semibold text-gray-800">
                                    Total Words: <span className="text-gray-600">{reportFilteredEntries.length}</span>
                                </p>
                            </div>

                            {/* Top 3 Most Searched Table */}
                            <div className="mb-10">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 3 Most Searched</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse text-xs sm:text-sm">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Word</th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 text-left font-medium text-gray-800">Search Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {getReportTop3Searched().map((entry) => (
                                                <tr key={entry.entry_id}>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{entry.dusun_word}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 text-gray-600">{entry.search_count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {getReportTop3Searched().length === 0 && (
                                    <p className="text-center py-6 text-gray-600">Not found</p>
                                )}
                            </div>


                            {/* Dictionary Details Table */}
                            <div className="mt-10">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Dictionary Details</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full border-collapse text-xs sm:text-sm print:text-xs">
                                        <thead>
                                            <tr>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-left font-medium text-gray-800">Dusun Word</th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-left font-medium text-gray-800">Pronunciation</th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-left font-medium text-gray-800">BM Translation</th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-left font-medium text-gray-800">English Translation</th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-left font-medium text-gray-800">Dusun Example</th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-left font-medium text-gray-800">BM Example</th>
                                                <th className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-left font-medium text-gray-800">English Example</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportFilteredEntries.map((entry) => (
                                                <tr key={entry.entry_id}>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-gray-600 font-medium">{entry.dusun_word}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-gray-600">{entry.pronunciation || '—'}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-gray-600">{entry.bm_translation}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-gray-600">{entry.en_translation || '—'}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-gray-600">{entry.dusun_example_sentence || '—'}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-gray-600">{entry.bm_example_translation || '—'}</td>
                                                    <td className="border border-gray-300 px-2 sm:px-3 py-2 print:px-1 print:py-1 text-gray-600">{entry.en_example_translation || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {reportFilteredEntries.length === 0 && (
                                    <p className="text-center py-6 text-gray-600">Not found</p>
                                )}
                            </div>

                            {/* Footer - Hidden on Print */}
                            <div className="print:hidden mt-6 pt-6 border-t">
                                <p className="text-xs text-gray-600">Report generated on {new Date().toLocaleString()}</p>
                            </div>
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
                <Head title="Dictionary Management - Admin Panel" />
                <div className="min-h-screen bg-gray-100">
                    <div className="print:hidden">
                        <AdminNavigation themeColor="#4285F4" />
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
            <Head title="Dictionary - TanganakDusun" />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <AdminNavigation themeColor="#4285F4" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6 sm:mb-8">
                        <div className="flex items-center gap-3">
                            <Globe className="h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 text-blue-600" />
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                Dictionary Management
                            </h1>
                        </div>
                        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                            Create, manage, and organize Dusun language dictionary entries
                        </p>
                    </div>

                    <div className="flex flex-col-reverse lg:flex-row lg:items-start gap-5">
                        <div className="flex-1 min-w-0 flex flex-col gap-5">
                            <div>
                                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-t-4 border-blue-500">
                                    <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                        <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                                            Dictionary Overview
                                        </h2>
                                    </div>

                                    <div className="mb-4 sm:mb-6">
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                            Category:
                                        </label>
                                        <select
                                            value={categoryFilter || ''}
                                            onChange={(e) => handleCategoryFilterChange(e.target.value ? parseInt(e.target.value, 10) : null)}
                                            className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                                                Total Words
                                            </p>
                                            <p className="text-3xl sm:text-4xl font-bold text-blue-600">{overviewData.total_words}</p>
                                            <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                                                {categoryFilter ? 'In selected category' : 'All categories'}
                                            </p>
                                        </div>

                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200 flex flex-col justify-start min-h-28">
                                            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-3">
                                                Top 3 Most Searched
                                            </p>
                                            <div className="space-y-2">
                                                {overviewData.top_searched.map((entry, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm sm:text-lg">
                                                        <span className="text-blue-600 font-bold truncate">{entry.dusun_word}</span>
                                                        <span className="text-blue-600 font-bold flex-shrink-0 ml-2 text-xs sm:text-sm">{entry.search_count}x</span>
                                                    </div>
                                                ))}
                                                {overviewData.top_searched.length === 0 && <p className="text-xs text-gray-500">Not found</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                                    <form onSubmit={handleSearch} className="flex-1 min-w-0">
                                        <div className="relative">
                                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search by word or translation..."
                                                className="w-full pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            />
                                        </div>
                                    </form>

                                    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 w-full lg:w-auto">
                                        <button
                                            onClick={() => setShowCategoryModal(true)}
                                            disabled={selectedEntries.length > 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedEntries.length > 0 ? "Deselect entries to manage categories" : "Manage dictionary categories"}
                                        >
                                            <Folder className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                            <span>Manage Categories</span>
                                        </button>
                                        <button
                                            onClick={() => setShowAddModal(true)}
                                            disabled={selectedEntries.length > 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedEntries.length > 0 ? "Deselect entries to add a new one" : "Add a new dictionary entry"}
                                        >
                                            <Plus className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" />
                                            <span>Add Entry</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (selectedEntries.length === 1) {
                                                    const entryToEdit = filteredEntries.find(e => e.entry_id === selectedEntries[0]);
                                                    if (entryToEdit) {
                                                        handleOpenEditModal(entryToEdit);
                                                    }
                                                }
                                            }}
                                            disabled={selectedEntries.length !== 1}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedEntries.length === 1 ? "Edit selected entry" : selectedEntries.length === 0 ? "Select one entry to edit" : "Select only one entry to edit"}
                                        >
                                            <span>Edit Entry</span>
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            disabled={selectedEntries.length === 0}
                                            className="px-2 sm:px-4 py-2 rounded-lg font-medium transition flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            title={selectedEntries.length > 0 ? `Delete ${selectedEntries.length} selected entry/entries` : "Select entries to delete"}
                                        >
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {filteredEntries.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <h3 className="text-base sm:text-lg font-medium text-gray-900">
                                        Not found
                                    </h3>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                                    <div className="overflow-x-auto overflow-y-auto max-h-[400px] sm:max-h-[600px]">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-blue-600 text-white sticky top-0">
                                                <tr>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300"
                                                            checked={selectedEntries.length === filteredEntries.length && filteredEntries.length > 0}
                                                            ref={el => {
                                                                if (el) {
                                                                    el.indeterminate = selectedEntries.length > 0 && selectedEntries.length < filteredEntries.length;
                                                                }
                                                            }}
                                                            onChange={handleSelectAll}
                                                        />
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Dusun Word
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Pronunciation
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        BM Translation
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        English Translation
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap hidden md:table-cell">
                                                        Dusun Example
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap hidden md:table-cell">
                                                        BM Example
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap hidden lg:table-cell">
                                                        English Example
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Image
                                                    </th>
                                                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap">
                                                        Searches
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {filteredEntries.map((entry) => (
                                                    <tr key={entry.entry_id} className="hover:bg-gray-50 transition">
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedEntries.includes(entry.entry_id)}
                                                                onChange={() => handleSelectEntry(entry.entry_id)}
                                                                className="rounded border-gray-300"
                                                            />
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                                                            {entry.dusun_word}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 max-w-xs truncate">
                                                            {entry.pronunciation || '—'}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 max-w-xs truncate">
                                                            {entry.bm_translation}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 max-w-xs truncate">
                                                            {entry.en_translation || '—'}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 max-w-xs truncate hidden md:table-cell">
                                                            {entry.dusun_example_sentence || '—'}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 max-w-xs truncate hidden md:table-cell">
                                                            {entry.bm_example_translation || '—'}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 max-w-xs truncate hidden lg:table-cell">
                                                            {entry.en_example_translation || '—'}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">
                                                            {entry.word_picture ? (
                                                                <img src={entry.word_picture} alt={entry.dusun_word} className="h-10 w-10 object-cover rounded" />
                                                            ) : (
                                                                '—'
                                                            )}
                                                        </td>
                                                        <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-600 font-semibold">
                                                            {entry.search_count}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="w-full lg:w-72 lg:sticky lg:top-8 h-fit flex-shrink-0">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-4 sm:p-6 border border-blue-100">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                                            About
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                                            Create and manage a comprehensive Dusun language dictionary. Organize words by categories, track search statistics, and provide translations in Bahasa Melayu and English with pronunciation guides and example sentences.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                                            Tips
                                        </h3>
                                        <ul className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-2 list-disc list-inside">
                                            <li>Organize words by categories</li>
                                            <li>Track search statistics</li>
                                            <li>Include multiple translations</li>
                                            <li>Add pronunciation guides</li>
                                            <li>Upload images for words</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* View Report Card */}
                            <button
                                onClick={() => setShowPrintReport(true)}
                                className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200 text-left border border-gray-200 mt-3"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <Printer className="h-10 w-10 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                                        Print Report
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    View & Print Dictionary Report
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Filter and print a detailed report of dictionary entries with search statistics
                                </p>
                                <div className="flex items-center text-blue-600 font-medium text-sm hover:text-blue-600-dark">
                                    View Report →
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Add Dictionary Entry
                            </h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddSubmit} className="p-6 space-y-6">
                            {/* Row 1: Basic Fields */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dusun Word <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={addForm.dusun_word}
                                        onChange={(e) => setAddForm({ ...addForm, dusun_word: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pronunciation <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={addForm.pronunciation}
                                        onChange={(e) => setAddForm({ ...addForm, pronunciation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 2: Translations */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">BM Translation <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={addForm.bm_translation}
                                        onChange={(e) => setAddForm({ ...addForm, bm_translation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">English Translation <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={addForm.en_translation}
                                        onChange={(e) => setAddForm({ ...addForm, en_translation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 3: Example Sentences */}
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dusun Example Sentence <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={addForm.dusun_example_sentence}
                                        onChange={(e) => setAddForm({ ...addForm, dusun_example_sentence: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 4: Example Translations */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">BM Example Sentence <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={addForm.bm_example_translation}
                                        onChange={(e) => setAddForm({ ...addForm, bm_example_translation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">English Example Sentence <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={addForm.en_example_translation}
                                        onChange={(e) => setAddForm({ ...addForm, en_example_translation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 5: Category and Image */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={addForm.dictionary_category_id}
                                        onChange={(e) => setAddForm({ ...addForm, dictionary_category_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image <span className="text-red-500">*</span></label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setAddForm({ ...addForm, word_picture: e.target.files?.[0] || null })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addFormProcessing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition"
                                >
                                    {addFormProcessing ? 'Adding...' : 'Add Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Edit Dictionary Entry
                            </h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="p-6 space-y-6">
                            {/* Row 1: Basic Fields */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dusun Word <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={editForm.dusun_word}
                                        onChange={(e) => setEditForm({ ...editForm, dusun_word: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pronunciation <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={editForm.pronunciation}
                                        onChange={(e) => setEditForm({ ...editForm, pronunciation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 2: Translations */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">BM Translation <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={editForm.bm_translation}
                                        onChange={(e) => setEditForm({ ...editForm, bm_translation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">English Translation <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={editForm.en_translation}
                                        onChange={(e) => setEditForm({ ...editForm, en_translation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 3: Example Sentences */}
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Dusun Example Sentence <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={editForm.dusun_example_sentence}
                                        onChange={(e) => setEditForm({ ...editForm, dusun_example_sentence: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 4: Example Translations */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">BM Example Sentence <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={editForm.bm_example_translation}
                                        onChange={(e) => setEditForm({ ...editForm, bm_example_translation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">English Example Sentence <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={editForm.en_example_translation}
                                        onChange={(e) => setEditForm({ ...editForm, en_example_translation: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={2}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Row 5: Category and Image */}
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <select
                                        value={editForm.dictionary_category_id}
                                        onChange={(e) => setEditForm({ ...editForm, dictionary_category_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Image <span className="text-red-500">*</span></label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setEditForm({ ...editForm, word_picture: e.target.files?.[0] || null })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {editForm.existing_picture && !editForm.word_picture && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-600 font-medium mb-2">Current Image:</p>
                                            <img src={editForm.existing_picture} alt="Current entry image" className="h-32 w-32 object-cover rounded-lg border border-gray-300" />
                                        </div>
                                    )}
                                    {editForm.word_picture && (
                                        <div className="mt-3">
                                            <p className="text-xs text-gray-600 font-medium mb-2">New Image Preview:</p>
                                            <img src={URL.createObjectURL(editForm.word_picture)} alt="New entry image" className="h-32 w-32 object-cover rounded-lg border border-gray-300" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editFormProcessing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition"
                                >
                                    {editFormProcessing ? 'Updating...' : 'Update Entry'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCategoryModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                Manage Categories
                            </h2>
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
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Create New Category
                                </h3>
                                <form onSubmit={handleAddCategory} className="space-y-3">
                                    <div className="flex gap-3 items-end">
                                        <div className="flex-1">
                                            <label htmlFor="category-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Category Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                id="category-name"
                                                type="text"
                                                value={categoryForm.name}
                                                onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter category name"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={categoryFormProcessing}
                                            className="px-4 py-2 font-medium rounded-md hover:opacity-90 transition disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap"
                                        >
                                            {categoryFormProcessing ? 'Creating...' : 'Create'}
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
                                                                onClick={async () => {
                                                                    if (confirm(`Are you sure you want to delete "${cat.name}"?`)) {
                                                                        try {
                                                                            const response = await axios.delete(route('admin.dictionary.categories.destroy', cat.id));
                                                                            if (response.data.success) {
                                                                                setCategories(categories.filter((c) => c.id !== cat.id));
                                                                                alert(response.data.message || 'Category have been deleted successfully');
                                                                            }
                                                                        } catch (error) {
                                                                            alert('Error deleting category');
                                                                        }
                                                                    }
                                                                }}
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
                                onClick={() => setShowCategoryModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900 text-center">
                                Delete Dictionary Entry
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 text-center">
                                Are you sure you want to delete {selectedEntries.length} entry/entries? This action cannot be undone.
                            </p>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end border-t border-gray-200">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md transition"
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
        </>
    );
}
