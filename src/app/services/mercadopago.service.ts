import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PreferenceResponse } from './physical-store.service';

export type PaymentStatusFeedback = 'approved' | 'pending' | 'rejected' | null;

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  readonly publicKey: string = environment.mercadoPago?.publicKey || '';
  readonly collectorId: string = environment.mercadoPago?.collectorId || '';
  readonly isProduction: boolean = environment.production;

  /**
   * Abre la pasarela de pago oficial de Mercado Pago (Checkout Pro).
   * Selecciona adecuadamente entre initPoint y sandboxInitPoint según el entorno o disponibilidad.
   */
  openCheckout(preference: PreferenceResponse): boolean {
    if (!preference) return false;

    // En desarrollo local o entorno de prueba, preferir sandboxInitPoint si está disponible
    const checkoutUrl = (!this.isProduction && preference.sandboxInitPoint)
      ? preference.sandboxInitPoint
      : (preference.initPoint || preference.sandboxInitPoint);

    if (checkoutUrl && checkoutUrl.trim().startsWith('http')) {
      window.open(checkoutUrl.trim(), '_blank');
      return true;
    }
    return false;
  }

  /**
   * Interpreta los parámetros de retorno que Mercado Pago inyecta al redirigir al frontend.
   */
  evaluateReturnParams(params: Record<string, any>): { status: PaymentStatusFeedback; paymentId?: string; externalReference?: string } {
    const status = params['status'] || params['collection_status'];
    const paymentId = params['payment_id'] || params['collection_id'];
    const externalReference = params['external_reference'];

    if (status === 'approved') {
      return { status: 'approved', paymentId, externalReference };
    }
    if (status === 'pending' || status === 'in_process') {
      return { status: 'pending', paymentId, externalReference };
    }
    if (status === 'rejected' || status === 'cancelled' || status === 'null') {
      return { status: 'rejected', paymentId, externalReference };
    }

    return { status: null, paymentId, externalReference };
  }
}
