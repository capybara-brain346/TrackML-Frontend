import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { workspaceApi } from '../services/api';
import { WorkspaceEntry, ModelEntry } from '../types';

export const WorkspaceDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState<WorkspaceEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        if (id) {
            loadWorkspace(parseInt(id));
        }
    }, [id]);

    const loadWorkspace = async (workspaceId: number) => {
        try {
            const data = await workspaceApi.getById(workspaceId);
            setWorkspace(data);
            setEditName(data.name);
            setEditDescription(data.description || '');
            setLoading(false);
        } catch (err) {
            setError('Failed to load workspace');
            setLoading(false);
        }
    };

    const handleUpdateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!workspace || !editName.trim()) return;

        try {
            const updated = await workspaceApi.update(workspace.id, {
                name: editName.trim(),
                description: editDescription.trim() || undefined
            });
            setWorkspace(updated);
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update workspace');
        }
    };

    const handleDeleteWorkspace = async () => {
        if (!workspace || !window.confirm('Are you sure you want to delete this workspace?')) return;

        try {
            await workspaceApi.delete(workspace.id);
            navigate('/workspaces');
        } catch (err) {
            setError('Failed to delete workspace');
        }
    };

    const handleMoveModel = async (modelId: number, targetWorkspaceId: number) => {
        if (!workspace) return;

        try {
            await workspaceApi.moveModel(modelId, workspace.id, targetWorkspaceId);
            const updated = await workspaceApi.getById(workspace.id);
            setWorkspace(updated);
        } catch (err) {
            setError('Failed to move model');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!workspace) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">Workspace not found</h3>
                <div className="mt-4">
                    <Link to="/workspaces" className="text-blue-600 hover:text-blue-800">
                        Back to Workspaces
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <Link to="/workspaces" className="text-blue-600 hover:text-blue-800">
                        ← Back
                    </Link>
                    <h2 className="text-2xl font-bold text-gray-900">{workspace.name}</h2>
                    {workspace.is_default && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Default
                        </span>
                    )}
                </div>
                <div className="space-x-4">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        {isEditing ? 'Cancel' : 'Edit'}
                    </button>
                    <button
                        onClick={handleDeleteWorkspace}
                        className="text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="text-red-700">{error}</div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
                {isEditing ? (
                    <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Workspace Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description (Optional)
                            </label>
                            <textarea
                                id="description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                rows={3}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!editName.trim()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Save Changes
                        </button>
                    </form>
                ) : (
                    <>
                        {workspace.description && (
                            <p className="text-gray-600 mb-6">{workspace.description}</p>
                        )}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Models</h3>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {workspace.models.map(model => (
                                    <div key={model.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-lg font-medium text-gray-900">
                                                <Link
                                                    to={`/models/${model.id}`}
                                                    className="hover:text-blue-600"
                                                >
                                                    {model.name}
                                                </Link>
                                            </h4>
                                        </div>
                                        <div className="mt-2">
                                            {model.developer && (
                                                <p className="text-sm text-gray-600">
                                                    Developer: {model.developer}
                                                </p>
                                            )}
                                            {model.model_type && (
                                                <p className="text-sm text-gray-600">
                                                    Type: {model.model_type}
                                                </p>
                                            )}
                                            {model.parameters && (
                                                <p className="text-sm text-gray-600">
                                                    Parameters: {model.parameters.toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}; 