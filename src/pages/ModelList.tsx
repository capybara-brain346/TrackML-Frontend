import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ModelCard } from '../components/ModelCard';
import { ModelEntry, ModelType, ModelStatus, SearchParams } from '../types';
import { modelApi } from '../services/api';

export const ModelList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [models, setModels] = useState<ModelEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSemanticSearch, setIsSemanticSearch] = useState(false);
    const [selectedType, setSelectedType] = useState<string>('');
    const [selectedStatus, setSelectedStatus] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newModel, setNewModel] = useState<Partial<ModelEntry>>({
        tags: [],
        source_links: []
    });
    const [isAutofilling, setIsAutofilling] = useState(false);
    const [sourceIdentifier, setSourceIdentifier] = useState('');
    const [modelLinks, setModelLinks] = useState<string[]>([]);
    const [selectedModels, setSelectedModels] = useState<number[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    const modelTypes: ModelType[] = ['Audio', 'Chatbot', 'Classification', 'Clustering', 'CodeAssistant', 'DataAnalysis', 'Diffusion', 'Forecasting', 'ImageEditing', 'LLM', 'LanguageModel', 'MachineTranslation', 'MultiModal', 'NER', 'ObjectDetection', 'Other', 'Recommendation', 'Reinforcement', 'Segmentation', 'SentimentAnalysis', 'TextGeneration', 'TimeSeries', 'Vision', 'VoiceGeneration'];
    const modelStatuses: ModelStatus[] = ['Tried', 'Studying', 'Wishlist', 'Archived'];

    useEffect(() => {
        fetchModels();
        fetchTags();
    }, []);

    const fetchModels = async () => {
        try {
            setLoading(true);
            let data;

            if (isSemanticSearch && searchQuery.trim()) {
                data = await modelApi.semanticSearch(searchQuery);
            } else {
                const searchParams: SearchParams = {
                    q: searchQuery,
                    type: selectedType as ModelType,
                    status: selectedStatus as ModelStatus,
                    tag: selectedTag
                };
                data = await modelApi.search(searchParams);
            }

            setModels(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch models');
            setLoading(false);
        }
    };

    const fetchTags = async () => {
        try {
            const modelData = await modelApi.getAll();
            const uniqueTags = Array.from(
                new Set(modelData.flatMap(model => model.tags || []))
            ).sort();
            setTags(uniqueTags);
        } catch (err) {
            setError('Failed to fetch tags');
        }
    };

    const handleCreateModel = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!user?.id) {
                setError('User authentication required');
                return;
            }
            if (!newModel.name) {
                setError('Name is required');
                return;
            }

            const modelData: Omit<ModelEntry, "id" | "created_at" | "updated_at"> = {
                user_id: user.id,
                name: newModel.name,
                model_type: newModel.model_type,
                status: newModel.status,
                developer: newModel.developer,
                date_interacted: new Date().toISOString().split('T')[0],
                notes: newModel.notes,
                parameters: newModel.parameters,
                license: newModel.license,
                version: newModel.version,
                tags: newModel.tags || [],
                source_links: newModel.source_links || []
            };

            await modelApi.create(modelData);
            setShowCreateModal(false);
            setNewModel({ tags: [], source_links: [] });
            fetchModels();
        } catch (err) {
            setError('Failed to create model');
        }
    };

    const handleDeleteModel = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this model?')) return;
        try {
            await modelApi.delete(id);
            fetchModels();
        } catch (err) {
            setError('Failed to delete model');
        }
    };

    const handleAutofill = async () => {
        if (!sourceIdentifier) return;

        setIsAutofilling(true);
        try {
            console.log('Autofill request:', {
                modelId: sourceIdentifier,
                modelLinks,
                files: uploadedFiles.map(f => f.name),
                fileCount: uploadedFiles.length
            });
            const data = await modelApi.autofill(sourceIdentifier, modelLinks, uploadedFiles);
            setNewModel(prev => ({
                ...prev,
                ...data,
                tags: [...(prev.tags || []), ...(data.tags || [])],
                source_links: [...(prev.source_links || []), ...modelLinks, ...(data.source_links || [])]
            }));
        } catch (err: any) {
            setError(err.message || 'Failed to autofill model information');
        } finally {
            setIsAutofilling(false);
        }
    };

    const handleModelSelection = (id: number, selected: boolean) => {
        setSelectedModels(prev =>
            selected ? [...prev, id] : prev.filter(modelId => modelId !== id)
        );
    };

    const handleCompare = () => {
        if (selectedModels.length < 2) {
            setError('Please select at least 2 models to compare');
            return;
        }
        navigate(`/compare?models=${selectedModels.join(',')}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Models</h2>
                <div className="space-x-4">
                    {selectedModels.length >= 2 && (
                        <button
                            onClick={handleCompare}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                            Compare Selected ({selectedModels.length})
                        </button>
                    )}
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Add Model
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="flex flex-col space-y-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search models..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        fetchModels();
                                    }
                                }}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                            <button
                                onClick={fetchModels}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                🔍
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="semanticSearch"
                                checked={isSemanticSearch}
                                onChange={(e) => {
                                    setIsSemanticSearch(e.target.checked);
                                    if (e.target.checked && searchQuery) {
                                        fetchModels();
                                    }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="semanticSearch" className="text-sm text-gray-600">
                                Use semantic search
                            </label>
                        </div>
                    </div>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        disabled={isSemanticSearch}
                    >
                        <option value="">All Types</option>
                        {modelTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                    <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        {modelStatuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                    <select
                        value={selectedTag}
                        onChange={(e) => setSelectedTag(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="">All Tags</option>
                        {tags.map(tag => (
                            <option key={tag} value={tag}>{tag}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => fetchModels()}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 md:col-span-4"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="text-red-700">
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {models.map((model) => (
                    <ModelCard
                        key={model.id}
                        model={model}
                        onDelete={handleDeleteModel}
                        selectable
                        selected={selectedModels.includes(model.id)}
                        onSelectionChange={handleModelSelection}
                    />
                ))}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-lg font-medium mb-4">Add New Model</h3>
                        <div className="mb-6 p-4 bg-gray-50 rounded-md">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Autofill from Source</h4>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Enter Model ID"
                                        value={sourceIdentifier}
                                        onChange={(e) => setSourceIdentifier(e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Additional Model Links</label>
                                    <div className="mt-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="url"
                                                placeholder="Enter a model link"
                                                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                                value={modelLinks.length > 0 ? '' : ''}
                                                onChange={(e) => {
                                                    const newLink = e.target.value;
                                                    if (newLink.trim()) {
                                                        setModelLinks([...modelLinks, newLink.trim()]);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const input = e.target as HTMLInputElement;
                                                        if (input.value.trim()) {
                                                            setModelLinks([...modelLinks, input.value.trim()]);
                                                            input.value = '';
                                                        }
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const input = document.querySelector('input[type="url"]') as HTMLInputElement;
                                                    if (input.value.trim()) {
                                                        setModelLinks([...modelLinks, input.value.trim()]);
                                                        input.value = '';
                                                    }
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {modelLinks.map((link, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                                                >
                                                    <span className="max-w-xs truncate">{link}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newLinks = [...modelLinks];
                                                            newLinks.splice(index, 1);
                                                            setModelLinks(newLinks);
                                                        }}
                                                        className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        {modelLinks.length > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setModelLinks([])}
                                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                                            >
                                                Clear all links
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Additional Documentation Files</label>
                                    <input
                                        type="file"
                                        multiple
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            setUploadedFiles(files);
                                        }}
                                        className="mt-1 block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-2">
                                            <div className="text-sm text-gray-500 mb-2">Selected files:</div>
                                            <div className="space-y-2">
                                                {uploadedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                                        <span className="text-sm truncate">{file.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newFiles = [...uploadedFiles];
                                                                newFiles.splice(index, 1);
                                                                setUploadedFiles(newFiles);
                                                            }}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setUploadedFiles([])}
                                                className="mt-2 text-sm text-red-600 hover:text-red-800"
                                            >
                                                Clear all files
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAutofill}
                                    disabled={isAutofilling || !sourceIdentifier}
                                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isAutofilling ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Autofilling...
                                        </span>
                                    ) : (
                                        'Autofill'
                                    )}
                                </button>
                            </div>
                        </div>
                        <form onSubmit={handleCreateModel} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={newModel.name || ''}
                                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Developer</label>
                                <input
                                    type="text"
                                    value={newModel.developer || ''}
                                    onChange={(e) => setNewModel({ ...newModel, developer: e.target.value })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Type</label>
                                <select
                                    value={newModel.model_type || ''}
                                    onChange={(e) => setNewModel({ ...newModel, model_type: e.target.value as ModelType })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select Type</option>
                                    {modelTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={newModel.status || ''}
                                    onChange={(e) => setNewModel({ ...newModel, status: e.target.value as ModelStatus })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select Status</option>
                                    {modelStatuses.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                <textarea
                                    value={newModel.notes || ''}
                                    onChange={(e) => setNewModel({ ...newModel, notes: e.target.value })}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                                <input
                                    type="text"
                                    value={newModel.tags?.join(', ') || ''}
                                    onChange={(e) => setNewModel({
                                        ...newModel,
                                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                                    })}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};