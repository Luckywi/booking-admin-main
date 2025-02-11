'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/components/auth/AuthProvider';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter, useParams } from 'next/navigation';
import type { Appointment } from '@/types/appointment';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastAppointment: Date;
  totalAppointments: number;
  totalSpent: number;
  averageSpent: number;
}

interface AppointmentData extends Omit<Appointment, 'start' | 'end' | 'createdAt' | 'id'> {
  start: { toDate: () => Date };
  end: { toDate: () => Date };
  createdAt?: { toDate: () => Date };
}

export default function ClientsPage() {
  const router = useRouter();
  const params = useParams();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const businessId = params?.businessId as string;

  useEffect(() => {
    const fetchClients = async () => {
      if (!businessId) return;

      try {
        // Récupérer tous les rendez-vous
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('businessId', '==', businessId)
        );

        const appointmentsSnapshot = await getDocs(appointmentsQuery);
        const appointmentsData = appointmentsSnapshot.docs.map(doc => {
          const data = doc.data() as AppointmentData;
          return {
            id: doc.id,
            ...data,
            start: data.start.toDate(),
            end: data.end.toDate(),
            createdAt: data.createdAt?.toDate() || new Date()
          } as Appointment;
        });

        // Grouper les rendez-vous par client
        const clientsMap = new Map<string, Client>();

        for (const appointment of appointmentsData) {
          const clientId = `${appointment.clientEmail}-${appointment.clientPhone}`;
          
          // Récupérer le service pour obtenir le prix
          let servicePrice = 0;
          if (appointment.serviceId) {
            const serviceDoc = await getDoc(doc(db, 'services', appointment.serviceId));
            if (serviceDoc.exists()) {
              servicePrice = serviceDoc.data().price || 0;
            }
          }

          if (!clientsMap.has(clientId)) {
            clientsMap.set(clientId, {
              id: clientId,
              name: appointment.clientName,
              email: appointment.clientEmail,
              phone: appointment.clientPhone,
              lastAppointment: appointment.start,
              totalAppointments: 1,
              totalSpent: servicePrice,
              averageSpent: servicePrice
            });
          } else {
            const client = clientsMap.get(clientId)!;
            client.totalAppointments += 1;
            client.totalSpent += servicePrice;
            client.averageSpent = client.totalSpent / client.totalAppointments;
            if (appointment.start > client.lastAppointment) {
              client.lastAppointment = appointment.start;
            }
          }
        }

        // Convertir la map en tableau et trier par date du dernier rendez-vous
        const clientsList = Array.from(clientsMap.values()).sort((a, b) => 
          b.lastAppointment.getTime() - a.lastAppointment.getTime()
        );

        setClients(clientsList);
      } catch (error) {
        console.error('Erreur lors de la récupération des clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [businessId]);

  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm)
    );
  });

  if (!businessId) {
    return <div className="p-6 text-black">Accès non autorisé</div>;
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

  return (
    <div className="p-6 bg-white rounded-[10px]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Clients ({filteredClients.length})</h1>
        <div className="flex gap-2">
        <input
  type="text"
  placeholder="Rechercher un client..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="px-4 py-2 border border-black rounded-[10px] text-black placeholder-black focus:outline-none"
/>
        </div>
      </div>
  
      <div className="bg-white border border-black rounded-[10px] overflow-hidden">
        <table className="min-w-full divide-y divide-black">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Dernier RDV
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Total RDV
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                Dépenses
              </th>
              
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-black">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-black">{client.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">{client.email}</div>
                  <div className="text-sm text-black">{client.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">
                    {format(client.lastAppointment, 'EEEE d MMMM yyyy', { locale: fr })}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">{client.totalAppointments}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-black">
                    Total: {client.totalSpent}€
                    <br />
                    Moyenne: {client.averageSpent.toFixed(2)}€/visite
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => router.push(`/dashboard/business/${businessId}/clients/${encodeURIComponent(client.id)}`)}
                    className="text-black hover:border hover:border-black rounded-[10px] px-4 py-2 transition-all"
                  >
                    Voir détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
          <div className="text-center py-8 text-black">
            Aucun client trouvé
            {searchTerm && ' pour cette recherche'}
          </div>
        )}
      </div>
    </div>
  );
  
}
