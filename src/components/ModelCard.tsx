import { Link } from 'react-router-dom';
import { ModelEntry } from '../types';

export interface ModelCardProps {
    model: ModelEntry;
    onDelete: (id: number) => void;
    onSelect?: (selected: boolean) => void;
    isSelected?: boolean;
}

export const ModelCard = ({ model, onDelete, onSelect, isSelected }: ModelCardProps) => {
    const statusColors = {
        Tried: 'bg-green-100 text-green-800',
        Studying: 'bg-blue-100 text-blue-800',
        Wishlist: 'bg-yellow-100 text-yellow-800',
        Archived: 'bg-gray-100 text-gray-800',
    };

    return (
        <div className={`bg-white p-6 rounded-lg shadow-sm border ${isSelected ? 'border-blue-500' : 'border-gray-200'}`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                        <Link to={`/models/${model.id}`} className="hover:text-blue-600">
                            {model.name}
                        </Link>
                    </h3>
                    {model.developer && (
                        <p className="text-sm text-gray-600">Developer: {model.developer}</p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {onSelect && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => onSelect(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    )}
                    <button
                        onClick={() => onDelete(model.id)}
                        className="text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>
                </div>
            </div>
            <div className="mt-2">
                {model.model_type && (
                    <p className="text-sm text-gray-600">Type: {model.model_type}</p>
                )}
                {model.status && (
                    <p className="text-sm text-gray-600">Status: {model.status}</p>
                )}
                {model.parameters && (
                    <p className="text-sm text-gray-600">
                        Parameters: {model.parameters.toLocaleString()}
                    </p>
                )}
                {model.tags && model.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {model.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};