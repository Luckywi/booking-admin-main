// src/components/services/VacationModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { doc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { VacationPeriod } from '@/types/business';
import { Trash2 } from 'lucide-react';

interface VacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'business' | 'staff';
  entityId: string; // businessId ou staffId
  entityName?: string; // Nom de l'entité (business ou staff)
}

export default function VacationModal({
  isOpen,
  onClose,
  type,
  entityId,
  entityName
}: VacationModalProps) {
  const [vacations, setVacations] = useState<VacationPeriod[]>([]);
  const [newVacation, setNewVacation] = useState({
    title: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchVacations = async () => {
      if (!entityId) return;

      try {
        const q = query(
          collection(db, 'vacationPeriods'),
          where('entityId', '==', entityId),
          where('type', '==', type)
        );

        const snapshot = await getDocs(q);
        const vacationData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate.toDate(),
          endDate: doc.data().endDate.toDate()
        })) as VacationPeriod[];

        setVacations(vacationData);
      } catch (error) {
        console.error('Erreur lors de la récupération des vacances:', error);
      }
    };

    if (isOpen) {
      fetchVacations();
    }
  }, [entityId, type, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityId) return;

    try {
      setIsSubmitting(true);

      const vacationData = {
        title: newVacation.title,
        startDate: new Date(newVacation.startDate),
        endDate: new Date(newVacation.endDate),
        description: newVacation.description,
        type,
        entityId,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'vacationPeriods'), vacationData);

      setNewVacation({
        title: '',
        startDate: '',
        endDate: '',
        description: ''
      });

      // Recharger les vacances
      const q = query(
        collection(db, 'vacationPeriods'),
        where('entityId', '==', entityId),
        where('type', '==', type)
      );
      const snapshot = await getDocs(q);
      const updatedVacations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate.toDate(),
        endDate: doc.data().endDate.toDate()
      })) as VacationPeriod[];

      setVacations(updatedVacations);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la période de vacances:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (vacationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette période de vacances ?')) return;

    try {
      await deleteDoc(doc(db, 'vacationPeriods', vacationId));
      setVacations(prev => prev.filter(v => v.id !== vacationId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la période de vacances:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-black rounded-[10px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-black border-b border-black pb-4 mb-6">
          Gestion des vacances
          {entityName && ` - ${entityName}`}
        </h2>

        {/* Formulaire d'ajout */}
        <form onSubmit={handleSubmit} className="border border-black rounded-[10px] p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Titre
              </label>
              <input
                type="text"
                value={newVacation.title}
                onChange={(e) => setNewVacation(prev => ({ ...prev, title: e.target.value }))}
                className="w-full p-2 border border-black rounded-[10px] text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Description (optionnel)
              </label>
              <input
                type="text"
                value={newVacation.description}
                onChange={(e) => setNewVacation(prev => ({ ...prev, description: e.target.value }))}
                className="w-full p-2 border border-black rounded-[10px] text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={newVacation.startDate}
                onChange={(e) => setNewVacation(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full p-2 border border-black rounded-[10px] text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={newVacation.endDate}
                onChange={(e) => setNewVacation(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full p-2 border border-black rounded-[10px] text-black"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Ajout...' : 'Ajouter une période'}
          </button>
        </form>

        {/* Liste des périodes */}
        <div className="space-y-4">
          {vacations.map((vacation) => (
            <div
              key={vacation.id}
              className="border border-black rounded-[10px] p-4 relative group"
            >
              <button
                onClick={() => handleDelete(vacation.id)}
                className="absolute right-2 top-2 p-1.5 text-black hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <h3 className="font-medium text-black">{vacation.title}</h3>
              {vacation.description && (
                <p className="text-sm text-black mt-1">{vacation.description}</p>
              )}
              <p className="text-sm text-black mt-2">
                Du {format(vacation.startDate, 'dd MMMM yyyy', { locale: fr })} au{' '}
                {format(vacation.endDate, 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          ))}

          {vacations.length === 0 && (
            <p className="text-center text-black py-4">
              Aucune période de vacances enregistrée
            </p>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}