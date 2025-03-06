"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Dog {
  id: string;
  img: string;
  name: string;
  age: number;
  zip_code: string;
  breed: string;
}

export default function MatchPage() {
  const { logout } = useAuth();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [matchedDog, setMatchedDog] = useState<Dog | null>(null);
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    const generateMatch = async () => {
      try {
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        
        if (!favorites.length) {
          setError("No favorited dogs found");
          setIsLoading(false);
          return;
        }
        
        console.log(`Generating match with ${favorites.length} favorited dogs`);
        
        const matchResponse = await fetch("https://frontend-take-home-service.fetch.com/dogs/match", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(favorites),
          credentials: "include",
        });
        
        console.log("Match API response status:", matchResponse.status);
        
        if (!matchResponse.ok) {
          if (matchResponse.status === 401) {
            console.log("Unauthorized when generating match, logging out");
            await logout();
            return;
          }
          const errorText = await matchResponse.text();
          console.error("Match API error:", errorText);
          throw new Error(`Failed to generate match: ${matchResponse.status}`);
        }
        
        const { match: matchId } = await matchResponse.json();
        console.log(`Matched with dog ID: ${matchId}`);

        const dogResponse = await fetch("https://frontend-take-home-service.fetch.com/dogs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([matchId]),
          credentials: "include",
        });
        
        console.log("Dog details API response status:", dogResponse.status);
        
        if (!dogResponse.ok) {
          const errorText = await dogResponse.text();
          console.error("Dog details API error:", errorText);
          throw new Error(`Failed to fetch matched dog details: ${dogResponse.status}`);
        }
        
        const [dog] = await dogResponse.json();
        console.log("Matched dog data:", dog);
        setMatchedDog(dog);
        setConfetti(true);
        setTimeout(() => setConfetti(false), 3000);
      } catch (err) {
        setError("Error generating match. Please try again.");
        console.error("Error in generateMatch:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateMatch();
  }, [logout]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Perfect Match</h1>
        <div className="space-x-2">
          <button
            onClick={() => router.push("/search")}
            className="text-sm bg-black-200 hover:bg-gray-300 px-4 py-2 rounded-md"
          >
            Back to Search
          </button>
          <button
            onClick={() => logout()}
            className="text-sm bg-black-200 hover:bg-gray-300 px-4 py-2 rounded-md"
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
      
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-500">Finding your perfect match...</p>
        </div>
      ) : matchedDog ? (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {confetti && (
            <div className="fixed inset-0 pointer-events-none z-50">
              {/* Simple CSS confetti effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="confetti-container">
                  {Array.from({ length: 50 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="confetti" 
                      style={{ 
                        '--x': `${Math.random() * 100}%`,
                        '--y': `${Math.random() * 100}%`, 
                        '--duration': `${Math.random() * 3 + 2}s`,
                        '--delay': `${Math.random() * 2}s`,
                        '--color': `hsl(${Math.random() * 360}, 100%, 70%)`,
                        '--size': `${Math.random() * 0.5 + 0.5}rem`,
                      } as React.CSSProperties}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <div className="relative h-80 w-full">
            <img
              src={matchedDog.img}
              alt={`Photo of ${matchedDog.name}`}
              className="object-cover w-full h-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = 'https://place-puppy.com/400x320'; // Fallback image
              }}
            />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-800">{matchedDog.name}</h2>
              <div className="px-4 py-2 bg-green-100 text-green-800 rounded-full">
                Perfect Match!
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Breed</h3>
                <p className="text-lg text-gray-800">{matchedDog.breed}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Age</h3>
                <p className="text-lg text-gray-800">
                  {matchedDog.age} {matchedDog.age === 1 ? 'year' : 'years'} old
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="text-lg text-gray-800">ZIP Code: {matchedDog.zip_code}</p>
              </div>
            </div>
            
            <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Congratulations! {matchedDog.name} is your perfect match. If this were a real adoption site, you&apos;d find contact information for the shelter here.
            </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${matchedDog.zip_code}`, '_blank')}
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Location
                </button>
                <button
                  onClick={() => router.push("/search")}
                  className="bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue Searching
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">
            No match found. Please go back and favorite some dogs first.
          </p>
          <button
            onClick={() => router.push("/search")}
            className="mt-4 bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Search
          </button>
        </div>
      )}
    </div>
  );
}