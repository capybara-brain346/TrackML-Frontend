import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ModelEntry, ModelType, ModelStatus } from '../types';
import { modelApi } from '../services/api';


export const Dashboard = () => {
    const [models, setModels] = useState<ModelEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const data = await modelApi.getAll();
                setModels(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch models');
                setLoading(false);
            }
        };

        fetchModels();
    }, []);

    const getModelStats = () => {
        const stats = {
            total: models.length,
            byStatus: {} as Record<string, number>,
            byType: {} as Record<string, number>,
            totalTags: new Set<string>(),
        };

        models.forEach((model) => {
            if (model.status) {
                stats.byStatus[model.status] = (stats.byStatus[model.status] || 0) + 1;
            }
            if (model.model_type) {
                stats.byType[model.model_type] = (stats.byType[model.model_type] || 0) + 1;
            }
            if (model.tags) {
                model.tags.forEach(tag => stats.totalTags.add(tag));
            }
        });

        return stats;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <div className="text-red-700">
                        <p>{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const stats = getModelStats();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
                <p className="mt-2 text-gray-600">Overview of your ML model collection</p>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Total Models</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Model Types</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {Object.keys(stats.byType).length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Total Tags</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {stats.totalTags.size}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-500">Models This Month</h3>
                    <p className="mt-2 text-3xl font-semibold text-gray-900">
                        {models.filter(m =>
                            m.date_interacted &&
                            new Date(m.date_interacted).getMonth() === new Date().getMonth()
                        ).length}
                    </p>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Models by Status</h3>
                    </div>
                    <div className="px-6 py-4">
                        <div className="space-y-4">
                            {Object.entries(stats.byStatus).map(([status, count]) => (
                                <div key={status} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${status === 'Tried' ? 'bg-green-400' :
                                            status === 'Studying' ? 'bg-blue-400' :
                                                status === 'Wishlist' ? 'bg-yellow-400' :
                                                    'bg-gray-400'
                                            }`}></span>
                                        <span className="text-sm text-gray-600">{status}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-5 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Models</h3>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {models
                            .sort((a, b) =>
                                new Date(b.date_interacted || 0).getTime() -
                                new Date(a.date_interacted || 0).getTime()
                            )
                            .slice(0, 5)
                            .map((model) => (
                                <Link
                                    key={model.id}
                                    to={`/models/${model.id}`}
                                    className="block hover:bg-gray-50"
                                >
                                    <div className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{model.name}</p>
                                                <p className="text-sm text-gray-500">{model.model_type}</p>
                                            </div>
                                            {model.date_interacted && (
                                                <p className="text-sm text-gray-500">
                                                    {new Date(model.date_interacted).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Popular Tags</h3>
                </div>
                <div className="p-6">
                    <div className="flex flex-wrap gap-2">
                        {Array.from(stats.totalTags)
                            .slice(0, 15)
                            .map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                >
                                    {tag}
                                </span>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};