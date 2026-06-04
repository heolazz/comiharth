import { MangaProvider } from "./types";
import { mangafireProvider } from "./mangafire";
import { mangadexProvider } from "./mangadex";
import { shinigamiProvider } from "./shinigami";
import { finalKomikcastProvider } from "./komikcast";

export const providers: Record<string, MangaProvider> = {
  shinigami: shinigamiProvider,
  mangadex: mangadexProvider,
  mangafire: mangafireProvider,
  komikcast: finalKomikcastProvider
};

export const getProvider = (name: string): MangaProvider => {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Provider not supported: ${name}`);
  }
  return provider;
};
