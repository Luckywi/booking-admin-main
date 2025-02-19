'use client';

import { useState, useEffect } from 'react';
import { useBusinessHours } from '@/contexts/BusinessHoursContext';
import type { BusinessHours, OpeningHours, BreakPeriod, VacationPeriod} from '@/types/business';
import BreakPeriodsModal from '@/components/services/BreakPeriodsModal';
import VacationModal from '@/components/services/VacationModal';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const orderedDays = [
  { key: 'monday', label: 'Lundi' },
  { key: 'tuesday', label: 'Mardi' },
  { key: 'wednesday', label: 'Mercredi' },
  { key: 'thursday', label: 'Jeudi' },
  { key: 'friday', label: 'Vendredi' },
  { key: 'saturday', label: 'Samedi' },
  { key: 'sunday', label: 'Dimanche' }
] as const;

const defaultHours = {
  monday: { day: 'Lundi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  tuesday: { day: 'Mardi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  wednesday: { day: 'Mercredi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  thursday: { day: 'Jeudi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  friday: { day: 'Vendredi', isOpen: true, openTime: '09:00', closeTime: '19:00', breakPeriods: [] },
  saturday: { day: 'Samedi', isOpen: false, breakPeriods: [] },
  sunday: { day: 'Dimanche', isOpen: false, breakPeriods: [] },
};

export default function BusinessHoursSection({ businessId }: { businessId: string }) {
  const { businessHours, updateBusinessHours } = useBusinessHours();
  const [businessVacations, setBusinessVacations] = useState<VacationPeriod[]>([]);
  const [hours, setHours] = useState<BusinessHours['hours']>(businessHours || defaultHours);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState<keyof BusinessHours['hours'] | null>(null);
  const [showVacationModal, setShowVacationModal] = useState(false);

  useEffect(() => {
    const fetchBusinessVacations = async () => {
      try {
        const q = query(
          collection(db, 'vacationPeriods'),
          where('entityId', '==', businessId),
          where('type', '==', 'business')
        );
        const snapshot = await getDocs(q);
        const vacations = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate.toDate(),
          endDate: doc.data().endDate.toDate()
        })) as VacationPeriod[];
        setBusinessVacations(vacations);
      } catch (error) {
        console.error('Erreur lors du chargement des vacances:', error);
      }
    };
  
    fetchBusinessVacations();
  }, [businessId]);

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-black">Horaires d'ouverture</h2>
        <div className="flex gap-4">
        <div className="relative inline-flex">
            <button
              onClick={() => setShowVacationModal(true)}
              className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
            >
              Gérer les vacances
            </button>
            {businessVacations?.length > 0 && (
              <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-white border border-black rounded-full">
                {businessVacations.length}
              </span>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
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
                  onChange={(e) => {
                    setHours((prev: any) => ({
                      ...prev,
                      [key]: {
                        ...prev[key],
                        isOpen: e.target.checked
                      }
                    }));
                  }}
                  className="rounded-[10px] border-black text-black outline-none focus:outline-none focus:ring-0 mr-2"
                />
                <span className="text-black">Ouvert</span>
              </label>
    
              {hours[key as keyof BusinessHours['hours']].isOpen && (
                <>
                  <input
                    type="time"
                    value={hours[key as keyof BusinessHours['hours']].openTime}
                    onChange={(e) => {
                      setHours((prev: any) => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          openTime: e.target.value
                        }
                      }));
                    }}
                    className="border border-black rounded-[10px] p-1 text-black outline-none focus:outline-none focus:ring-0"
                  />
                  <span className="text-black">-</span>
                  <input
                    type="time"
                    value={hours[key as keyof BusinessHours['hours']].closeTime}
                    onChange={(e) => {
                      setHours((prev: any) => ({
                        ...prev,
                        [key]: {
                          ...prev[key],
                          closeTime: e.target.value
                        }
                      }));
                    }}
                    className="border border-black rounded-[10px] p-1 text-black outline-none focus:outline-none focus:ring-0"
                  />
                  
                  <div className="relative inline-flex">
                    <button
                      onClick={() => setSelectedDay(key as keyof BusinessHours['hours'])}
                      className="px-3 py-1 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-all text-sm"
                    >
                      Gérer les pauses
                    </button>
                    {hours[key as keyof BusinessHours['hours']].breakPeriods?.length > 0 && (
                      <span className="absolute -top-2 -right-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-black bg-white border border-black rounded-full">
                        {hours[key as keyof BusinessHours['hours']].breakPeriods.length}
                      </span>
                    )}
                  </div>
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

<VacationModal
  isOpen={showVacationModal}
  onClose={() => setShowVacationModal(false)}
  type="business"
  entityId={businessId}
  entityName="Business"
  onVacationsUpdate={setBusinessVacations}  // Ajout de cette ligne
/>
    </div>
  );
}