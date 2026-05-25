import { ComicSearchResult } from "@/lib/providers/types";
import ComicCard from "./ComicCard";

interface ComicSliderProps {
  comics: ComicSearchResult[];
}

export default function ComicSlider({ comics }: ComicSliderProps) {
  if (comics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-text">No comics found.</p>
      </div>
    );
  }

  return (
    <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 hide-scrollbar snap-x snap-mandatory">
      {comics.map((comic) => (
        <ComicCard 
          key={`${comic.provider}-${comic.id}`} 
          comic={comic} 
          className="w-[140px] md:w-[160px] lg:w-[180px] shrink-0 snap-start"
        />
      ))}
    </div>
  );
}
