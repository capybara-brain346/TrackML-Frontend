import { Link } from 'react-router-dom';
import { ModelEntry } from '../types';

interface ModelCardProps {
    model: ModelEntry;
    onDelete?: (id: number) => void;
    selectable?: boolean;
    selected?: boolean;
    onSelectionChange?: (id: number, selected: boolean) => void;
}

export const ModelCard = ({ model, onDelete, selectable, selected, onSelectionChange }: ModelCardProps) => {
    const statusColors = {
        Tried: 'bg-green-100 text-green-800',
        Studying: 'bg-blue-100 text-blue-800',
        Wishlist: 'bg-yellow-100 text-yellow-800',
        Archived: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex justify-between items-start">
                    {selectable && (
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => onSelectionChange?.(model.id, e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                        />
                    )}
                    <div>
                        <Link to={`/models/${model.id}`}>
                            <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                                {model.name}
                            </h3>
                        </Link>
                        {model.developer && (
                            <p className="mt-1 text-sm text-gray-500">by {model.developer}</p>
                        )}
                    </div>
                    {model.status && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[model.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
                            }`}>
                            {model.status}
                        </span>
                    )}
                </div>

                {model.notes && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{model.notes}</p>
                )}

                {model.tags && model.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {model.tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-gray-500">
                    {model.model_type && (
                        <div>
                            <span className="font-medium">Type:</span> {model.model_type}
                        </div>
                    )}
                    {model.parameters && (
                        <div>
                            <span className="font-medium">Parameters:</span>{' '}
                            {model.parameters.toLocaleString()}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div>
                        Last Interaction:{' '}
                        {model.date_interacted
                            ? new Date(model.date_interacted).toLocaleDateString()
                            : 'N/A'}
                    </div>
                    {onDelete && (
                        <button
                            onClick={() => onDelete(model.id)}
                            className="text-red-600 hover:text-red-800"
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};