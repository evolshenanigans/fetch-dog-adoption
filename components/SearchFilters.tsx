import { useState } from "react";

interface SearchFiltersProps {
  allBreeds: string[];
  selectedBreeds: string[];
  onBreedsChange: (breeds: string[]) => void;
  sortOrder: string;
  onSortChange: (sortOrder: string) => void;
  ageMin: number | "";
  ageMax: number | "";
  onAgeChange: (min: number | "", max: number | "") => void;
  zipCodes: string[];
  onZipCodesChange: (zipCodes: string[]) => void;
}

export default function SearchFilters({
  allBreeds,
  selectedBreeds,
  onBreedsChange,
  sortOrder,
  onSortChange,
  ageMin,
  ageMax,
  onAgeChange,
  zipCodes,
  onZipCodesChange,
}: SearchFiltersProps) {
  const [breedSearchTerm, setBreedSearchTerm] = useState("");
  const [showBreeds, setShowBreeds] = useState(false);
  const [zipCodeInput, setZipCodeInput] = useState("");
  const [showAgeFilter, setShowAgeFilter] = useState(false);
  const [showZipFilter, setShowZipFilter] = useState(false);
  
  const filteredBreeds = allBreeds.filter(breed => 
    breed.toLowerCase().includes(breedSearchTerm.toLowerCase())
  );

  const toggleBreed = (breed: string) => {
    if (selectedBreeds.includes(breed)) {
      onBreedsChange(selectedBreeds.filter(b => b !== breed));
    } else {
      onBreedsChange([...selectedBreeds, breed]);
    }
  };

  const addZipCode = () => {
    if (zipCodeInput && !zipCodes.includes(zipCodeInput)) {
      onZipCodesChange([...zipCodes, zipCodeInput]);
      setZipCodeInput("");
    }
  };

  const removeZipCode = (zip: string) => {
    onZipCodesChange(zipCodes.filter(z => z !== zip));
  };

  const handleAgeMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : Number(e.target.value);
    onAgeChange(value, ageMax);
  };

  const handleAgeMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? "" : Number(e.target.value);
    onAgeChange(ageMin, value);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-semibold mb-4">Filters</h2>
      
      {/* Sort Order */}
      <div className="mb-6">
        <h3 className="text-gray-700 font-medium mb-2">Sort By</h3>
        <select
          value={sortOrder}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="breed:asc">Breed (A-Z)</option>
          <option value="breed:desc">Breed (Z-A)</option>
          <option value="name:asc">Name (A-Z)</option>
          <option value="name:desc">Name (Z-A)</option>
          <option value="age:asc">Age (Youngest First)</option>
          <option value="age:desc">Age (Oldest First)</option>
        </select>
      </div>
      
      {/* Age Range Filter */}
      <div className="mb-6">
        <button
          onClick={() => setShowAgeFilter(!showAgeFilter)}
          className="flex justify-between w-full items-center text-gray-700 font-medium mb-2"
        >
          <span>Age Range</span>
          <span className="text-xs text-gray-500">
            {ageMin !== "" || ageMax !== "" ? `${ageMin !== "" ? ageMin : 'Any'} - ${ageMax !== "" ? ageMax : 'Any'}` : 'All Ages'}
          </span>
        </button>
        
        {showAgeFilter && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1/2">
                <label className="text-sm text-gray-600">Min Age</label>
                <input
                  type="number"
                  min="0"
                  value={ageMin === "" ? "" : ageMin}
                  onChange={handleAgeMinChange}
                  placeholder="Min"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
              <div className="w-1/2">
                <label className="text-sm text-gray-600">Max Age</label>
                <input
                  type="number"
                  min="0"
                  value={ageMax === "" ? "" : ageMax}
                  onChange={handleAgeMaxChange}
                  placeholder="Max"
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              </div>
            </div>
            
            {(ageMin !== "" || ageMax !== "") && (
              <button
                onClick={() => onAgeChange("", "")}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear Age Filter
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* ZIP Code Filter */}
      <div className="mb-6">
        <button
          onClick={() => setShowZipFilter(!showZipFilter)}
          className="flex justify-between w-full items-center text-gray-700 font-medium mb-2"
        >
          <span>ZIP Codes</span>
          <span className="text-xs text-gray-500">
            {zipCodes.length ? `${zipCodes.length} selected` : 'All Locations'}
          </span>
        </button>
        
        {showZipFilter && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter ZIP code"
                value={zipCodeInput}
                onChange={(e) => setZipCodeInput(e.target.value)}
                className="flex-1 border border-gray-300 rounded-md p-2"
                maxLength={5}
                pattern="\d{5}"
              />
              <button
                onClick={addZipCode}
                className="bg-indigo-600 text-white p-2 rounded-md hover:bg-indigo-700"
                disabled={!zipCodeInput || zipCodeInput.length !== 5}
              >
                Add
              </button>
            </div>
            
            {zipCodes.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {zipCodes.map(zip => (
                    <div key={zip} className="bg-gray-100 px-2 py-1 rounded-md flex items-center">
                      <span className="text-sm text-gray-700">{zip}</span>
                      <button
                        onClick={() => removeZipCode(zip)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onZipCodesChange([])}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Clear All ZIP Codes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Breed Filter */}
      <div>
        <button
          onClick={() => setShowBreeds(!showBreeds)}
          className="flex justify-between w-full items-center text-gray-700 font-medium mb-2"
        >
          <span>Breeds</span>
          <span className="text-xs text-gray-500">
            {selectedBreeds.length ? `${selectedBreeds.length} selected` : 'All Breeds'}
          </span>
        </button>
        
        {showBreeds && (
          <div className="mb-4">
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search breeds..."
                value={breedSearchTerm}
                onChange={(e) => setBreedSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              {filteredBreeds.length === 0 ? (
                <div className="p-2 text-gray-500 text-sm">No breeds match your search</div>
              ) : (
                filteredBreeds.map(breed => (
                  <div key={breed} className="border-b border-gray-100 last:border-b-0">
                    <label className="flex items-center px-3 py-2 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedBreeds.includes(breed)}
                        onChange={() => toggleBreed(breed)}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 truncate">{breed}</span>
                    </label>
                  </div>
                ))
              )}
            </div>
            
            {selectedBreeds.length > 0 && (
              <button
                onClick={() => onBreedsChange([])}
                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Clear All Breeds
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}