import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";


const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const Key="31ccb3d6";

export default function App() {
  const [query, setQuery] = useState("");
  
  const [selectedId, setSelectedID]= useState(null);
  
  const {movies,isLoading,error}=useMovies(query);
  // const [watched, setWatched] = useState([]);

  const [watched,setWatched]=useLocalStorageState([],'watched');

 


  function handleSelectedID(id){
    // if(selectedId===id){
    //   setSelectedID(null);
    // }
    // else{
    //   setSelectedID(id);
    // }
    setSelectedID((selectedId)=>id===selectedId?null:id);
  }

  function handleCloseMovie(){
    setSelectedID(null);
  }

  function handleAddMovie(movie){
    setWatched((watched)=>[...watched,movie])
  }
  function handleDelete(id){
    setWatched((watched)=>watched.filter((movie)=>movie.imdbID!==id));
  }


  //Temporary Storage
  


  
  
  return (
    <>
      <NavBar>
        <Logo />  
        <Search query={query} setQuery={setQuery}/>
        <NumResults movies={movies}/>
      </NavBar>
      <Main>
        <Box>
          {isLoading && <Loading />}
          {!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectedID}/>}
          {error && <ErrorMessage message={error}/>}
          {/* {isLoading ?  <Loading/> : <MovieList movies={movies} />} */}
        </Box>
        {/* <WatchedBox /> */}
        <Box>
          {selectedId? <MoiveDetails 
          selectedId={selectedId} 
          onCloseMovie={handleCloseMovie} 
          onAddWatched={handleAddMovie}
          watched={watched}
          />
          
          :<>
            <MoviesSummary watched={watched} />
          <WatchedMoviesList watched={watched} handleDelete={handleDelete}/>
          </>
          }
        </Box>
      </Main>
      
    </>
  );
}

function Loading(){
  return <p className="loader">Loading...</p>
}

function ErrorMessage({message}){
  return (
  <p className="error">
    <span>💀</span> {message} 
  </p>)
}

function NavBar({children}){
  return (
  <nav className="nav-bar">
    {children}
  </nav>
  )
}


function Logo(){
  return(
  <div className="logo">
    <span role="img">🍿</span>
    <h1>usePopcorn</h1>
  </div>)
}

function Search({query,setQuery}){

  const inputEl = useRef(null)

  useKey('Enter',function(){
    if(document.activeElement===inputEl.current)
      return;
    inputEl.current.focus();
    setQuery('')
  })
  

  return (
    <input
    className="search"
    type="text"
    placeholder="Search movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    ref={inputEl}
  />
  )
}


function NumResults({movies}){
  return (
    <p className="num-results">
    Found <strong>{movies.length}</strong> results
  </p>
  )
}


function Main({children}){
  return (
      <main className="main">
        {children}
      </main>)
}

function Box({children}){
  
  const [isOpen1, setIsOpen1] = useState(true);
  return(
  <div className="box">
          <button
            className="btn-toggle"
            onClick={() => setIsOpen1((open) => !open)}
          >
            {isOpen1 ? "–" : "+"}
          </button>
          {isOpen1 && (children)}
        </div>)
}

// function WatchedBox(){
//   const [watched, setWatched] = useState(tempWatchedData);
//   const [isOpen2, setIsOpen2] = useState(true);

  
//   return(
//   <div className="box">
//           <button
//             className="btn-toggle"
//             onClick={() => setIsOpen2((open) => !open)}
//           >
//             {isOpen2 ? "–" : "+"}
//           </button>
//           {isOpen2 && ( 
//             <>
//               <MoviesSummary watched={watched} />
//               <WatchedMoviesList watched={watched}/>
              
//             </>
//           )}
//         </div>)
// }

function MoiveDetails({selectedId,onCloseMovie,onAddWatched,watched}){
  const [movie,setMovie]=useState({});
  const [isLoading,setIsLoading]=useState(false);
  const [userRating,setUserRating]=useState('');

  const countRef=useRef(0);

  useEffect(function(){
    if(userRating)countRef.current=countRef.current+1;
  },[userRating])

  const isWatched=watched.map((movie)=>movie.imdbID).includes(selectedId);
  const watchedUserRating=watched.find((movie)=>movie.imdbID===selectedId)?.userRating;
  

  const{
    Title:title,
    Year:year,
    Poster:poster,
    Runtime:runtime,
    imdbRating,
    Plot:plot,
    Released:released,
    Actors:actor,
    Director:director,
    Genra:genre,
    
  }=movie

 useKey('Escape',onCloseMovie);

  useEffect(function(){
    async function getMovieDetails(){
      setIsLoading(true);
      const res=await fetch(`http://www.omdbapi.com/?apikey=${Key}&i=${selectedId}`);
      const data=await res.json();
      setMovie(data)
      setIsLoading(false);
    }
    getMovieDetails();
  },[selectedId])


  useEffect(function(){
    if(!title) return
    document.title=`Movie | ${title}`;
    return function(){
      document.title='usePopcorn';
    }
  },[title])

    function handleAdd(){
      const newWatchedMovie={
        imdbID:selectedId,
        title,
        year,
        poster,
        imdbRating:Number(imdbRating),
        runtime:Number(runtime.split(" ").at(0)),
        userRating,
        countRating:countRef.current,
      }

      onAddWatched(newWatchedMovie);
      onCloseMovie();
    }

    

  return (
  <div className="details">
     {isLoading ? <Loading />:
      <>
    <header>
      <button 
      className="btn-back"
      onClick={onCloseMovie}>
        &larr;
      </button>
      <img src={poster} alt={`Poster of ${movie} movie`} />
      <div className="details-overview">
        <h2>{title}</h2>
        <p>
          {released} &bull; {runtime}
        </p>
        <p>{genre}</p>
        <p>
          <span>⭐</span>
          {imdbRating} IMDb rating
        </p>
      </div>
    </header>
    <section>
      <div className="rating">
        {!isWatched?
        <>
          <StarRating maxRating={10} size={24} onSetRating={setUserRating}/>
        {userRating > 0 && (<button className="btn-add" onClick={handleAdd}> + Add to list </button>)}
        </>
          :<p>You have Rated it {watchedUserRating}<span>⭐</span></p>
     }
     </div>
      <p>
        <em>{plot}</em>
      </p>
      <p>Starring {actor}</p>
      <p>Directed by {director}</p>
    </section>
        </>
}
    </div>)

}

function MovieList({movies,onSelectMovie}){
  return(
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movies movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie}/>
      ))}
    </ul>
  )
}

function Movies({movie,onSelectMovie}){
  return(
    <li onClick={()=>onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  )
}

function MoviesSummary({watched}){
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return(
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  )
}

function WatchedMoviesList({watched,handleDelete}){
  return(
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} handleDelete={handleDelete}/> 
      ))}
    </ul>
  )
}

function WatchedMovie({movie,handleDelete}){
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={()=>handleDelete(movie.imdbID)}>X</button>
      </div>
    </li>
  )
}