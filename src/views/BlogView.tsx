import React, { useState } from 'react';
import { BlogPost } from '../types';
import { ArrowLeft } from 'lucide-react';

interface BlogViewProps {
  blogPosts: BlogPost[];
}

export function BlogView({ blogPosts }: BlogViewProps) {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const selectedPost = blogPosts.find(p => p.id === selectedPostId);

  if (selectedPost) {
    return (
      <div className="animate-fade-in py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <button 
          onClick={() => setSelectedPostId(null)}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#6E727C] hover:text-[#3D7A95] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to stories
        </button>
        
        <div className="mb-10 text-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] bg-[#CFE4EC] px-4 py-1.5 rounded-full mb-6 inline-block">
            {selectedPost.category}
          </span>
          <h1 className="font-display font-light text-4xl sm:text-6xl text-[#3F434D] tracking-tight mt-4">
            {selectedPost.title}
          </h1>
          <p className="text-sm font-light text-[#6E727C] mt-4 max-w-2xl mx-auto leading-relaxed">
            {selectedPost.subtitle || selectedPost.excerpt}
          </p>
          
          <div className="mt-8 flex justify-center items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">
            <span>By {selectedPost.author}</span>
            <span>•</span>
            <span>{selectedPost.publishedDate}</span>
            <span>•</span>
            <span>{selectedPost.readTime}</span>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden mb-12 border border-[rgba(63,67,77,0.06)] shadow-sm">
          <img src={selectedPost.image} alt={selectedPost.title} className="w-full h-auto object-cover max-h-[600px]" />
        </div>

        <div className="prose prose-sm sm:prose-base prose-slate max-w-none text-[#3F434D] font-light leading-relaxed">
          {selectedPost.content.split('\n').map((paragraph, i) => (
            paragraph.trim() ? <p key={i} className="mb-4">{paragraph}</p> : null
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] bg-[#CFE4EC] px-4 py-1.5 rounded-full">Explore Local Culture</span>
        <h1 className="font-display font-light text-4xl sm:text-6xl text-[#3F434D] tracking-tight mt-6">Mila’s travel logs</h1>
        <p className="text-sm text-[#6E727C] font-light mt-3 leading-relaxed">
          Insightful local tips, hidden volcanic spots, culinary secrets, and the authentic stories about Gran Canaria you won’t find elsewhere.
        </p>
      </div>

      {/* List blog posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map((post) => (
          <div 
            key={post.id} 
            className="bg-white rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.06)] shadow-sm flex flex-col h-full group hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setSelectedPostId(post.id)}
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-200">
              <img src={post.image} alt={post.title} className="object-cover h-full w-full group-hover:scale-101 transition-transform" />
              <span className="absolute top-4 left-4 bg-white text-xs font-bold text-[#3F434D] px-3.5 py-1.5 rounded-full uppercase tracking-wider">{post.category}</span>
            </div>
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="font-display font-medium text-xl sm:text-2xl text-[#3F434D] leading-7 mb-3">{post.title}</h3>
                <p className="text-xs font-light text-[#6E727C] leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
              </div>
              <div className="border-t border-[rgba(63,67,77,0.06)] pt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">
                <span>Written by {post.author}</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
