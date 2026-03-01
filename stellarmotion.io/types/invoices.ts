export interface Payment {
  id: string;
  invoice_id: string;
  monto: number;
  fecha_pago: string;
  metodo?: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  numero: string;
  alquiler_id?: string | null;
  owner_contacto_id: string;
  brand_contacto_id: string;
  periodo_inicio: string;
  periodo_fin: string;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: 'pendiente' | 'enviada' | 'pagada' | 'vencida' | 'parcial' | 'cancelada';
  fecha_vencimiento: string;
  created_at: string;
  updated_at?: string | null;
  paid_amount?: number;
  brand_name?: string;
  owner_name?: string;
  soporte_nombre?: string;
  payments?: Payment[];
}
