'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { db } from '@/lib/firebase/config';
import { addDoc, collection } from 'firebase/firestore';
import StaffColorPicker from '@/components/staff/StaffColorPicker';


interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStaffModal({ isOpen, onClose, onSuccess }: AddStaffModalProps) {
  const { userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    color: '#FF6B6B', // Couleur par défaut
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData?.businessId) return;

    try {
      setIsSubmitting(true);

      await addDoc(collection(db, 'staff'), {
        businessId: userData.businessId,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        color: formData.color, // Ajout de la couleur
        createdAt: new Date(),
      });

      onSuccess();
      setFormData({
        firstName: '',
        lastName: '',
        color: '#FF6B6B',
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du collaborateur:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white border border-black rounded-[10px] p-6 w-full max-w-md">
    <h2 className="text-2xl font-bold text-black border-b border-black pb-4 mb-6">
      Ajouter un collaborateur
    </h2>

    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-black rounded-[10px] p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Prénom
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full p-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-2">
              Nom
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full p-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
              required
            />
          </div>
        </div>
      </div>

      {/* Ajout du sélecteur de couleur */}
      <div className="border border-black rounded-[10px] p-4">
        <StaffColorPicker
          color={formData.color}
          onChange={(color) => setFormData({...formData, color})}
        />
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  </div>
</div>
  );
}