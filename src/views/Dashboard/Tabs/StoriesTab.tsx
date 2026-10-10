import React from 'react';
import { Search, Plus, Eye, Edit3, Trash2, BookOpen } from 'lucide-react';
import { BlogPost } from '../../../types';

interface StoriesTabProps {
  tHis: any;
  tGen: any;
  storySearch: string;
  setStorySearch: (val: string) => void;
  handleOpenCreateStory: () => void;
  filteredStories: BlogPost[];
  handleNavigate: (page: string, params?: any) => void;
  handleOpenEditStory: (story: BlogPost) => void;
  handleTriggerDeleteStory: (story: BlogPost) => void;
}

export function StoriesTab({
  tHis, tGen, storySearch, setStorySearch, handleOpenCreateStory,
  filteredStories, handleNavigate, handleOpenEditStory, handleTriggerDeleteStory
}: StoriesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-[rgba(63,67,77,0.08)] shadow-sm">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder={tHis.buscarPlaceholder}
            value={storySearch}
            onChange={(e) => setStorySearch(e.target.value)}
            className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] py-2 pl-9 pr-3 rounded-xl text-xs outline-none focus:border-[#3D7A95]"
          />
          <Search className="h-4 w-4 text-[#6E727C] absolute left-3 top-2.5" />
        </div>

        <button
          onClick={handleOpenCreateStory}
          className="py-2.5 px-5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-white hover:bg-[#888B47] shadow-md transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          {tHis.botonNueva}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map((story) => (
          <div
            key={story.id}
            className="bg-white rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.08)] shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                <span className="absolute top-3 left-3 bg-white text-[#3F434D] font-bold text-[10px] tracking-wider uppercase py-1 px-3 rounded-full shadow-md">
                  {story.category}
                </span>
              </div>

              <div className="p-5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1">
                  {story.publishedDate} · {story.readTime}
                </div>
                <h3 className="font-display font-medium text-xl text-[#3F434D] mb-2 leading-snug">
                  {story.title}
                </h3>
                <p className="text-xs text-[#6E727C] line-clamp-3 leading-relaxed mb-4">
                  {story.excerpt}
                </p>
                <div className="text-[10px] text-[#A7AB5E] font-semibold">
                  Por {story.author}
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#FBF7EC] border-t border-[rgba(63,67,77,0.06)] flex items-center justify-between gap-2">
              <button
                onClick={() => handleNavigate('blog')}
                className="py-1.5 px-3 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#F5EFE0] rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#3D7A95] flex items-center gap-1 transition-colors"
              >
                <Eye className="h-3 w-3" /> {tHis.verEnBlog}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditStory(story)}
                  className="py-1.5 px-3 bg-white border border-[rgba(63,67,77,0.1)] hover:bg-[#3F434D] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#3F434D] flex items-center gap-1 transition-all"
                >
                  <Edit3 className="h-3 w-3" /> {tGen.editar}
                </button>

                <button
                  onClick={() => handleTriggerDeleteStory(story)}
                  className="h-8 w-8 rounded-xl bg-white border border-[rgba(63,67,77,0.1)] hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors"
                  title={tGen.eliminar}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-[rgba(63,67,77,0.08)] p-8">
          <BookOpen className="h-10 w-10 text-[#6E727C] mx-auto mb-3" />
          <h4 className="font-display font-medium text-lg text-[#3F434D] mb-1">
            {tGen.sinResultados}
          </h4>
          <p className="text-xs text-[#6E727C] mb-4">
            Comparte rincones secretos de Gran Canaria, senderos y recomendaciones con tus huéspedes.
          </p>
          <button
            onClick={handleOpenCreateStory}
            className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-white hover:bg-[#888B47]"
          >
            + {tHis.botonNueva}
          </button>
        </div>
      )}
    </div>
  );
}
