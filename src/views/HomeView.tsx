import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Send, X, Clock } from 'lucide-react';
import { motion, useReducedMotion, AnimatePresence } from 'motion/react';
import { House, BlogPost } from '../types';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import textos from '../content/textos.json';

interface HomeViewProps {
  houses?: House[];
  handleNavigate?: (page: 'home' | 'detail' | 'blog' | 'contact' | 'dashboard') => void;
  handleHouseClick?: (houseId: string) => void;
  showToast?: (msg: string) => void;
}

export function HomeView(props: HomeViewProps) {
  const navigate = useNavigate();
  const { houses: ctxHouses, blogPosts, hostProfile, sendInquiry } = useData();
  const { user, triggerLoginModal } = useAuth();
  const { showToast } = useToast();
  const houses = props.houses || ctxHouses;
  const tHome = textos.home;
  const tBlog = textos.blog;
  const tCont = textos.contact;

  // Selected story for modal reading
  const [selectedStory, setSelectedStory] = useState<BlogPost | null>(null);



  // Contact form state
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactHouseId, setContactHouseId] = useState(houses[0]?.id || '');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      if (!contactName) setContactName(user.name);
      if (!contactEmail) setContactEmail(user.email);
    }
  }, [user, contactName, contactEmail]);

  useEffect(() => {
    if (!contactHouseId && houses.length > 0) {
      setContactHouseId(houses[0].id);
    }
  }, [houses, contactHouseId]);

  const onHouseClick = (id: string) => {
    if (props.handleHouseClick) {
      props.handleHouseClick(id);
    } else {
      navigate(`/alojamiento/${id}`);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = contactName.trim() || (user ? user.name : '');
    const finalEmail = contactEmail.trim() || (user ? user.email : '');

    if (!finalName || !finalEmail || !contactMessage.trim()) {
      showToast(tCont.validationError);
      return;
    }

    if (!user) {
      showToast(tCont.loginError);
      triggerLoginModal('signin');
      return;
    }

    setIsSubmitting(true);
    const selectedTargetHouse = houses.find(h => h.id === contactHouseId) || houses[0];
    const res = await sendInquiry(
      finalName,
      finalEmail,
      selectedTargetHouse?.name || 'Stay',
      contactSubject.trim() || 'General Inquiry',
      contactMessage.trim()
    );
    setIsSubmitting(false);

    if (res.success) {
      setContactSubject('');
      setContactMessage('');
      showToast(tCont.successToast.replace('{name}', hostProfile?.name || 'Mila'));
    } else {
      showToast(tCont.errorToast + (res.error || 'Error'));
    }
  };

  const avgRating = houses.length > 0
    ? (houses.reduce((acc, h) => acc + (h.rating || 0), 0) / houses.length).toFixed(2)
    : '5.00';

  const prefersReducedMotion = useReducedMotion();

  // Central viewport configs: trigger when elements enter the comfortable CENTER of the screen
  const centerTextViewport = {
    once: false,
    margin: '-10% 0px -32% 0px',
    amount: 0.2,
  };

  const centerCardViewport = {
    once: false,
    margin: '-10% 0px -26% 0px',
    amount: 0.15,
  };

  return (
    <div className="animate-fade-in scroll-smooth relative">

      {/* 1. UNIFIED HERO & STORYTELLING SECTION (THE MEETING POINT) */}
      <section id="hero" className="relative overflow-hidden pt-24 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-8 bg-gradient-to-b from-[#F3ECDA] via-[#FBF7EC] to-[#FBF7EC]">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-[#E6BE7A] rounded-full filter blur-[150px] opacity-15 pointer-events-none"></div>
        <div className="absolute top-1/3 left-0 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-[#5BA6C4] rounded-full filter blur-[140px] opacity-15 pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-[#A7AB5E] rounded-full filter blur-[140px] opacity-10 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          {/* Badge con el punto original que salta al scrollear */}
          <motion.span
            initial={{ opacity: 0, y: -25, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={centerTextViewport}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 bg-white px-5 py-2.5 border border-[rgba(63,67,77,0.1)] rounded-full text-xs font-semibold uppercase tracking-widest text-[#3F434D] mb-8 shadow-xs"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#A7AB5E] relative inline-flex items-center justify-center shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#A7AB5E] animate-ping opacity-75" />
            </span>
            {tHome.badge}
          </motion.span>
          
          {/* Main H1 Title with Expressive Typography */}
          <motion.h1
            initial={{ opacity: 0, y: 45, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={centerTextViewport}
            transition={{ duration: 0.85, delay: prefersReducedMotion ? 0 : 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-light text-5xl sm:text-7xl lg:text-8xl tracking-tight text-[#3F434D] leading-[1.08] mb-10"
          >
            {tHome.heroTitlePre} <br />
            <motion.span 
              whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
              className="inline-block italic font-medium text-[#A7AB5E] underline decoration-wavy decoration-[#E6BE7A] underline-offset-8 transition-transform cursor-default"
            >
              {tHome.heroTitleHighlight}
            </motion.span> {tHome.heroTitlePost}
          </motion.h1>

          {/* Subtitle - Large, prominent and highly legible */}
          <motion.p
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={centerTextViewport}
            transition={{ duration: 0.85, delay: prefersReducedMotion ? 0 : 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="text-[#3F434D] text-xl sm:text-2xl lg:text-3xl font-light leading-relaxed max-w-3xl mb-12"
          >
            {tHome.heroSubtitle}
          </motion.p>

          {/* Decorative Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            viewport={centerTextViewport}
            transition={{ duration: 0.8, delay: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-24 h-1 bg-gradient-to-r from-[#A7AB5E] via-[#E6BE7A] to-[#3D7A95] rounded-full mb-12 origin-center"
          />

          {/* Story Narrative - Generous reading size & breathing room */}
          <div className="max-w-3xl space-y-6 text-[#5A5E68] text-lg sm:text-xl lg:text-2xl font-light leading-relaxed mb-14">
            <motion.p
              initial={{ opacity: 0, y: 45, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={centerTextViewport}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="font-medium text-[#3F434D] italic">{tHome.meetingPoint.title} </span>
              {tHome.meetingPoint.paragraph1}
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 45, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={centerTextViewport}
              transition={{ duration: 0.8, delay: prefersReducedMotion ? 0 : 0.12, ease: [0.16, 1, 0.3, 1] }}
            >
              {tHome.meetingPoint.paragraph2}
            </motion.p>
          </div>

          {/* Climax Statement / Quote with animated wavy underline */}
          <motion.div
            initial={{ opacity: 0, y: 45, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={centerTextViewport}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mb-14"
          >
            <blockquote className="font-display font-light text-2xl sm:text-4xl lg:text-5xl text-[#3F434D] leading-snug tracking-tight">
              {tHome.meetingPoint.quotePre || tHome.meetingPoint.quote}
              {tHome.meetingPoint.quoteHighlight && (
                <>
                  <br className="hidden sm:inline" />{" "}
                  <span className="relative inline-block mt-3 sm:mt-4 font-medium italic text-[#A7AB5E]">
                    {tHome.meetingPoint.quoteHighlight}
                    <svg
                      className="absolute -bottom-2 sm:-bottom-3.5 left-0 w-full h-3.5 sm:h-5 text-[#E6BE7A] overflow-visible"
                      viewBox="0 0 260 18"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <motion.path
                        d="M 2 9 C 45 3, 90 15, 135 9 C 180 3, 225 15, 258 9"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={centerTextViewport}
                        transition={{
                          duration: 1.1,
                          delay: prefersReducedMotion ? 0 : 0.25,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      />
                    </svg>
                  </span>
                </>
              )}
            </blockquote>
          </motion.div>

          {/* Call-to-action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={centerTextViewport}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex gap-4 flex-wrap justify-center items-center mb-16"
          >
            <a
              href="#stays"
              className="py-3.5 px-9 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#A7AB5E] text-[#FBF7EC] hover:bg-[#888B47] shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {tHome.ctaStays}
            </a>
            <a
              href="#stories"
              className="py-3.5 px-9 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-[#3F434D] border border-[rgba(63,67,77,0.12)] hover:bg-[#F5EFE0] transition-all duration-300 shadow-xs"
            >
              {tHome.ctaStories}
            </a>
            <a
              href="#contact"
              className="py-3.5 px-9 rounded-full text-xs font-semibold uppercase tracking-wider text-[#6E727C] hover:text-[#3F434D] hover:bg-white/60 transition-all duration-300"
            >
              {tCont.heading.replace('{name}', hostProfile?.name || 'Mila')} →
            </a>
          </motion.div>

          {/* Hero Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={centerTextViewport}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-3 gap-8 sm:gap-16 border-t border-[rgba(63,67,77,0.1)] pt-12 w-full max-w-2xl"
          >
            <div>
              <h5 className="font-display text-3xl sm:text-4xl font-extrabold text-[#3D7A95] tracking-tight">{houses.length}</h5>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6E727C] mt-2">{tHome.statStays}</p>
            </div>
            <div>
              <h5 className="font-display text-3xl sm:text-4xl font-extrabold text-[#A7AB5E] tracking-tight">{avgRating}</h5>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6E727C] mt-2">{tHome.statRating}</p>
            </div>
            <div>
              <h5 className="font-display text-3xl sm:text-4xl font-extrabold text-[#3F434D] tracking-tight">100%</h5>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6E727C] mt-2">{tHome.statEssence}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ocean bottom wave separator */}
      <div className="w-full overflow-hidden leading-none bg-[#FBF7EC]">
        <svg className="relative block w-full h-[60px]" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,0 720,60 1080,30 C1380,10 1440,30 1440,30 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </div>

      {/* 2. STAYS & ROOMS SECTION */}
      <section id="stays" className="bg-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[rgba(63,67,77,0.06)] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={centerTextViewport}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14 border-b border-[rgba(63,67,77,0.06)] pb-8"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] bg-[#CFE4EC] px-4 py-1.5 rounded-full mb-3 inline-block">
                Coliving Spaces
              </span>
              <h2 className="font-display text-3xl sm:text-5xl font-light text-[#3F434D] tracking-tight">
                {tHome.sectionTitlePre}{' '}
                <span className="italic font-normal text-[#A7AB5E]">Mila</span>
              </h2>
              <p className="text-sm text-[#6E727C] mt-2 max-w-md font-light">
                {tHome.sectionSubtitle
                  .replace('{count}', String(houses.length))
                  .replace('{staysLabel}', houses.length === 1 ? tHome.staysSingular : tHome.staysPlural)}
              </p>
            </div>
          </motion.div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {houses.map((h, idx) => (
              <motion.div 
                key={h.id} 
                initial={{ opacity: 0, y: 55, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={centerCardViewport}
                transition={{ 
                  duration: 0.75, 
                  delay: prefersReducedMotion ? 0 : idx * 0.12, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                whileHover={prefersReducedMotion ? {} : { y: -8 }}
                onClick={() => onHouseClick(h.id)}
                className="group cursor-pointer bg-[#FBF7EC] rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.06)] hover:shadow-2xl transition-all duration-300 flex flex-col h-full"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-200">
                  <img 
                    src={h.images[0] || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'} 
                    alt={h.name} 
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  {h.tag && (
                    <span className="absolute top-4 left-4 bg-white text-[#3F434D] font-bold text-[10px] tracking-wider uppercase py-1.5 px-3 rounded-full shadow-md border border-[rgba(63,67,77,0.04)]">
                      {h.tag}
                    </span>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-widest text-[#3D7A95] uppercase block mb-1.5">📍 {h.location}</span>
                    <h3 className="font-display font-medium text-xl sm:text-2xl text-[#3F434D] group-hover:text-[#A7AB5E] transition-colors leading-6 mb-2.5">
                      {h.name}
                    </h3>
                    <p className="text-xs font-light text-[#6E727C] leading-relaxed mb-6 line-clamp-2">
                      {h.description}
                    </p>
                  </div>

                  <div className="border-t border-[rgba(63,67,77,0.06)] pt-4 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-xl font-bold text-[#3F434D]">{h.pricePerNight}€</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E727C]">{tHome.perNight}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3F434D]">
                      <Star className="h-4 w-4 text-[#E6BE7A] fill-[#E6BE7A]" />
                      {h.rating} <span className="text-[#6E727C] font-normal">({h.reviewCount})</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. STORIES SECTION (INTEGRATED ONE-PAGE BLOG) */}
      <section id="stories" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FBF7EC] scroll-mt-20 border-b border-[rgba(63,67,77,0.06)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={centerTextViewport}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] bg-[#CFE4EC] px-4 py-1.5 rounded-full inline-block mb-3">
              {tBlog.badge}
            </span>
            <h2 className="font-display font-light text-3xl sm:text-5xl text-[#3F434D] tracking-tight">
              {tBlog.title}
            </h2>
            <p className="text-sm sm:text-base text-[#6E727C] font-light mt-3 leading-relaxed">
              {tBlog.subtitle}
            </p>
          </motion.div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, idx) => (
              <motion.div 
                key={post.id}
                initial={{ opacity: 0, y: 55, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={centerCardViewport}
                transition={{ 
                  duration: 0.75, 
                  delay: prefersReducedMotion ? 0 : idx * 0.12, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                whileHover={prefersReducedMotion ? {} : { y: -6 }}
                onClick={() => setSelectedStory(post)}
                className="bg-white rounded-3xl overflow-hidden border border-[rgba(63,67,77,0.06)] shadow-xs flex flex-col h-full group hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-200">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-4 left-4 bg-white text-xs font-bold text-[#3F434D] px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
                    {post.category}
                  </span>
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-medium text-xl text-[#3F434D] group-hover:text-[#A7AB5E] transition-colors leading-snug mb-3">
                      {post.title}
                    </h3>
                    <p className="text-xs font-light text-[#6E727C] leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                  <div className="border-t border-[rgba(63,67,77,0.06)] pt-4 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[#6E727C]">
                    <span>{tBlog.writtenBy.replace('{author}', post.author)}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#A7AB5E]" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTACT & HOST BIO SECTION (INTEGRATED INQUIRY) */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FBF7EC] to-[#F3ECDA] scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Host Bio Column */}
            <motion.div
              initial={{ opacity: 0, x: -40, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={centerCardViewport}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] bg-[#CFE4EC] px-4 py-1.5 rounded-full inline-block mb-4">
                {tCont.badge}
              </span>
              <h2 className="font-display font-light text-3xl sm:text-5xl text-[#3F434D] tracking-tight leading-tight mb-4">
                {tCont.heading.replace('{name}', hostProfile?.name || 'Mila')}
              </h2>
              <p className="text-sm sm:text-base font-light text-[#6E727C] leading-relaxed mb-8">
                {tCont.subtitle}
              </p>

              {/* Host Profile Card */}
              <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-[rgba(63,67,77,0.08)] shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-[#A7AB5E] to-[#E6BE7A] text-white flex items-center justify-center font-bold text-3xl shadow-md shrink-0">
                  {hostProfile?.name ? hostProfile.name.charAt(0).toUpperCase() : 'M'}
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-display text-xl font-medium text-[#3F434D]">{hostProfile?.name || 'Mila'}</h4>
                  <p className="text-xs text-[#A7AB5E] font-semibold uppercase tracking-wider mt-0.5">{hostProfile?.title || 'Coliving Host'}</p>
                  <p className="text-xs text-[#6E727C] font-light mt-3 leading-relaxed">
                    {hostProfile?.bio || ''}
                  </p>
                  <div className="mt-4 pt-3 border-t border-[rgba(63,67,77,0.06)] flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-medium text-[#6E727C]">
                    {hostProfile?.phone && <span>📞 {hostProfile.phone}</span>}
                    {hostProfile?.email && <span>✉️ {hostProfile.email}</span>}
                    {hostProfile?.address && <span>📍 {hostProfile.address}</span>}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Direct Inquiry Form Column */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={centerCardViewport}
              transition={{ duration: 0.85, delay: prefersReducedMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7"
            >
              <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[rgba(63,67,77,0.08)] shadow-sm">
                <h3 className="font-display text-2xl font-light text-[#3F434D] mb-1">
                  {tCont.cardTitle}
                </h3>
                <p className="text-xs text-[#6E727C] font-light mb-8">
                  {tCont.cardSubtitle.replace('{name}', hostProfile?.name || 'Mila')}
                </p>

                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3F434D] mb-1.5">
                        {tCont.nameLabel}
                      </label>
                      <input 
                        type="text" 
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder={tCont.namePlaceholder}
                        required
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] rounded-2xl py-3 px-4 text-sm text-[#3F434D] focus:outline-none focus:border-[#3D7A95] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3F434D] mb-1.5">
                        {tCont.emailLabel}
                      </label>
                      <input 
                        type="email" 
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder={tCont.emailPlaceholder}
                        required
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] rounded-2xl py-3 px-4 text-sm text-[#3F434D] focus:outline-none focus:border-[#3D7A95] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3F434D] mb-1.5">
                        {tCont.stayLabel}
                      </label>
                      <select 
                        value={contactHouseId}
                        onChange={(e) => setContactHouseId(e.target.value)}
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] rounded-2xl py-3 px-4 text-sm text-[#3F434D] focus:outline-none focus:border-[#3D7A95] transition-colors cursor-pointer"
                      >
                        {houses.map(h => (
                          <option key={h.id} value={h.id}>{h.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#3F434D] mb-1.5">
                        {tCont.subjectLabel}
                      </label>
                      <input 
                        type="text" 
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        placeholder={tCont.subjectPlaceholder}
                        className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] rounded-2xl py-3 px-4 text-sm text-[#3F434D] focus:outline-none focus:border-[#3D7A95] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#3F434D] mb-1.5">
                      {tCont.messageLabel}
                    </label>
                    <textarea 
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder={tCont.messagePlaceholder}
                      required
                      className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.1)] rounded-2xl py-3 px-4 text-sm text-[#3F434D] focus:outline-none focus:border-[#3D7A95] transition-colors resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-8 bg-[#3F434D] text-white rounded-2xl text-xs font-semibold uppercase tracking-wider hover:bg-[#1E2024] transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#E6BE7A]" />
                    {isSubmitting ? 'Sending...' : tCont.sendButton}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. MODAL LECTOR DE HISTORIAS (IN-PAGE STORY VIEWER) */}
      <AnimatePresence>
        {selectedStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStory(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-3xl bg-[#FBF7EC] rounded-3xl p-6 sm:p-10 shadow-2xl z-10 my-8 max-h-[90vh] overflow-y-auto border border-[rgba(63,67,77,0.1)]"
            >
              <button 
                onClick={() => setSelectedStory(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white border border-[rgba(63,67,77,0.1)] text-[#6E727C] hover:text-[#3F434D] transition-colors shadow-xs"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#3D7A95] bg-[#CFE4EC] px-3.5 py-1.5 rounded-full inline-block mb-3">
                  {selectedStory.category}
                </span>
                <h2 className="font-display font-light text-2xl sm:text-4xl text-[#3F434D] tracking-tight">
                  {selectedStory.title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-[#6E727C] mt-3">
                  <span>{tBlog.byAuthor.replace('{author}', selectedStory.author)}</span>
                  <span>•</span>
                  <span>{selectedStory.publishedDate}</span>
                  <span>•</span>
                  <span>{selectedStory.readTime}</span>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden mb-8 border border-[rgba(63,67,77,0.08)] aspect-[16/9] bg-gray-100">
                <img 
                  src={selectedStory.image} 
                  alt={selectedStory.title} 
                  className="w-full h-full object-cover" 
                />
              </div>

              <div className="space-y-4 text-sm sm:text-base font-light text-[#3F434D] leading-relaxed">
                {selectedStory.content.split('\n').map((para, i) => (
                  para.trim() ? <p key={i}>{para}</p> : null
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
