'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import type { Duration, Service } from '@/types/service';
import type { Staff } from '@/types/staff';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryId: string;
  categoryTitle: string;
}

export default function AddServiceModal({ isOpen, onClose, onSuccess, categoryId, categoryTitle }: AddServiceModalProps) {
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  // Charger les collaborateurs
  useEffect(() => {
    if (!userData?.businessId || !isOpen) return;

    const fetchStaff = async () => {
      const q = query(
        collection(db, 'staff'),
        where('businessId', '==', userData.businessId)
      );

      const snapshot = await getDocs(q);
      const staffData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Staff[];

      setStaff(staffData);
    };

    fetchStaff();
  }, [userData?.businessId, isOpen]);

  const handleStaffSelection = (staffId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedStaffIds: prev.selectedStaffIds.includes(staffId)
        ? prev.selectedStaffIds.filter(id => id !== staffId)
        : [...prev.selectedStaffIds, staffId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.businessId) return;

    try {
      setIsSubmitting(true);

      const duration: Duration = {
        hours: Number(formData.hours),
        minutes: Number(formData.minutes)
      };

      await addDoc(collection(db, 'services'), {
        businessId: userData.businessId,
        categoryId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        duration,
        price: Number(formData.price),
        createdAt: new Date(),
        order: 0,
        staffIds: formData.allowAllStaff ? [] : formData.selectedStaffIds,
        allowAllStaff: formData.allowAllStaff
      });

      onSuccess();
      setFormData({
        title: '',
        description: '',
        hours: 0,
        minutes: 0,
        price: 0,
        allowAllStaff: true,
        selectedStaffIds: []
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la création du service:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white border border-black rounded-[10px] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
    <div className="border-b border-black pb-4 mb-6">
      <h2 className="text-2xl font-bold text-black">Nouveau service</h2>
      <p className="text-sm text-black mt-1">Section : {categoryTitle}</p>
    </div>
    
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
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

      {/* Section collaborateurs */}
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
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50"
          disabled={isSubmitting || (!formData.allowAllStaff && formData.selectedStaffIds.length === 0)}
        >
          {isSubmitting ? 'Création...' : 'Créer le service'}
        </button>
      </div>
    </form>
  </div>
</div>
  );
}