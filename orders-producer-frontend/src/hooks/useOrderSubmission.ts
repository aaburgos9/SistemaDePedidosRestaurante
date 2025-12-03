import { useState } from 'react';
import type { OrderPayload } from '../types/order';
import { createOrder } from '../services/orderService';

export const useOrderSubmission = () => {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitOrder = async (payload: OrderPayload): Promise<boolean> => {
    setIsSubmitting(true);

    try {
      const response = await createOrder(payload);

      if (response.success && response.data) {
        setSuccessMsg(
          `Pedido de ${response.data.customerName || payload.customerName} enviado a la mesa ${
            response.data.table || payload.table
          }.`
        );
      } else {
        setSuccessMsg(
          `Pedido de ${payload.customerName} enviado a la mesa ${payload.table}.`
        );
      }

      setTimeout(() => {
        setSuccessMsg(null);
      }, 2500);

      setIsSubmitting(false);
      return true;
    } catch (err) {
      console.error('Error enviando pedido', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setSuccessMsg(`⚠️ No se pudo enviar el pedido: ${errorMessage}`);
      
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
