'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/auth/AuthProvider';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Appointment } from '@/types/appointment';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function ClientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { userData } = useAuth();
  const [clientDetails, setClientDetails] = useState<{
    name: string;
    email: string;
    phone: string;
    appointments: Array<Appointment & { serviceName?: string; servicePrice?: number }>;
    totalAppointments: number;
    firstAppointment: Date;
    lastAppointment: Date;
    totalSpent: number;
    averageSpent: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const businessId = params?.businessId as string;
  const clientId = params?.clientId as string;

  useEffect(() => {
    const fetchClientDetails = async () => {
      if (!businessId || !clientId) return;

      try {
        const [email, phone] = decodeURIComponent(clientId).split('-');

        // Récupérer tous les rendez-vous du client
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('businessId', '==', businessId),
          where('clientEmail', '==', email),
          where('clientPhone', '==', phone)
        );

        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        if (appointmentsSnapshot.empty) {
          console.error('Client non trouvé');
          return;
        }

        let totalSpent = 0;
        const appointments: Array<Appointment & { serviceName?: string; servicePrice?: number }> = [];

        // Récupérer les détails des services pour chaque rendez-vous
        for (const docRef of appointmentsSnapshot.docs) {
          const appointmentData = docRef.data();
          let serviceName = '';
          let servicePrice = 0;

          if (appointmentData.serviceId) {
            const serviceDoc = await getDoc(doc(db, 'services', appointmentData.serviceId));
            if (serviceDoc.exists()) {
              const serviceData = serviceDoc.data();
              serviceName = serviceData.title;
              servicePrice = serviceData.price || 0;
              totalSpent += servicePrice;
            }
          }

          appointments.push({
            id: docRef.id,
            staffId: appointmentData.staffId,
            businessId: appointmentData.businessId,
            title: appointmentData.title,
            clientName: appointmentData.clientName,
            clientEmail: appointmentData.clientEmail,
            clientPhone: appointmentData.clientPhone,
            start: appointmentData.start.toDate(),
            end: appointmentData.end.toDate(),
            status: appointmentData.status,
            notes: appointmentData.notes,
            serviceId: appointmentData.serviceId,
            createdAt: appointmentData.createdAt?.toDate() || new Date(),
            serviceName,
            servicePrice
          });
        }

        // Trier les rendez-vous par date
        appointments.sort((a, b) => b.start.getTime() - a.start.getTime());

        setClientDetails({
          name: appointments[0].clientName,
          email,
          phone,
          appointments,
          totalAppointments: appointments.length,
          firstAppointment: appointments[appointments.length - 1].start,
          lastAppointment: appointments[0].start,
          totalSpent,
          averageSpent: totalSpent / appointments.length
        });
      } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [businessId, clientId]);

  // Vérification de sécurité utilisant userData implicitement via businessId
  if (!businessId || businessId !== userData?.businessId) {
    return <div className="p-6">Accès non autorisé</div>;
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
    <div className="text-center">
      <div className="animate-spin rounded-[10px] h-32 w-32 border-2 border-black"></div>
      <p className="mt-4 text-black">Chargement...</p>
    </div>
  </div>
    );
  }

  if (!clientDetails) {
    return (
      <div className="p-6">
    <div className="border border-black p-4 rounded-[10px] mb-4">
      <p className="text-black">Client non trouvé</p>
    </div>
    <button
      onClick={() => router.push(`/dashboard/business/${businessId}/clients`)}
      className="text-black hover:border hover:border-black rounded-[10px] px-4 py-2 transition-all"
    >
      Retour à la liste des clients
    </button>
  </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-[10px]">
    <div className="mb-6">
    <button
  onClick={() => router.push(`/dashboard/business/${businessId}/clients`)}
  className="border border-black rounded-[10px] px-4 py-2 text-black hover:bg-gray-50 transition-all mb-4 flex items-center gap-2"
>
  <ArrowLeft className="h-4 w-4" />
  Retour à la liste des clients
</button>

      <h1 className="text-2xl font-bold text-black">{clientDetails.name}</h1>
    </div>

      {/* Section Informations Client */}
<div className="bg-white border border-black rounded-[10px] mb-6 p-6">
  <h2 className="text-xl font-bold text-black mb-6">Informations client</h2>
  <div className="grid grid-cols-2 gap-8">
    <div className="border-b border-black pb-4">
      <p className="text-sm font-medium text-black mb-2">Email</p>
      <p className="text-lg text-black">{clientDetails.email}</p>
    </div>
    <div className="border-b border-black pb-4">
      <p className="text-sm font-medium text-black mb-2">Téléphone</p>
      <p className="text-lg text-black">{clientDetails.phone}</p>
    </div>
    <div className="border-b border-black pb-4">
      <p className="text-sm font-medium text-black mb-2">Premier rendez-vous</p>
      <p className="text-lg text-black">
        {format(clientDetails.firstAppointment, 'EEEE d MMMM yyyy', { locale: fr })}
      </p>
    </div>
    <div className="border-b border-black pb-4">
      <p className="text-sm font-medium text-black mb-2">Dernier rendez-vous</p>
      <p className="text-lg text-black">
        {format(clientDetails.lastAppointment, 'EEEE d MMMM yyyy', { locale: fr })}
      </p>
    </div>
    <div className="border-b border-black pb-4">
      <p className="text-sm font-medium text-black mb-2">Total des rendez-vous</p>
      <p className="text-lg text-black">{clientDetails.totalAppointments}</p>
    </div>
    <div className="border-b border-black pb-4">
      <p className="text-sm font-medium text-black mb-2">Dépenses</p>
      <div className="text-lg text-black">
        <p>Total: {clientDetails.totalSpent}€</p>
        <p>Moyenne: {clientDetails.averageSpent.toFixed(2)}€/visite</p>
      </div>
    </div>
  </div>
</div>

{/* Section Historique des Rendez-vous */}
<div className="bg-white border border-black rounded-[10px]">
  <div className="px-6 py-4 border-b border-black">
    <h2 className="text-lg font-semibold text-black">Historique des rendez-vous</h2>
  </div>
  {/* Wrapper pour préserver les coins arrondis */}
  <div className="rounded-b-[10px] overflow-hidden">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-black">
          <thead className="bg-white">
            <tr>
              {["Date", "Horaire", "Service", "Prix", "Status", "Notes"].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-black">
            {clientDetails.appointments.map((appointment) => (
              <tr key={appointment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">
                    {format(appointment.start, 'EEEE d MMMM yyyy', { locale: fr })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">
                    {format(appointment.start, 'HH:mm')} - {format(appointment.end, 'HH:mm')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">{appointment.serviceName || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">{appointment.servicePrice}€</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
  <span className={`px-4 py-1 text-xs border rounded-[10px] font-medium inline-block w-24 text-center
    ${appointment.status === 'confirmed' 
      ? 'border-[#4ade80] text-[#4ade80]' 
      : appointment.status === 'cancelled'
      ? 'border-[#f87171] text-[#f87171]' 
      : 'border-black text-black'}`}
  >
    {appointment.status === 'confirmed' ? 'Confirmé' : 
     appointment.status === 'cancelled' ? 'Annulé' : 'En attente'}
  </span>
</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-black">{appointment.notes || '-'}</div>
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
    </div>
  );
}
