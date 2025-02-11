import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Appointment } from '@/types/appointment';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string | null;
  onDelete: () => void;
}

export default function AppointmentDetailsModal({
  isOpen,
  onClose,
  appointmentId,
  onDelete
}: AppointmentDetailsModalProps) {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [serviceName, setServiceName] = useState<string>("");
  const [staffName, setStaffName] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      if (!appointmentId) return;

      try {
        const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
        if (!appointmentDoc.exists()) return;
        
        const data = appointmentDoc.data();
        const appointmentData: Appointment = {
          id: appointmentDoc.id,
          businessId: data.businessId,
          staffId: data.staffId,
          title: data.title,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          clientPhone: data.clientPhone,
          start: data.start.toDate(),
          end: data.end.toDate(),
          status: data.status,
          notes: data.notes || '',
          serviceId: data.serviceId || '',
          createdAt: data.createdAt?.toDate() || new Date()
        };
        
        setAppointment(appointmentData);

        if (appointmentData.serviceId) {
          const serviceDoc = await getDoc(doc(db, 'services', appointmentData.serviceId));
          if (serviceDoc.exists()) {
            setServiceName(serviceDoc.data().title);
          }
        }

        const staffDoc = await getDoc(doc(db, 'staff', appointmentData.staffId));
        if (staffDoc.exists()) {
          const staff = staffDoc.data();
          setStaffName(`${staff.firstName} ${staff.lastName}`);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
      }
    };

    if (isOpen && appointmentId) {
      fetchAppointmentDetails();
    }
  }, [appointmentId, isOpen]);

  const handleCancel = async () => {
    if (!appointment) return;
    
    setIsUpdating(true);
    try {
      const appointmentRef = doc(db, 'appointments', appointment.id);
      await updateDoc(appointmentRef, {
        status: 'cancelled',
        updatedAt: new Date()
      });
      
      setAppointment(prev => prev ? { ...prev, status: 'cancelled' } : null);
      setShowCancelConfirm(false);
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!appointment || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white border border-black rounded-[10px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {!showCancelConfirm ? (
          <>
            <h2 className="text-2xl font-bold text-black border-b border-black pb-4 mb-6">
              Détails du rendez-vous
              {appointment.status === 'cancelled' && (
                <span className="ml-2 text-lg">(Annulé)</span>
              )}
            </h2>

            <div className="space-y-8">

          {/* Section 1: Client et Collaborateur */}
          <div className="border border-black rounded-[10px] p-4">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-bold text-black mb-2">Client</p>
                <p className="text-lg text-black">{appointment.clientName}</p>
              </div>
              <div>
                <p className="text-sm font-bold text-black mb-2">Collaborateur</p>
                <p className="text-lg text-black">{staffName}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Service et Statut */}
<div className="border border-black rounded-[10px] p-4">
 <div className="grid grid-cols-2 gap-8">
   <div>
     <p className="text-sm font-bold text-black mb-2">Service</p>
     <p className="text-lg text-black">{serviceName}</p>
   </div>
   <div>
     <p className="text-sm font-bold text-black mb-2">Statut</p>
     <div>
       <span className={`px-4 py-1 text-xs border rounded-[10px] font-medium inline-block w-24 text-center
         ${appointment.status === 'confirmed' 
           ? 'border-[#4ade80] text-[#4ade80]' 
           : appointment.status === 'cancelled'
           ? 'border-[#f87171] text-[#f87171]' 
           : 'border-black text-black'}`}
       >
         {appointment.status === 'confirmed' ? 'Confirmé' : 
          appointment.status === 'pending' ? 'En attente' : 'Annulé'}
       </span>
     </div>
   </div>
 </div>
</div>

          {/* Section 3: Date et Horaire */}
          <div className="border border-black rounded-[10px] p-4">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-bold text-black mb-2">Date</p>
                <p className="text-lg text-black">
                  {format(appointment.start, 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <div>
                <p className="text-sm font-bold text-black mb-2">Horaire</p>
                <p className="text-lg text-black">
                  {format(appointment.start, 'HH:mm')} - {format(appointment.end, 'HH:mm')}
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Contact */}
          <div className="border border-black rounded-[10px] p-4">
            <p className="text-sm font-bold text-black mb-2">Contact</p>
            <p className="text-lg text-black">{appointment.clientEmail}</p>
            <p className="text-lg text-black">{appointment.clientPhone}</p>
          </div>

          {/* Section 5: Notes (if any) */}
          {appointment.notes && (
            <div className="border border-black rounded-[10px] p-4">
              <p className="text-sm font-bold text-black mb-2">Notes</p>
              <p className="text-lg text-black whitespace-pre-line">{appointment.notes}</p>
            </div>
          )}

{/* Boutons */}
<div className="flex justify-end gap-4 pt-4">
                {appointment.status !== 'cancelled' && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
                  >
                    Annuler le rendez-vous
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-black border-b border-black pb-4">
              Confirmation d'annulation
            </h2>
            
            <div className="border border-black rounded-[10px] p-4">
              <p className="text-lg text-black mb-6">
                Êtes-vous sûr de vouloir annuler ce rendez-vous ?
              </p>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
                  disabled={isUpdating}
                >
                  Retour
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Annulation...' : 'Confirmer l\'annulation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
