import React from 'react';
import { HostProfile } from '../../../types';
import textos from '../../../content/textos.json';

interface SettingsTabProps {
  hostProfile: HostProfile;
  setHostProfile: React.Dispatch<React.SetStateAction<HostProfile>>;
  setHasUnsavedChanges: (val: boolean) => void;
  handleManualSave: () => void;
}

export function SettingsTab({
  hostProfile, setHostProfile, setHasUnsavedChanges, handleManualSave
}: SettingsTabProps) {
  const tSet = textos.panel.ajustes;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white border border-[rgba(63,67,77,0.1)] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h3 className="font-display font-medium text-xl text-[#3F434D] mb-1">
            {tSet.automationsTitle}
          </h3>
          <p className="text-xs text-[#6E727C]">
            {tSet.automationsDesc}
          </p>

          <div className="border-t border-[rgba(63,67,77,0.08)] mt-4 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#3F434D]">
                {tSet.triggerEmail}
              </span>
              <button className="h-6 w-11 inline-flex items-center rounded-full bg-[#A7AB5E] focus:outline-none">
                <span className="h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#3F434D]">
                {tSet.triggerBanner}
              </span>
              <button className="h-6 w-11 inline-flex items-center rounded-full bg-[#A7AB5E] focus:outline-none">
                <span className="h-4 w-4 transform rounded-full bg-white translate-x-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-[rgba(63,67,77,0.08)] pt-6">
          <h3 className="font-display font-medium text-xl text-[#3F434D] mb-4">
            {tSet.hostProfileTitle}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {tSet.publicName}
              </label>
              <input
                type="text"
                value={hostProfile.name}
                onChange={(e) => {
                  setHostProfile(prev => ({ ...prev, name: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {tSet.titleSubtitle}
              </label>
              <input
                type="text"
                value={hostProfile.title}
                onChange={(e) => {
                  setHostProfile(prev => ({ ...prev, title: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {tSet.bio}
              </label>
              <textarea
                rows={4}
                value={hostProfile.bio}
                onChange={(e) => {
                  setHostProfile(prev => ({ ...prev, bio: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-3 px-4 rounded-xl text-xs outline-none resize-vertical"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                  {tSet.phone}
                </label>
                <input
                  type="text"
                  value={hostProfile.phone}
                  onChange={(e) => {
                    setHostProfile(prev => ({ ...prev, phone: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                  {tSet.email}
                </label>
                <input
                  type="email"
                  value={hostProfile.email}
                  onChange={(e) => {
                    setHostProfile(prev => ({ ...prev, email: e.target.value }));
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#6E727C] mb-1.5">
                {tSet.address}
              </label>
              <input
                type="text"
                value={hostProfile.address}
                onChange={(e) => {
                  setHostProfile(prev => ({ ...prev, address: e.target.value }));
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-[#FBF7EC] border border-[rgba(63,67,77,0.08)] py-2.5 px-4 rounded-xl text-xs outline-none"
              />
            </div>
            <button
              onClick={handleManualSave}
              className="py-2.5 px-6 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#3F434D] text-[#FBF7EC] hover:bg-[#1E2024] shadow-md transition-all"
            >
              {tSet.saveProfile}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
