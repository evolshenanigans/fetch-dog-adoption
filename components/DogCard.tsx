import { useState } from "react";

interface DogCardProps {
  dog: {
    id: string;
    img: string;
    name: string;
    age: number;
    zip_code: string;
    breed: string;
  };
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function DogCard({ dog, isFavorite, onToggleFavorite }: DogCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        {!imageError ? (
          <img
            src={dog.img}
            alt={`Photo of ${dog.name}`}
            className="object-cover w-full h-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-500">Image unavailable</span>
          </div>
        )}
        <button
          onClick={() => onToggleFavorite(dog.id)}
          className="absolute top-2 right-2 p-2 bg-white bg-opacity-75 rounded-full shadow-sm hover:bg-opacity-100 transition-all"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill={isFavorite ? "red" : "none"}
            viewBox="0 0 24 24"
            stroke={isFavorite ? "red" : "currentColor"}
            strokeWidth={isFavorite ? 0 : 2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-1">{dog.name}</h3>
        <p className="text-gray-700 mb-2">{dog.breed}</p>
        <div className="flex justify-between text-sm text-gray-600">
          <span>{dog.age} {dog.age === 1 ? 'year' : 'years'} old</span>
          <span>ZIP: {dog.zip_code}</span>
        </div>
      </div>
    </div>
  );
}