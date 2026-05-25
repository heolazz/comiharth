import { MangaProvider } from "./types";
import { mangafireProvider } from "./mangafire";
import { mangadexProvider } from "./mangadex";
import { shinigamiProvider } from "./shinigami";

export const providers: Record<string, MangaProvider> = {
  shinigami: shinigamiProvider,
  mangadex: mangadexProvider,
  mangafire: mangafireProvider
};

export const getProvider = (name: string): MangaProvider => {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Provider not supported: ${name}`);
  }
  return provider;
};
