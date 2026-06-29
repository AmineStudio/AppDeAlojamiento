import React from 'react';
import { BlogPost } from '../types';

interface BlogViewProps {
  blogPosts: BlogPost[];
}

export function BlogView({ blogPosts }: BlogViewProps) {
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
          <div key={post.id} className="bg-white rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.06)] shadow-sm flex flex-col h-full group hover:shadow-xl transition-all">
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
