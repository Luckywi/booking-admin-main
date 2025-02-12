'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { Service, Duration } from '@/types/service';
import type { Staff } from '@/types/staff';

interface EditServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  service: Service | null;
}

export default function EditServiceModal({ isOpen, onClose, onSuccess, service }: EditServiceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hours: 0,
    minutes: 0,
    price: 0,
    allowAllStaff: true,
    selectedStaffIds: [] as string[]
  });

  // Charger les données du service
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title,
        description: service.description,
        hours: service.duration.hours,
        minutes: service.duration.minutes,
        price: service.price,
        allowAllStaff: service.allowAllStaff || false,
        selectedStaffIds: service.staffIds || []
      });
    }
  }, [service]);

  // Charger les collaborateurs
  useEffect(() => {
    if (!service?.businessId || !isOpen) return;

    const fetchStaff = async () => {
      const q = query(
        collection(db, 'staff'),
        where('businessId', '==', service.businessId)
      );

      const snapshot = await getDocs(q);
      const staffData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Staff[];

      setStaff(staffData);
    };

    fetchStaff();
  }, [service?.businessId, isOpen]);

  const handleStaffSelection = (staffId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStaffIds: prev.selectedStaffIds.includes(staffId)
        ? prev.selectedStaffIds.filter(id => id !== staffId)
        : [...prev.selectedStaffIds, staffId]
    }));
  };

  if (!isOpen || !service) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      const duration: Duration = {
        hours: Number(formData.hours),
        minutes: Number(formData.minutes)
      };

      await updateDoc(doc(db, 'services', service.id), {
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration,
        price: Number(formData.price),
        staffIds: formData.allowAllStaff ? [] : formData.selectedStaffIds,
        allowAllStaff: formData.allowAllStaff
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la modification du service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

    try {
      setIsDeleting(true);
      await deleteDoc(doc(db, 'services', service.id));
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white border border-black rounded-[10px] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
    <div className="flex justify-between items-center border-b border-black pb-4 mb-6">
      <h2 className="text-2xl font-bold text-black">Modifier le service</h2>
      <button
        onClick={handleDelete}
        className="text-black hover:border hover:border-black rounded-[10px] px-4 py-2 transition-all text-sm"
        disabled={isDeleting || isSubmitting}
      >
        {isDeleting ? 'Suppression...' : 'Supprimer'}
      </button>
    </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-black rounded-[10px] p-4">
        <label className="block text-sm font-bold text-black mb-2">
          Nom du service
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full p-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
          required
        />
      </div>

      <div className="border border-black rounded-[10px] p-4">
        <label className="block text-sm font-bold text-black mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full p-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
          rows={6}
          required
        />
      </div>

      <div className="border border-black rounded-[10px] p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Durée
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                max="23"
                value={formData.hours}
                onChange={(e) => setFormData({...formData, hours: parseInt(e.target.value)})}
                className="w-full p-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
                placeholder="Heures"
              />
              <input
                type="number"
                min="0"
                max="59"
                value={formData.minutes}
                onChange={(e) => setFormData({...formData, minutes: parseInt(e.target.value)})}
                className="w-full p-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
                placeholder="Minutes"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Prix (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              className="w-full p-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      <div className="border border-black rounded-[10px] p-4">
        <label className="block text-sm font-bold text-black mb-4">
          Collaborateurs autorisés
        </label>
        <div className="space-y-4">
          <label className="flex items-center p-2 border border-black rounded-[10px] hover:bg-gray-50 transition-all">
            <input
              type="checkbox"
              checked={formData.allowAllStaff}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  allowAllStaff: e.target.checked,
                  selectedStaffIds: []
                }));
              }}
              className="rounded-[10px] border-black text-black focus:ring-0 mr-2"
            />
            <span className="text-black">Tous les collaborateurs</span>
          </label>

          {!formData.allowAllStaff && (
            <div className="grid grid-cols-2 gap-2">
              {staff.map((member) => (
                <label 
                  key={member.id}
                  className="flex items-center p-2 border border-black rounded-[10px] hover:bg-gray-50 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={formData.selectedStaffIds.includes(member.id)}
                    onChange={() => handleStaffSelection(member.id)}
                    className="rounded-[10px] border-black text-black focus:ring-0 mr-2"
                  />
                  <span className="text-black">{member.firstName} {member.lastName}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
          disabled={isSubmitting || isDeleting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          disabled={isSubmitting || isDeleting || (!formData.allowAllStaff && formData.selectedStaffIds.length === 0)}
        >
          {isSubmitting ? 'Modification...' : 'Modifier'}
        </button>
      </div>
    </form>
  </div>
</div>
  );
}