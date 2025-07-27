import { useEffect, useState } from "react";
import "./index.css";
import { PokemonCards } from "./PokemonCards";

// Theme Toggle Component
const ThemeToggle = ({ theme, toggleTheme }) => {
  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'light' ? (
        <>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
          Dark Mode
        </>
      ) : (
        <>
          <svg fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
          Light Mode
        </>
      )}
    </button>
  );
};

export const Pokemon = () => {
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [allPokemon, setAllPokemon] = useState([]);
  const [theme, setTheme] = useState('light');

  const POKEMON_PER_PAGE = 20;
  const TOTAL_POKEMON = 124;

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('pokemon-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('pokemon-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const fetchPokemon = async (page = 1) => {
    try {
      setLoading(true);
      const offset = (page - 1) * POKEMON_PER_PAGE;
      const API = `https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_PER_PAGE}&offset=${offset}`;
      
      const res = await fetch(API);
      const data = await res.json();

      const detailedPokemonData = data.results.map(async (curPokemon) => {
        const res = await fetch(curPokemon.url);
        const data = await res.json();
        return data;
      });

      const detailedResponses = await Promise.all(detailedPokemonData);
      setPokemon(detailedResponses);
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(error);
    }
  };

  const fetchAllPokemon = async () => {
    try {
      const API = `https://pokeapi.co/api/v2/pokemon?limit=${TOTAL_POKEMON}`;
      const res = await fetch(API);
      const data = await res.json();

      const detailedPokemonData = data.results.map(async (curPokemon) => {
        const res = await fetch(curPokemon.url);
        const data = await res.json();
        return data;
      });

      const detailedResponses = await Promise.all(detailedPokemonData);
      setAllPokemon(detailedResponses);
      setTotalPages(Math.ceil(TOTAL_POKEMON / POKEMON_PER_PAGE));
    } catch (error) {
      console.log(error);
      setError(error);
    }
  };

  useEffect(() => {
    fetchAllPokemon();
    fetchPokemon(1);
  }, []);

  // Search functionality
  const searchData = allPokemon.filter((curPokemon) =>
    curPokemon.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchPokemon(page);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  if (loading && pokemon.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h1>Loading Pokémon...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h1>Error: {error.message}</h1>
        <button onClick={() => fetchPokemon(currentPage)}>Try Again</button>
      </div>
    );
  }

  // Show search results or paginated results
  const displayData = search ? searchData : pokemon;
  const isSearching = search.length > 0;

  return (
    <>
      <section className="container">
        <header>
          <h1>Let's Catch Pokémon</h1>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </header>
        <div className="pokemon-search">
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        
        {isSearching && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p>Found {searchData.length} Pokémon matching "{search}"</p>
          </div>
        )}

        <div>
          <ul className="cards">
            {displayData.map((curPokemon) => {
              return (
                <PokemonCards key={curPokemon.id} pokemonData={curPokemon} />
              );
            })}
          </ul>
        </div>

        {/* Pagination - only show when not searching */}
        {!isSearching && totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="pagination-info">
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* Show message when no search results */}
        {isSearching && searchData.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <h2>No Pokémon found matching "{search}"</h2>
            <p>Try searching for a different Pokémon name</p>
          </div>
        )}
      </section>
    </>
  );
};