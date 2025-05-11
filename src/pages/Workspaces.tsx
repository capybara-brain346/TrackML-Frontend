import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { workspaceApi } from '../services/api';
import { WorkspaceEntry } from '../types';

export const Workspaces = () => {
    const [workspaces, setWorkspaces] = useState<WorkspaceEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const loadWorkspaces = async () => {
        try {
            const data = await workspaceApi.getAll();
            setWorkspaces(data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load workspaces');
            setLoading(false);
        }
    };

    const handleCreateWorkspace = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newWorkspaceName.trim()) return;

        setIsCreating(true);
        try {
            const workspace = await workspaceApi.create(
                newWorkspaceName.trim(),
                newWorkspaceDescription.trim() || undefined
            );
            setWorkspaces([...workspaces, workspace]);
            setNewWorkspaceName('');
            setNewWorkspaceDescription('');
        } catch (err) {
            setError('Failed to create workspace');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteWorkspace = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this workspace?')) return;

        try {
            await workspaceApi.delete(id);
            setWorkspaces(workspaces.filter(w => w.id !== id));
        } catch (err) {
            setError('Failed to delete workspace');
        }
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
                <h2 className="text-2xl font-bold text-gray-900">Workspaces</h2>
            </div>

            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="text-red-700">{error}</div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-lg shadow">
                <form onSubmit={handleCreateWorkspace} className="space-y-4 mb-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                            Workspace Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={newWorkspaceName}
                            onChange={(e) => setNewWorkspaceName(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Enter workspace name"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description (Optional)
                        </label>
                        <textarea
                            id="description"
                            value={newWorkspaceDescription}
                            onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            placeholder="Enter workspace description"
                            rows={3}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating || !newWorkspaceName.trim()}
                        className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isCreating || !newWorkspaceName.trim()
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                    >
                        {isCreating ? 'Creating...' : 'Create Workspace'}
                    </button>
                </form>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {workspaces.map(workspace => (
                        <div key={workspace.id} className="bg-gray-50 p-6 rounded-lg shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        <Link
                                            to={`/workspace/${workspace.id}`}
                                            className="hover:text-blue-600"
                                        >
                                            {workspace.name}
                                        </Link>
                                    </h3>
                                    {workspace.is_default && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleDeleteWorkspace(workspace.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    Delete
                                </button>
                            </div>
                            {workspace.description && (
                                <p className="mt-2 text-sm text-gray-600">{workspace.description}</p>
                            )}
                            <div className="mt-4">
                                <span className="text-sm text-gray-500">
                                    {workspace.models.length} models
                                </span>
                                <span className="mx-2 text-gray-300">•</span>
                                <span className="text-sm text-gray-500">
                                    Created {new Date(workspace.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 