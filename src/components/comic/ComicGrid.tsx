import { ComicSearchResult } from "@/lib/providers/types";
import ComicCard from "./ComicCard";

interface ComicGridProps {
  comics: ComicSearchResult[];
}

export default function ComicGrid({ comics }: ComicGridProps) {
  if (comics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-text">No comics found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
      {comics.map((comic) => (
        <ComicCard key={`${comic.provider}-${comic.id}`} comic={comic} />
      ))}
    </div>
  );
}
