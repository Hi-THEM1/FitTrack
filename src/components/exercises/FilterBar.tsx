import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedFilter: string;
  setSelectedFilter: (val: string) => void;
}

export default function FilterBar({ searchQuery, setSearchQuery, selectedFilter, setSelectedFilter }: FilterBarProps) {
  const { language } = useLanguage();
  const lang = language as 'en' | 'fr';

  const categories = [
    { id: 'All', label: { en: 'All', fr: 'Tous' } },
    { id: 'Chest', label: { en: 'Chest', fr: 'Pectoraux' } },
    { id: 'Back', label: { en: 'Back', fr: 'Dos' } },
    { id: 'Legs', label: { en: 'Legs', fr: 'Jambes' } },
    { id: 'Shoulders', label: { en: 'Shoulders', fr: 'Épaules' } },
    { id: 'Abs', label: { en: 'Abs', fr: 'Abdominaux' } },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={lang === 'fr' ? "Rechercher un exercice..." : "Search exercises..."}
          className="w-full bg-surface/50 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-text-main placeholder:text-text-muted focus:outline-none focus:border-primary/50 focus:bg-surface transition-all shadow-sm"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedFilter(cat.id)}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
              selectedFilter === cat.id
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'bg-surface/50 text-text-muted border border-white/5 hover:border-white/10 hover:text-text-main'
            }`}
          >
            {cat.label[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}
