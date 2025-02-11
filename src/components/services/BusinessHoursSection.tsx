'use client';

import { useState, useEffect } from 'react';
import { useBusinessHours } from '@/contexts/BusinessHoursContext';
import type { BusinessHours } from '@/types/business';

const orderedDays = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
] as const;

const defaultHours: BusinessHours['hours'] = {
  monday: { day: 'Lundi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  tuesday: { day: 'Mardi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  wednesday: { day: 'Mercredi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  thursday: { day: 'Jeudi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  friday: { day: 'Vendredi', isOpen: true, openTime: '09:00', closeTime: '19:00' },
  saturday: { day: 'Samedi', isOpen: false },
  sunday: { day: 'Dimanche', isOpen: false }
};

export default function BusinessHoursSection() {
  const { businessHours, updateBusinessHours } = useBusinessHours();
  const [hours, setHours] = useState<BusinessHours['hours']>(defaultHours);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (businessHours) {
      setHours(businessHours);
    }
  }, [businessHours]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateBusinessHours(hours);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des horaires:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleHourChange = (
    day: keyof BusinessHours['hours'],
    field: 'isOpen' | 'openTime' | 'closeTime',
    value: string | boolean
  ) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">Horaires d'ouverture</h2>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="border border-black text-black px-4 py-2 rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
    
        <div className="bg-white border border-black rounded-[10px] p-4">
          {orderedDays.map(({ key, label }) => (
            <div 
              key={key}
              className="flex items-center space-x-4 py-3 border-b last:border-0"
            >
              <div className="w-32">
                <span className="font-medium text-black">{label}</span>
              </div>
              <div className="flex-1 flex items-center space-x-4">
                <label className="flex items-center">
                <input
  type="checkbox"
  checked={hours[key as keyof BusinessHours['hours']].isOpen}
  onChange={(e) => handleHourChange(key as keyof BusinessHours['hours'], 'isOpen', e.target.checked)}
  className="rounded-[10px] border-black text-black outline-none focus:outline-none focus:ring-0 mr-2"
/>


                  <span className="text-black">Ouvert</span>
                </label>
    
                {hours[key as keyof BusinessHours['hours']].isOpen && (
                  <>
                    <input
  type="time"
  value={hours[key as keyof BusinessHours['hours']].openTime}
  onChange={(e) => handleHourChange(key as keyof BusinessHours['hours'], 'openTime', e.target.value)}
  className="border border-black rounded-[10px] p-1 text-black outline-none focus:outline-none focus:ring-0"
/>

<span className="text-black">-</span>
<input
  type="time"
  value={hours[key as keyof BusinessHours['hours']].closeTime}
  onChange={(e) => handleHourChange(key as keyof BusinessHours['hours'], 'closeTime', e.target.value)}
  className="border border-black rounded-[10px] p-1 text-black outline-none focus:outline-none focus:ring-0"
/>
                  </>
                )}
                
                {!hours[key as keyof BusinessHours['hours']].isOpen && (
                  <span className="text-black italic">Fermé</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
}