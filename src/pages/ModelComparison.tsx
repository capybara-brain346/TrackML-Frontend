import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { modelApi, modelInsightApi } from '../services/api';
import { ModelEntry } from '../types';

export const ModelComparison = () => {
    const [searchParams] = useSearchParams();
    const [models, setModels] = useState<ModelEntry[]>([]);
    const [comparison, setComparison] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadComparison = async () => {
            try {
                const modelIds = searchParams.get('models')?.split(',').map(Number) || [];
                if (modelIds.length < 2) {
                    setError('Not enough models selected for comparison');
                    setLoading(false);
                    return;
                }

                // Fetch model details
                const modelPromises = modelIds.map(id => modelApi.getById(id));
                const modelResults = await Promise.all(modelPromises);
                setModels(modelResults);

                // Fetch comparison
                const comparisonResult = await modelInsightApi.compareModels(modelIds);
                setComparison(comparisonResult.comparative_analysis);
                setLoading(false);
            } catch (err) {
                setError('Failed to load comparison');
                setLoading(false);
            }
        };

        loadComparison();
    }, [searchParams]);

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
                <h2 className="text-2xl font-bold text-gray-900">Model Comparison</h2>
                <Link
                    to="/models"
                    className="text-blue-600 hover:text-blue-800"
                >
                    Back to Models
                </Link>
            </div>

            {error ? (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                        <div className="text-red-700">{error}</div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2">
                        {models.map(model => (
                            <div key={model.id} className="bg-white p-6 rounded-lg shadow">
                                <h3 className="text-lg font-medium">{model.name}</h3>
                                <p className="text-gray-500">{model.developer}</p>
                                {model.parameters && (
                                    <p className="text-sm text-gray-600">
                                        Parameters: {model.parameters.toLocaleString()}
                                    </p>
                                )}
                                {model.model_type && (
                                    <p className="text-sm text-gray-600">
                                        Type: {model.model_type}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-medium mb-4">Comparative Analysis</h3>
                        <div className="prose max-w-none">
                            {comparison.split('\n').map((paragraph, idx) => (
                                <p key={idx} className="mb-4">{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
