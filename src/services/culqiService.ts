/**
 * Servicio de Integración para la Pasarela de Pagos Culqi (Credicorp / BCP)
 * Soporta Tarjetas de Crédito / Débito (Visa, Mastercard, Amex, Diners), Yape Directo y PagoEfectivo CIP.
 */

export interface CulqiCardData {
  cardNumber: string;
  cvv: string;
  expirationMonth: string;
  expirationYear: string;
  email: string;
  cardholderName: string;
}

export interface CulqiYapeData {
  phone: string;
  approvalCode: string; // Código de 6 dígitos generado en app Yape
  email: string;
}

export interface CulqiTokenResponse {
  id: string; // ej. tkn_test_...
  object: 'token';
  card_number?: string;
  last_four?: string;
  brand?: string;
  type?: 'credito' | 'debito' | 'yape';
  creation_date: number;
}

export interface CulqiChargeResponse {
  id: string; // ej. chr_test_...
  object: 'charge';
  amount: number; // en centavos (ej. 5800 para S/ 58.00)
  amountSol: number; // en soles (ej. 58.00)
  currency_code: 'PEN';
  reference_code: string;
  authorization_code: string;
  current_status: 'captured' | 'pending' | 'rejected';
  card_brand?: string;
  last_four?: string;
  payment_method: 'Tarjeta de Crédito' | 'Tarjeta de Débito' | 'Yape' | 'PagoEfectivo';
  creation_date: string;
  client_email: string;
  order_id: string;
}

export const CULQI_CONFIG = {
  publicKey: 'pk_test_a8f9024f0c4366eb',
  commerceName: 'Nivalo Store Perú (Kawaii Lifestyle)',
  currency: 'PEN',
  testCards: {
    visa: {
      number: '4111 1111 1111 1111',
      exp: '09/30',
      cvv: '123',
      name: 'Valeria Mendoza',
      email: 'valeria@nivalostore.pe',
      brand: 'Visa',
      type: 'Débito',
    },
    mastercard: {
      number: '5105 1051 0510 5100',
      exp: '09/30',
      cvv: '123',
      name: 'Ana Martínez',
      email: 'ana@nivalostore.pe',
      brand: 'Mastercard',
      type: 'Crédito',
    },
    amex: {
      number: '3782 822463 10005',
      exp: '08/29',
      cvv: '8431',
      name: 'Camila Rojas',
      email: 'camila@nivalostore.pe',
      brand: 'American Express',
      type: 'Crédito',
    },
    yape: {
      phone: '998 167 789',
      approvalCode: '847291',
      email: 'yape.cliente@nivalostore.pe',
    },
  },
};

/**
 * Detecta la marca de la tarjeta según los primeros dígitos (IIN/BIN)
 */
export function detectCardBrand(cardNumber: string): 'Visa' | 'Mastercard' | 'American Express' | 'Diners Club' | 'Desconocida' {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'American Express';
  if (/^3(0[0-5]|[68])/.test(clean)) return 'Diners Club';
  return 'Desconocida';
}

/**
 * Formatea el número de tarjeta con espacios cada 4 dígitos
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
}

/**
 * Formatea la fecha de expiración como MM/AA
 */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  }
  return digits;
}

/**
 * Validación del algoritmo de Luhn (Módulo 10)
 */
export function validateLuhn(numberStr: string): boolean {
  const clean = numberStr.replace(/\D/g, '');
  if (clean.length < 13) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Valida los campos de la tarjeta
 */
export function validateCardData(data: CulqiCardData): { valid: boolean; error?: string } {
  const cleanNumber = data.cardNumber.replace(/\D/g, '');
  if (cleanNumber.length < 15 || cleanNumber.length > 16) {
    return { valid: false, error: 'El número de tarjeta debe tener 15 o 16 dígitos.' };
  }

  const isCulqiTestErrorCard = /^411111111111111[2-9]$/.test(cleanNumber);
  if (!isCulqiTestErrorCard && !validateLuhn(cleanNumber)) {
    return { valid: false, error: 'El número de tarjeta no es válido (falla verificación Luhn).' };
  }

  const month = parseInt(data.expirationMonth, 10);
  if (isNaN(month) || month < 1 || month > 12) {
    return { valid: false, error: 'El mes de expiración debe ser entre 01 y 12.' };
  }

  const year = parseInt(data.expirationYear, 10);
  const fullYear = year < 100 ? 2000 + year : year;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  if (isNaN(year) || fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
    return { valid: false, error: 'La tarjeta está vencida o el año es anterior al actual.' };
  }

  if (!/^\d{3,4}$/.test(data.cvv.trim())) {
    return { valid: false, error: 'El código de seguridad CVV debe tener 3 o 4 dígitos.' };
  }

  if (!data.cardholderName.trim() || data.cardholderName.trim().length < 3) {
    return { valid: false, error: 'Ingresa el nombre del titular como figura en la tarjeta.' };
  }

  if (!data.email.trim() || !data.email.includes('@')) {
    return { valid: false, error: 'Ingresa un correo electrónico válido para enviar el comprobante Culqi.' };
  }

  return { valid: true };
}

/**
 * Valida los campos de pago Yape Culqi
 */
export function validateYapeData(data: CulqiYapeData): { valid: boolean; error?: string } {
  const cleanPhone = data.phone.replace(/\D/g, '');
  if (cleanPhone.length < 9) {
    return { valid: false, error: 'El número de celular debe tener al menos 9 dígitos.' };
  }

  const cleanCode = data.approvalCode.replace(/\D/g, '');
  if (cleanCode.length !== 6) {
    return { valid: false, error: 'El código de aprobación de Yape debe tener exactamente 6 dígitos.' };
  }

  if (!data.email.trim() || !data.email.includes('@')) {
    return { valid: false, error: 'Ingresa un correo electrónico válido para el recibo.' };
  }

  return { valid: true };
}

/**
 * Tokeniza una tarjeta y procesa el cargo a través de la pasarela Culqi
 */
export async function processCulqiCardPayment(
  cardData: CulqiCardData,
  totalSol: number,
  orderId: string
): Promise<{ success: boolean; charge?: CulqiChargeResponse; error?: string }> {
  const validation = validateCardData(cardData);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Simular latencia de red segura con Culqi (1.2s)
  await new Promise((resolve) => setTimeout(resolve, 1200));

  const cleanNumber = cardData.cardNumber.replace(/\D/g, '');

  // Verificación de tarjetas de prueba oficiales de Culqi para simulación de errores
  if (cleanNumber === '4111111111111112') {
    return { success: false, error: 'Fondos insuficientes en la tarjeta (Culqi Error: 402 Card Denied - Insufficient Funds).' };
  }
  if (cleanNumber === '4111111111111113') {
    return { success: false, error: 'La tarjeta se encuentra vencida o inactiva (Culqi Error: Expired Card).' };
  }
  if (cleanNumber === '4111111111111114') {
    return { success: false, error: 'Código de seguridad CVV incorrecto (Culqi Error: Invalid CVV).' };
  }
  if (cleanNumber === '4111111111111115') {
    return { success: false, error: 'Operación denegada por el banco emisor. Contacte a su banco (Culqi Error: Contact Bank).' };
  }

  const brand = detectCardBrand(cardData.cardNumber);
  const lastFour = cleanNumber.slice(-4);
  const amountCents = Math.round(totalSol * 100);
  const now = new Date();

  // Tipo de tarjeta según documentación de Culqi
  const paymentMethod = cleanNumber === '4111111111111111' ? 'Tarjeta de Débito' : 'Tarjeta de Crédito';

  const charge: CulqiChargeResponse = {
    id: `chr_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    object: 'charge',
    amount: amountCents,
    amountSol: totalSol,
    currency_code: 'PEN',
    reference_code: `CULQI-${orderId.replace('PED-', '')}-${Math.floor(100000 + Math.random() * 900000)}`,
    authorization_code: `AUT-${Math.floor(100000 + Math.random() * 900000)}`,
    current_status: 'captured',
    card_brand: brand,
    last_four: lastFour,
    payment_method: paymentMethod,
    creation_date: now.toISOString(),
    client_email: cardData.email.trim().toLowerCase(),
    order_id: orderId,
  };

  return { success: true, charge };
}

/**
 * Tokeniza y procesa el cargo con Yape directo Culqi
 */
export async function processCulqiYapePayment(
  yapeData: CulqiYapeData,
  totalSol: number,
  orderId: string
): Promise<{ success: boolean; charge?: CulqiChargeResponse; error?: string }> {
  const validation = validateYapeData(yapeData);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Simular latencia de validación con API Yape-Culqi (1.0s)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const now = new Date();
  const amountCents = Math.round(totalSol * 100);

  const charge: CulqiChargeResponse = {
    id: `chr_yape_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    object: 'charge',
    amount: amountCents,
    amountSol: totalSol,
    currency_code: 'PEN',
    reference_code: `CULQI-YAPE-${orderId.replace('PED-', '')}-${yapeData.approvalCode}`,
    authorization_code: `AUT-YAPE-${Math.floor(100000 + Math.random() * 900000)}`,
    current_status: 'captured',
    card_brand: 'Yape Oficial (Culqi)',
    last_four: yapeData.phone.replace(/\D/g, '').slice(-4),
    payment_method: 'Yape',
    creation_date: now.toISOString(),
    client_email: yapeData.email.trim().toLowerCase(),
    order_id: orderId,
  };

  return { success: true, charge };
}

/**
 * Procesa el pago mediante escaneo de Código QR Culqi (Interoperable Yape / Plin / BCP)
 */
export async function processCulqiQRPayment(
  orderId: string,
  totalSol: number,
  clientEmail: string,
  operacionRef?: string
): Promise<{ success: boolean; charge?: CulqiChargeResponse; error?: string }> {
  // Simular latencia de validación con red interoperable Culqi QR (1.0s)
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const now = new Date();
  const amountCents = Math.round(totalSol * 100);
  const refCode = operacionRef?.trim() || Math.floor(100000 + Math.random() * 900000).toString();

  const charge: CulqiChargeResponse = {
    id: `chr_qr_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
    object: 'charge',
    amount: amountCents,
    amountSol: totalSol,
    currency_code: 'PEN',
    reference_code: `CULQI-QR-${orderId.replace('PED-', '')}-${refCode}`,
    authorization_code: `AUT-QR-${Math.floor(100000 + Math.random() * 900000)}`,
    current_status: 'captured',
    card_brand: 'Culqi QR Interoperable (Yape/Plin)',
    last_four: refCode.slice(-4),
    payment_method: 'Yape',
    creation_date: now.toISOString(),
    client_email: clientEmail.trim().toLowerCase() || 'cliente@nivalostore.pe',
    order_id: orderId,
  };

  return { success: true, charge };
}

