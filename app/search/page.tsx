"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DogCard from "@/components/DogCard";
import SearchFilters from "@/components/SearchFilters";
import Pagination from "@/components/Pagination";

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

interface SearchResults {
  resultIds: string[];
  total: number;
  next: string | null;
  prev: string | null;
}

export default function SearchPage() {
  const { logout, userInfo } = useAuth();
  const router = useRouter();
  const [breeds, setBreeds] = useState<string[]>([]);
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState("breed:asc");
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [ageMin, setAgeMin] = useState<number | "">("");
  const [ageMax, setAgeMax] = useState<number | "">("");
  const [zipCodes, setZipCodes] = useState<string[]>([]);

  const pageSize = 20;

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        console.log("Fetching dog breeds...");
        const response = await fetch("https://frontend-take-home-service.fetch.com/dogs/breeds", {
          credentials: "include",
        });
        
        console.log("Breeds API response status:", response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log("Unauthorized when fetching breeds, logging out");
            await logout();
            return;
          }
          throw new Error(`Failed to fetch breeds: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.length} breeds`);
        setBreeds(data);
      } catch (err) {
        setError("Error loading dog breeds. Please try again.");
        console.error("Error fetching breeds:", err);
      }
    };
    
    fetchBreeds();
  }, [logout]);

  useEffect(() => {
    const searchDogs = async () => {
      setIsLoading(true);
      
      try {
        const queryParams = new URLSearchParams();
        
        if (selectedBreeds.length > 0) {
          selectedBreeds.forEach(breed => {
            queryParams.append("breeds", breed);
          });
        }
        
        if (zipCodes.length > 0) {
          zipCodes.forEach(zip => {
            queryParams.append("zipCodes", zip);
          });
        }
        
        if (ageMin !== "") {
          queryParams.append("ageMin", ageMin.toString());
        }
        
        if (ageMax !== "") {
          queryParams.append("ageMax", ageMax.toString());
        }
        
        queryParams.append("sort", sortOrder);
        queryParams.append("size", pageSize.toString());
        
        const url = `https://frontend-take-home-service.fetch.com/dogs/search?${queryParams.toString()}`;
        console.log("Sending search request to:", url);
        
        const response = await fetch(url, {
          credentials: "include",
        });
        
        console.log("Search API response status:", response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log("Unauthorized when searching dogs, logging out");
            await logout();
            return;
          }
          const errorText = await response.text();
          console.error("Search API error response:", errorText);
          throw new Error(`Failed to search dogs: ${response.status}`);
        }
        
        const searchResults: SearchResults = await response.json();
        console.log(`Search returned ${searchResults.resultIds.length} dog IDs out of ${searchResults.total} total`);
        setResults(searchResults);
        
        if (searchResults.resultIds.length > 0) {
          console.log("Fetching details for", searchResults.resultIds.length, "dogs");
          
          const dogResponse = await fetch("https://frontend-take-home-service.fetch.com/dogs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(searchResults.resultIds),
            credentials: "include",
          });
          
          console.log("Dog details API response status:", dogResponse.status);
          
          if (!dogResponse.ok) {
            const errorText = await dogResponse.text();
            console.error("Dog details API error:", errorText);
            throw new Error(`Failed to fetch dog details: ${dogResponse.status}`);
          }
          
          const dogData: Dog[] = await dogResponse.json();
          console.log(`Received data for ${dogData.length} dogs`);
          setDogs(dogData);
        } else {
          console.log("No dog IDs returned in search results");
          setDogs([]);
        }
      } catch (err) {
        setError("Error searching for dogs. Please try again.");
        console.error("Error in searchDogs:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    searchDogs();
  }, [selectedBreeds, sortOrder, currentPage, logout, ageMin, ageMax, zipCodes]);

  const handleBreedSelection = (breeds: string[]) => {
    console.log("Selected breeds changed:", breeds);
    setSelectedBreeds(breeds);
    setCurrentPage(1);
  };

  const handleSortChange = (newSortOrder: string) => {
    console.log("Sort order changed to:", newSortOrder);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  const handleAgeChange = (min: number | "", max: number | "") => {
    console.log(`Age range changed to: ${min} - ${max}`);
    setAgeMin(min);
    setAgeMax(max);
    setCurrentPage(1);
  };

  const handleZipCodesChange = (newZipCodes: string[]) => {
    console.log("ZIP codes changed:", newZipCodes);
    setZipCodes(newZipCodes);
    setCurrentPage(1);
  };

  const handlePageChange = async (newPage: number) => {
    if (!results) return;
    
    console.log(`Changing to page ${newPage} from ${currentPage}`);
    setIsLoading(true);
    
    try {
      let cursorUrl = newPage > currentPage 
        ? results.next 
        : results.prev;
      
      if (!cursorUrl) {
        throw new Error("No more pages in that direction");
      }
      
      console.log("Using cursor URL:", cursorUrl);
      
      const url = new URL(cursorUrl, "https://frontend-take-home-service.fetch.com");
      const fromParam = url.searchParams.get("from");
      
      if (!fromParam) {
        throw new Error("Invalid cursor");
      }
      
      console.log("Using 'from' parameter:", fromParam);
      
      const queryParams = new URLSearchParams();
      
      if (selectedBreeds.length > 0) {
        selectedBreeds.forEach(breed => {
          queryParams.append("breeds", breed);
        });
      }
      
      if (zipCodes.length > 0) {
        zipCodes.forEach(zip => {
          queryParams.append("zipCodes", zip);
        });
      }
      
      if (ageMin !== "") {
        queryParams.append("ageMin", ageMin.toString());
      }
      
      if (ageMax !== "") {
        queryParams.append("ageMax", ageMax.toString());
      }
      
      queryParams.append("sort", sortOrder);
      queryParams.append("size", pageSize.toString());
      
      queryParams.append("from", fromParam);
      
      const apiUrl = `https://frontend-take-home-service.fetch.com/dogs/search?${queryParams.toString()}`;
      console.log("Pagination request URL:", apiUrl);
      
      const response = await fetch(apiUrl, {
        credentials: "include",
      });
      
      console.log("Pagination response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized when paginating, logging out");
          await logout();
          return;
        }
        const errorText = await response.text();
        console.error("Pagination API error:", errorText);
        throw new Error(`Failed to fetch page: ${response.status}`);
      }
      
      const searchResults: SearchResults = await response.json();
      console.log(`Pagination returned ${searchResults.resultIds.length} dog IDs`);
      setResults(searchResults);
      
      if (searchResults.resultIds.length > 0) {
        console.log("Fetching dog details after pagination");
        
        const dogResponse = await fetch("https://frontend-take-home-service.fetch.com/dogs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(searchResults.resultIds),
          credentials: "include",
        });
        
        console.log("Dog details after pagination - response status:", dogResponse.status);
        
        if (!dogResponse.ok) {
          const errorText = await dogResponse.text();
          console.error("Dog details API error after pagination:", errorText);
          throw new Error(`Failed to fetch dog details: ${dogResponse.status}`);
        }
        
        const dogData: Dog[] = await dogResponse.json();
        console.log(`Received data for ${dogData.length} dogs after pagination`);
        setDogs(dogData);
      } else {
        console.log("No dog IDs returned in pagination results");
        setDogs([]);
      }
      
      setCurrentPage(newPage);
    } catch (err) {
      setError("Error changing page. Please try again.");
      console.error("Error in pagination:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (dogId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(dogId)) {
        newFavorites.delete(dogId);
        console.log(`Removed dog ${dogId} from favorites`);
      } else {
        newFavorites.add(dogId);
        console.log(`Added dog ${dogId} to favorites`);
      }
      return newFavorites;
    });
  };

  const generateMatch = async () => {
    if (favorites.size === 0) {
      setError("Please add at least one dog to your favorites first");
      return;
    }
    
    try {
      const favoriteIds = Array.from(favorites);
      console.log(`Generating match from ${favoriteIds.length} favorites`);
      
      localStorage.setItem("favorites", JSON.stringify(favoriteIds));
      
      router.push("/match");
    } catch (err) {
      setError("Error preparing match. Please try again.");
      console.error("Error generating match:", err);
    }
  };

  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites) {
        const favoriteIds = JSON.parse(storedFavorites);
        setFavorites(new Set(favoriteIds));
        console.log(`Loaded ${favoriteIds.length} favorites from localStorage`);
      }
    } catch (err) {
      console.error("Error loading favorites from localStorage:", err);
    }
  }, []);

  useEffect(() => {
    if (favorites.size > 0) {
      localStorage.setItem("favorites", JSON.stringify(Array.from(favorites)));
      console.log(`Saved ${favorites.size} favorites to localStorage`);
    }
  }, [favorites]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Find Your Perfect Dog</h1>
        <div className="flex items-center gap-4">
          {userInfo && (
            <span className="text-gray-600">
              Hello, {userInfo.name}
            </span>
          )}
          <button
            onClick={() => logout()}
            className="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with filters */}
        <div className="lg:col-span-1">
          <SearchFilters 
            allBreeds={breeds}
            selectedBreeds={selectedBreeds}
            onBreedsChange={handleBreedSelection}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            ageMin={ageMin}
            ageMax={ageMax}
            onAgeChange={handleAgeChange}
            zipCodes={zipCodes}
            onZipCodesChange={handleZipCodesChange}
          />
          
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Favorites</h2>
            <p className="text-gray-600 mb-4">
              {favorites.size} dog{favorites.size !== 1 ? 's' : ''} in your favorites
            </p>
            <button
              onClick={generateMatch}
              disabled={favorites.size === 0}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Find My Match
            </button>
          </div>
        </div>
        
        {/* Main content */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-500">Loading dogs...</p>
            </div>
          ) : dogs.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <h2 className="text-xl font-semibold text-gray-700">No dogs found</h2>
              <p className="text-gray-500 mt-2">
                Try adjusting your filters to see more results
              </p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <p className="text-gray-600">
                  Showing {dogs.length} of {results?.total || 0} dogs
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dogs.map(dog => (
                  <DogCard
                    key={dog.id}
                    dog={dog}
                    isFavorite={favorites.has(dog.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
              
              {results && (
                <Pagination
                  currentPage={currentPage}
                  hasNextPage={!!results.next}
                  hasPrevPage={!!results.prev}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}