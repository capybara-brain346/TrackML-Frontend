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
    const [customPrompt, setCustomPrompt] = useState('');
    const [isComparing, setIsComparing] = useState(false);

    // Load models only once when component mounts
    useEffect(() => {
        const loadModels = async () => {
            try {
                const modelIds = searchParams.get('models')?.split(',').map(Number).filter(id => !isNaN(id)) || [];
                if (modelIds.length < 2) {
                    setError('Not enough models selected for comparison');
                    setLoading(false);
                    return;
                }

                const modelPromises = modelIds.map(id => modelApi.getById(id));
                const modelResults = await Promise.all(modelPromises);
                setModels(modelResults);
                setLoading(false);
            } catch (err) {
                setError('Failed to load models');
                setLoading(false);
            }
        };

        loadModels();
    }, [searchParams]);

    // Make initial comparison when models are loaded
    useEffect(() => {
        const makeInitialComparison = async () => {
            if (models.length >= 2 && !isComparing && !comparison) {
                try {
                    const modelIds = models.map(model => model.id);
                    const comparisonResult = await modelInsightApi.compareModels(modelIds);
                    setComparison(comparisonResult.comparative_analysis);
                } catch (err) {
                    setError('Failed to generate initial comparison');
                }
            }
        };

        makeInitialComparison();
    }, [models, isComparing, comparison]);

    // Handle custom prompt comparisons
    const handlePromptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!models.length) return;

        setIsComparing(true);
        try {
            const modelIds = models.map(model => model.id);
            const comparisonResult = await modelInsightApi.compareModels(modelIds, customPrompt);
            setComparison(comparisonResult.comparative_analysis);
        } catch (err) {
            setError('Failed to generate comparison');
        } finally {
            setIsComparing(false);
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
                        <form onSubmit={handlePromptSubmit} className="mb-6">
                            <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700 mb-2">
                                Custom Comparison Prompt
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="customPrompt"
                                    value={customPrompt}
                                    onChange={(e) => setCustomPrompt(e.target.value)}
                                    placeholder="Enter a custom prompt for comparison analysis..."
                                    className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={isComparing}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isComparing
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                        }`}
                                >
                                    {isComparing ? 'Comparing...' : 'Compare'}
                                </button>
                            </div>
                        </form>

                        <h3 className="text-lg font-medium mb-4">Comparative Analysis</h3>
                        <div className="prose max-w-none">
                            {isComparing ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                </div>
                            ) : (
                                (comparison || '').split('\n').map((paragraph, idx) => (
                                    <p key={idx} className="mb-4">{paragraph}</p>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
