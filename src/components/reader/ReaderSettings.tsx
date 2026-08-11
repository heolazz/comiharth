"use client";

import { Settings, Sliders, Monitor, Paintbrush } from "lucide-react";

export type ReaderPreferences = {
  width: "fit" | "720px" | "900px" | "1200px";
  mode: "vertical" | "single";
  theme: "auto" | "black" | "gray" | "white";
};

interface ReaderSettingsProps {
  preferences: ReaderPreferences;
  onChange: (prefs: ReaderPreferences) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReaderSettings({
  preferences,
  onChange,
  isOpen,
  onClose,
}: ReaderSettingsProps) {
  if (!isOpen) return null;

  const updatePreference = (key: keyof ReaderPreferences, value: string) => {
    onChange({
      ...preferences,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm rounded-2xl border border-border-dark bg-surface p-6 shadow-2xl z-10 glow-green-sm transition-colors duration-300">
        <h3 className="text-lg font-display font-extrabold text-foreground flex items-center gap-2 mb-6">
          <Settings className="h-5 w-5 text-accent-green" />
          Reader Customization
        </h3>

        <div className="flex flex-col gap-5">
          {/* Reading Mode */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5" />
              Reading Mode
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updatePreference("mode", "vertical")}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  preferences.mode === "vertical"
                    ? "bg-accent-green/10 text-accent-green border-accent-green"
                    : "bg-surface-hover text-muted-text border-transparent hover:text-foreground"
                }`}
              >
                Webtoon (Vertical)
              </button>
              <button
                onClick={() => updatePreference("mode", "single")}
                className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  preferences.mode === "single"
                    ? "bg-accent-green/10 text-accent-green border-accent-green"
                    : "bg-surface-hover text-muted-text border-transparent hover:text-foreground"
                }`}
              >
                Manga (Single Page)
              </button>
            </div>
          </div>

          {/* Width */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
              <Monitor className="h-3.5 w-3.5" />
              Container Width
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(["fit", "720px", "900px", "1200px"] as const).map((widthVal) => (
                <button
                  key={widthVal}
                  onClick={() => updatePreference("width", widthVal)}
                  className={`py-2 rounded-xl text-[10px] uppercase font-extrabold border transition-all cursor-pointer ${
                    preferences.width === widthVal
                      ? "bg-accent-green/10 text-accent-green border-accent-green"
                      : "bg-surface-hover text-muted-text border-transparent hover:text-foreground"
                  }`}
                >
                  {widthVal === "fit" ? "Full" : widthVal}
                </button>
              ))}
            </div>
          </div>

          {/* Theme / Background */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-text flex items-center gap-1.5">
              <Paintbrush className="h-3.5 w-3.5" />
              Page Background
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { val: "auto", label: "Auto", bg: "bg-background" },
                { val: "black", label: "Black", bg: "bg-black" },
                { val: "gray", label: "Charcoal", bg: "bg-zinc-800" },
                { val: "white", label: "Light", bg: "bg-zinc-100" }
              ].map((bgOption) => (
                <button
                  key={bgOption.val}
                  onClick={() => updatePreference("theme", bgOption.val)}
                  className={`py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                    preferences.theme === bgOption.val
                      ? "bg-accent-green/10 text-accent-green border-accent-green"
                      : "bg-surface-hover text-muted-text border-transparent hover:text-foreground"
                  }`}
                >
                  {bgOption.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl bg-accent-green hover:bg-green-600 text-white text-xs font-bold shadow-lg transition-colors cursor-pointer"
        >
          Apply Preferences
        </button>
      </div>
    </div>
  );
}
