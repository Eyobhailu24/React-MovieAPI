import { useEffect, useState } from "react";
const Key="31ccb3d6";

export function useMovies(query){

    const [isLoading,setIsLoading] = useState(false);
      const [movies, setMovies] = useState([]);
      const [error, setError]= useState("");

    useEffect(function(){
        // fetch(`http://www.omdbapi.com/?apikey=${Key}&s=pirates of the caribbean`)
        // .then((res)=>res.json())
        // .then((data)=>setMovies(data.Search));
    
        const controller=new AbortController();
    
        async function fetchMovies(){
          try{
          setIsLoading(true);
          setError("")//to reset error thrown
          const res=await fetch(`http://www.omdbapi.com/?apikey=${Key}&s=${query}`,{signal:controller.signal});
    
          if(!res.ok)
            throw new Error('Couldnot fetch data');
          
          const data=await res.json();
    
          if(data.Response==='False')
            throw new Error('Movie not found')
    
          setMovies(data.Search);
          
        }
          catch(err){
            // console.err(err.message);
            if(err.name!=='AbortError'){
              setError(err.message);
            }
          }finally{
            setIsLoading(false);
            setError("");
          }
        } 
    
        if(query.length < 3){
          setMovies([]);
          setError('');
          return 
        }
    
        // callback?.();
        fetchMovies();
    
        return function(){
          controller.abort();
        }
    
      },[query])
      return {movies,isLoading,error}
}