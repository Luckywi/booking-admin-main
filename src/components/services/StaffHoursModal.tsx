'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, getDoc, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '@/components/auth/AuthProvider';
import StaffColorPicker from '@/components/staff/StaffColorPicker';
import type { Appointment, AppointmentFormData } from '@/types/appointment';
import type { Staff } from '@/types/staff';
import type { Service, ServiceCategory } from '@/types/service';
import type { BusinessHours, BreakPeriod } from '@/types/business';
import BreakPeriodsModal from './BreakPeriodsModal';

interface StaffHoursModalProps {
 isOpen: boolean;
 onClose: () => void;
 staffId: string;
 businessId: string;
}

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
 sunday: { day: 'Dimanche', isOpen: false, breakPeriods: [] }
};

export default function StaffHoursModal({ isOpen, onClose, staffId, businessId }: StaffHoursModalProps) {
 const [hours, setHours] = useState<BusinessHours['hours']>(defaultHours);
 const [isSaving, setIsSaving] = useState(false);
 const [staffData, setStaffData] = useState({
   firstName: '',
   lastName: '',
   color: '#FF5733'
 });
 const [selectedDay, setSelectedDay] = useState<keyof BusinessHours['hours'] | null>(null);

 useEffect(() => {
   const fetchData = async () => {
     try {
       // Récupérer les horaires
       const hoursDoc = await getDoc(doc(db, 'staffHours', staffId));
       if (hoursDoc.exists()) {
         setHours(hoursDoc.data().hours);
       }

       // Récupérer les informations du staff
       const staffDoc = await getDoc(doc(db, 'staff', staffId));
       if (staffDoc.exists()) {
         const data = staffDoc.data();
         setStaffData({
           firstName: data.firstName,
           lastName: data.lastName,
           color: data.color || '#FF5733'
         });
       }
     } catch (error) {
       console.error('Erreur lors de la récupération des données:', error);
     }
   };

   if (isOpen && staffId) {
     fetchData();
   }
 }, [staffId, isOpen]);

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

 const handleSave = async () => {
   try {
     setIsSaving(true);

     // Sauvegarder les horaires
     await setDoc(doc(db, 'staffHours', staffId), {
       staffId,
       businessId,
       hours,
       updatedAt: new Date()
     });

     // Mettre à jour les informations du staff
     await updateDoc(doc(db, 'staff', staffId), {
       color: staffData.color,
       updatedAt: new Date()
     });

     onClose();
   } catch (error) {
     console.error('Erreur lors de la sauvegarde:', error);
   } finally {
     setIsSaving(false);
   }
 };

 if (!isOpen) return null;

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white border border-black rounded-[10px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
       <h2 className="text-2xl font-bold text-black border-b border-black pb-4 mb-6">
         Paramètres du collaborateur : {staffData.firstName} {staffData.lastName}
       </h2>

       {/* Section Couleur */}
       <div className="mb-6 border border-black rounded-[10px] p-4">
         <h3 className="text-lg font-bold text-black mb-4">Couleur des rendez-vous</h3>
         <StaffColorPicker
           color={staffData.color}
           onChange={(color) => setStaffData(prev => ({ ...prev, color }))}
         />
       </div>

       {/* Section Horaires */}
       <div className="border border-black rounded-[10px] p-4">
         <h3 className="text-lg font-bold text-black mb-4">Horaires de disponibilité</h3>
         {orderedDays.map(({ key, label }) => {
           const dayHours = hours[key as keyof typeof hours];
           return (
             <div 
               key={key}
               className="flex items-center space-x-4 py-3 border-b border-black last:border-0"
             >
               <div className="w-32">
                 <span className="font-medium text-black">{label}</span>
               </div>
               <div className="flex-1 flex items-center space-x-4">
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     checked={dayHours.isOpen}
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
                   <span className="text-black">Disponible</span>
                 </label>

                 {dayHours.isOpen && (
                   <>
                     <input
                       type="time"
                       value={dayHours.openTime}
                       onChange={(e) => {
                         setHours((prev: any) => ({
                           ...prev,
                           [key]: {
                             ...prev[key],
                             openTime: e.target.value
                           }
                         }));
                       }}
                       className="border border-black rounded-[10px] p-2 text-black outline-none focus:outline-none"
                     />
                     <span className="text-black">-</span>
                     <input
                       type="time"
                       value={dayHours.closeTime}
                       onChange={(e) => {
                         setHours((prev: any) => ({
                           ...prev,
                           [key]: {
                             ...prev[key],
                             closeTime: e.target.value
                           }
                         }));
                       }}
                       className="border border-black rounded-[10px] p-2 text-black outline-none focus:outline-none"
                     />

                     <button
                       onClick={() => setSelectedDay(key as keyof BusinessHours['hours'])}
                       className="px-3 py-1 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-all text-sm"
                     >
                       Gérer les pauses
                     </button>

                     {dayHours.breakPeriods?.length > 0 && (
                       <span className="text-sm text-black">
                         ({dayHours.breakPeriods.length} pause{dayHours.breakPeriods.length > 1 ? 's' : ''})
                       </span>
                     )}
                   </>
                 )}
                 
                 {!dayHours.isOpen && (
                   <span className="text-black italic">Non disponible</span>
                 )}
               </div>
             </div>
           );
         })}
       </div>

       <div className="mt-6 flex justify-end gap-4">
         <button
           onClick={onClose}
           className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors"
         >
           Annuler
         </button>
         <button
           onClick={handleSave}
           disabled={isSaving}
           className="px-4 py-2 border border-black text-black rounded-[10px] hover:bg-gray-50 transition-colors disabled:opacity-50"
         >
           {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
         </button>
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
   </div>
 );
}