'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Staff } from '@/types/staff';

interface StaffSelectorProps {
  businessId: string;
  selectedStaffId: string | null;
  onStaffSelect: (staffId: string | null) => void;
}

export default function StaffSelector({ 
  businessId, 
  selectedStaffId, 
  onStaffSelect 
}: StaffSelectorProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessId) return;

    const q = query(
      collection(db, 'staff'),
      where('businessId', '==', businessId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Staff[];
      
      setStaff(staffData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [businessId]);

  if (loading) {
    return (
      <div className="mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
 <div className="relative">
   <select
     value={selectedStaffId || ''}
     onChange={(e) => onStaffSelect(e.target.value || null)}
     className="w-full p-2 border border-black rounded-[10px] focus:outline-none hover:bg-gray-50 appearance-none cursor-pointer text-black pr-8"
   >
     <option value="" className="text-black">Tous les collaborateurs</option>
     {staff.map((member) => (
       <option key={member.id} value={member.id} className="text-black">
         {member.firstName} {member.lastName}
       </option>
     ))}
   </select>
   <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
     <svg className="w-4 h-4 fill-black" viewBox="0 0 20 20">
       <path d="M7 10l5 5 5-5z"/>
     </svg>
   </div>
 </div>
</div>
  );
}