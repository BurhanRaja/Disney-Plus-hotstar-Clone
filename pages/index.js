import dynamic from "next/dynamic";
import CardSlider from "../components/CardSlider";
import Layout from "../components/Layout";

const Hero = dynamic(() => import("../components/Hero"), {
  ssr: false,
});

export default function Home({ allLatest, genres, popularMovies, popularTV }) {
  console.log(popularTV);
  return (
    <Layout>
      <main>
        <Hero data={allLatest} genres={genres} />
        <CardSlider data={allLatest} genres={genres} type="Latest & Trending" />
        <CardSlider
          data={popularMovies}
          genres={genres}
          type="Popular Movies"
        />
        <CardSlider data={popularTV} genres={genres} type="Popular Shows" />
      </main>
    </Layout>
  );
}

export async function getServerSideProps() {
  // ! Get Genres
  const movieGenreUrl = `${process.env.NEXT_PUBLIC_MOVIE_URL}genre/movie/list?api_key=${process.env.NEXT_PUBLIC_API_KEY}`;
  const tvGenreUrl = `${process.env.NEXT_PUBLIC_MOVIE_URL}genre/tv/list?api_key=${process.env.NEXT_PUBLIC_API_KEY}`;
  // Promise Request
  const [genreMovieRes, genreTVRes] = await Promise.all([
    fetch(movieGenreUrl),
    fetch(tvGenreUrl),
  ]);
  // Promise Json
  let [genreMovie, genreTV] = await Promise.all([
    genreMovieRes.json(),
    genreTVRes.json(),
  ]);
  // All Genres
  let genres = [...genreMovie.genres];
  for (let i = 0; i < genreTV.genres.length; i++) {
    let same = genres.find((el) => el.id === genreTV.genres[i].id);
    if (!same) {
      genres.push(genreTV.genres[i]);
    }
  }

  // ! Getting Movies and TV Shows
  const MovieUrl = (sort_by, with_original_lang, with_watch_providers) =>
    `${process.env.NEXT_PUBLIC_MOVIE_URL}discover/movie?api_key=${process.env.NEXT_PUBLIC_API_KEY}&language=en-US&sort_by=${sort_by}&include_adult=false&include_video=false&page=1&with_original_language=${with_original_lang}&with_watch_providers=${with_watch_providers}&watch_region=IN&with_watch_monetization_types=flatrate`;

  const TVUrl = (sort_by, with_original_lang, with_watch_providers) =>
    `${process.env.NEXT_PUBLIC_TV_URL}discover/tv?api_key=${process.env.NEXT_PUBLIC_API_KEY}&language=en-US&sort_by=${sort_by}&include_adult=false&include_video=false&page=1&with_original_language=${with_original_lang}&with_watch_providers=${with_watch_providers}&watch_region=IN&with_watch_monetization_types=flatrate`;

  // ? Latest - Movies and TVs
  const [latestMoviesRes, latestTVRes] = await Promise.all([
    fetch(MovieUrl("release_date.desc", "hi", "122")),
    fetch(TVUrl("release_date.desc", "hi", "122")),
  ]);
  let [latestMovies, latestTV] = await Promise.all([
    latestMoviesRes.json(),
    latestTVRes.json(),
  ]);
  latestMovies = latestMovies.results.filter(
    (el) => new Date(el.release_date) < new Date("2023-01-01")
  );
  latestTV = latestTV.results;
  // For getting all the latest movies and TV shows together
  let allLatest = [];
  for (let i = 0; i < 16; i++) {
    allLatest.push(latestMovies[i]);
    allLatest.push(latestTV[i]);
  }

  // TODO: Popular Shows
  // TODO: Popular Movies
  const [popularMoviesRes, popularTVRes] = await Promise.all([
    fetch(MovieUrl("popularity.desc", "hi", "122")),
    fetch(TVUrl("popularity.desc", "hi", "122")),
  ]);
  let [popularMovies, popularTV] = await Promise.all([
    popularMoviesRes.json(),
    popularTVRes.json(),
  ]);
  popularMovies = popularMovies.results;
  popularTV = popularTV.results;

  // TODO: Mystery
  // TODO: Superheroes
  // TODO: Best for kids
  // TODO: Drama
  // TODO: Romance
  // TODO: Crime
  // TODO: Comedy
  // TODO: Documentary

  return {
    props: {
      allLatest: allLatest,
      genres: genres,
      // Latest
      latestMovies: latestMovies,
      latestTV: latestTV,
      // Popular
      popularMovies: popularMovies,
      popularTV: popularTV,
    },
  };
}
