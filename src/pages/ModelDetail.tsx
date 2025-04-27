import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ModelEntry, ModelType, ModelStatus } from '../types';
import { modelApi } from '../services/api';

export const ModelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [model, setModel] = useState<ModelEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editedModel, setEditedModel] = useState<ModelEntry | null>(null);

    const modelTypes: ModelType[] = ['LLM', 'Vision', 'Audio', 'MultiModal', 'Other'];
    const modelStatuses: ModelStatus[] = ['Tried', 'Studying', 'Wishlist', 'Archived'];

    useEffect(() => {
        fetchModel();
    }, [id]);

    const fetchModel = async () => {
        if (!id) return;
        try {
            const data = await modelApi.getById(parseInt(id));
            setModel(data);
            setEditedModel(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch model details');
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editedModel || !id) return;
        try {
            await modelApi.update(parseInt(id), editedModel);
            setModel(editedModel);
            setIsEditing(false);
            fetchModel();
        } catch (err) {
            setError('Failed to update model');
        }
    };

    const handleDelete = async () => {
        if (!id || !window.confirm('Are you sure you want to delete this model?')) return;
        try {
            await modelApi.delete(parseInt(id));
            navigate('/models');
        } catch (err) {
            setError('Failed to delete model');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error || !model) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <div className="text-red-700">
                        <p>{error || 'Model not found'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editedModel?.name || ''}
                                onChange={(e) => setEditedModel(prev => ({ ...prev!, name: e.target.value }))}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        ) : (
                            model.name
                        )}
                    </h2>
                    {model.developer && !isEditing && (
                        <p className="mt-1 text-gray-500">by {model.developer}</p>
                    )}
                </div>
                <div className="flex space-x-4">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedModel(model);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                            >
                                Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg font-medium text-gray-900">Model Information</h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {isEditing ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Developer</label>
                                    <input
                                        type="text"
                                        value={editedModel?.developer || ''}
                                        onChange={(e) => setEditedModel(prev => ({ ...prev!, developer: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        value={editedModel?.model_type || ''}
                                        onChange={(e) => setEditedModel(prev => ({ ...prev!, model_type: e.target.value }))}
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
                                        value={editedModel?.status || ''}
                                        onChange={(e) => setEditedModel(prev => ({ ...prev!, status: e.target.value }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select Status</option>
                                        {modelStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Parameters</label>
                                    <input
                                        type="number"
                                        value={editedModel?.parameters || ''}
                                        onChange={(e) => setEditedModel(prev => ({ ...prev!, parameters: parseInt(e.target.value) || undefined }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <textarea
                                        value={editedModel?.notes || ''}
                                        onChange={(e) => setEditedModel(prev => ({ ...prev!, notes: e.target.value }))}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={editedModel?.tags?.join(', ') || ''}
                                        onChange={(e) => setEditedModel(prev => ({
                                            ...prev!,
                                            tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                                        }))}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Source Links (one per line)</label>
                                    <textarea
                                        value={editedModel?.source_links?.join('\n') || ''}
                                        onChange={(e) => setEditedModel(prev => ({
                                            ...prev!,
                                            source_links: e.target.value.split('\n').map(link => link.trim()).filter(Boolean)
                                        }))}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Developer</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{model.developer || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{model.model_type || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{model.status || 'N/A'}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Parameters</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {model.parameters ? model.parameters.toLocaleString() : 'N/A'}
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{model.notes || 'N/A'}</dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Tags</dt>
                                    <dd className="mt-2">
                                        <div className="flex flex-wrap gap-2">
                                            {model.tags?.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </dd>
                                </div>
                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Source Links</dt>
                                    <dd className="mt-2 space-y-2">
                                        {model.source_links?.map((link, index) => (
                                            <a
                                                key={index}
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block text-sm text-blue-600 hover:text-blue-800"
                                            >
                                                {link}
                                            </a>
                                        ))}
                                    </dd>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};