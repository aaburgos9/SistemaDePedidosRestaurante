import { useState } from 'react';
import type { OrderPayload } from '../types/order';

const API_URL = 'http://localhost:8000/api/v1/orders';

export const useOrderSubmission = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOrder = async (payload: OrderPayload): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        throw new Error('Error al enviar pedido: ' + resp.status);
      }

      const data = await resp.json();

      setSuccessMsg(
        `Pedido de ${data.customerName || payload.customerName} enviado a la mesa ${
          data.table || payload.table
        }.`
      );

      setTimeout(() => {
        setSuccessMsg(null);
      }, 2500);

      setIsSubmitting(false);
      return true;
    } catch (err) {
      console.error('Error enviando pedido', err);
      setSuccessMsg('⚠️ No se pudo enviar el pedido. Revisa el backend.');
      
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);

      setIsSubmitting(false);
      return false;
    }
  };

  return {
    submitOrder,
    successMsg,
    isSubmitting
  };
};
