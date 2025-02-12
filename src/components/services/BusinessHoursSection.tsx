// src/components/services/BusinessHoursSection.tsx
'use client';

import { useState } from 'react';
import { useBusinessHours } from '@/contexts/BusinessHoursContext';
import type { BusinessHours, OpeningHours, BreakPeriod } from '@/types/business';
import BreakPeriodsModal from '@/components/services/BreakPeriodsModal';

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
  monday: { day: 'Lundi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  tuesday: { day: 'Mardi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  wednesday: { day: 'Mercredi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  thursday: { day: 'Jeudi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  friday: { day: 'Vendredi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  saturday: { day: 'Samedi', isOpen: false, breakPeriods: [] },
  sunday: { day: 'Dimanche', isOpen: false, breakPeriods: [] }
};

export default function BusinessHoursSection() {
  const { businessHours, updateBusinessHours } = useBusinessHours();
  const [hours, setHours] = useState<BusinessHours['hours']>(businessHours || defaultHours);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<keyof BusinessHours['hours'] | null>(null);

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

  const handleBreakPeriodsUpdate = (day: keyof BusinessHours['hours'], breaks: BreakPeriod[]) => {
    setHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        breakPeriods: breaks
      }
    }));
    setSelectedDay(null);
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
            className="flex items-center space-x-4 py-3 border-b last:border-0 border-black"
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
                  
                  <button
                    onClick={() => setSelectedDay(key as keyof BusinessHours['hours'])}
                    className="px-3 py-1 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-all text-sm"
                  >
                    Gérer les pauses
                  </button>

                  {hours[key as keyof BusinessHours['hours']].breakPeriods?.length ? (
                    <span className="text-sm text-black">
                      {hours[key as keyof BusinessHours['hours']].breakPeriods && 
  hours[key as keyof BusinessHours['hours']].breakPeriods!.length > 0 && (
    <span className="text-sm text-black">
      ({hours[key as keyof BusinessHours['hours']].breakPeriods!.length} pause
      {hours[key as keyof BusinessHours['hours']].breakPeriods!.length > 1 ? 's' : ''})
    </span>
)}
                  </span>
                  ) : null}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedDay && (
        <BreakPeriodsModal
          isOpen={true}
          onClose={() => setSelectedDay(null)}
          dayKey={selectedDay}
          breaks={hours[selectedDay].breakPeriods || []}
          onSave={(breaks) => handleBreakPeriodsUpdate(selectedDay, breaks)}
        />
      )}
    </div>
  );
}