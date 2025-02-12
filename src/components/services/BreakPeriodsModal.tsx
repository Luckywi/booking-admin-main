// src/components/services/BreakPeriodsModal.tsx
'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { BreakPeriod } from '@/types/business';

interface BreakPeriodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayKey: string;
  breaks: BreakPeriod[];
  onSave: (breaks: BreakPeriod[]) => void;
}

export default function BreakPeriodsModal({ 
  isOpen, 
  onClose, 
  dayKey, 
  breaks, 
  onSave 
}: BreakPeriodsModalProps) {
  const [periods, setPeriods] = useState<BreakPeriod[]>(breaks);

  const addPeriod = () => {
    setPeriods([...periods, { start: "", end: "", label: "" }]);
  };

  const removePeriod = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const updatePeriod = (index: number, field: keyof BreakPeriod, value: string) => {
    const newPeriods = [...periods];
    newPeriods[index] = { ...newPeriods[index], [field]: value };
    setPeriods(newPeriods);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-black rounded-[10px] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="border-b border-black pb-4 mb-6">
          <h2 className="text-2xl font-bold text-black">Gérer les pauses</h2>
          <p className="text-sm text-black mt-1">
            {dayKey === 'monday' ? 'Lundi' :
             dayKey === 'tuesday' ? 'Mardi' :
             dayKey === 'wednesday' ? 'Mercredi' :
             dayKey === 'thursday' ? 'Jeudi' :
             dayKey === 'friday' ? 'Vendredi' :
             dayKey === 'saturday' ? 'Samedi' : 'Dimanche'}
          </p>
        </div>

        <div className="space-y-4">
          {periods.map((period, index) => (
            <div key={index} className="border border-black rounded-[10px] p-4">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  value={period.label}
                  onChange={(e) => updatePeriod(index, 'label', e.target.value)}
                  placeholder="Label (ex: Pause déjeuner)"
                  className="w-full p-2 border border-black rounded-[10px] text-black"
                />
                <button
                  onClick={() => removePeriod(index)}
                  className="ml-2 p-2 text-black hover:bg-gray-50 rounded-[10px]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={period.start}
                  onChange={(e) => updatePeriod(index, 'start', e.target.value)}
                  className="flex-1 p-2 border border-black rounded-[10px]"
                />
                <span className="text-black self-center">-</span>
                <input
                  type="time"
                  value={period.end}
                  onChange={(e) => updatePeriod(index, 'end', e.target.value)}
                  className="flex-1 p-2 border border-black rounded-[10px]"
                />
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addPeriod}
          className="w-full mt-4 px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
        >
          + Ajouter une pause
        </button>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onSave(periods)}
            className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}