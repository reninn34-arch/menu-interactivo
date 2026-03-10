import type { SiteConfig } from '../types';

export interface RestaurantStatus {
  isOpen: boolean;
  message: string;
  nextChange?: {
    day: string;
    time: string;
  };
}

const dayNames = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

const dayKeys: Array<keyof NonNullable<SiteConfig['openingHours']>> = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

// Verifica si el restaurante está abierto ahora
export function isRestaurantOpen(siteConfig: SiteConfig): RestaurantStatus {
  // Sin horarios configurados = siempre abierto
  if (!siteConfig.openingHours) {
    return {
      isOpen: true,
      message: 'Abierto 24/7'
    };
  }

  // Si permiten pedidos 24/7, ya está
  if (siteConfig.allowOrdersOutsideHours) {
    return {
      isOpen: true,
      message: 'Pedidos disponibles 24/7'
    };
  }

  const now = new Date();
  const currentDay = dayKeys[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todayHours = siteConfig.openingHours[currentDay];

  // Día cerrado? buscar el próximo que abran
  if (!todayHours || todayHours.closed) {
    const nextOpen = findNextOpenDay(siteConfig.openingHours, now.getDay());
    return {
      isOpen: false,
      message: 'Cerrado hoy',
      nextChange: nextOpen
    };
  }

  // Convertir horarios a minutos para comparar fácil
  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  let closeTime = closeHour * 60 + closeMin;
  
  // Si cierra a las 00:00, significa medianoche (final del día = 24:00 = 1440 minutos)
  if (closeTime === 0) {
    closeTime = 1440;
  }

  // Dentro del horario?
  if (currentTime >= openTime && currentTime < closeTime) {
    const displayClose = closeTime === 1440 ? '00:00' : todayHours.close;
    return {
      isOpen: true,
      message: `Abierto hasta las ${displayClose}`
    };
  }

  // Before opening time today
  if (currentTime < openTime) {
    return {
      isOpen: false,
      message: `Abre hoy a las ${todayHours.open}`
    };
  }

  // After closing time today - find next open day
  const nextOpen = findNextOpenDay(siteConfig.openingHours, now.getDay());
  return {
    isOpen: false,
    message: nextOpen 
      ? `Cerrado - Abre ${nextOpen.day} a las ${nextOpen.time}`
      : 'Cerrado'
  };
}

// Busca el próximo día que abren
function findNextOpenDay(
  openingHours: NonNullable<SiteConfig['openingHours']>,
  currentDayIndex: number
): { day: string; time: string } | undefined {
  // Revisar los próximos 7 días
  for (let i = 1; i <= 7; i++) {
    const nextDayIndex = (currentDayIndex + i) % 7;
    const nextDayKey = dayKeys[nextDayIndex];
    const nextDayHours = openingHours[nextDayKey];

    if (nextDayHours && !nextDayHours.closed) {
      const dayName = i === 1 ? 'mañana' : dayNames[nextDayKey];
      return {
        day: dayName,
        time: nextDayHours.open
      };
    }
  }

  return undefined;
}

// Formatea el horario para mostrar en UI
export function getScheduleDisplay(siteConfig: SiteConfig): string[] {
  if (!siteConfig.openingHours) {
    return ['Abierto 24/7'];
  }

  const schedule: string[] = [];

  dayKeys.forEach((dayKey) => {
    const dayHours = siteConfig.openingHours?.[dayKey];
    const dayName = dayNames[dayKey];

    if (!dayHours || dayHours.closed) {
      schedule.push(`${dayName}: Cerrado`);
    } else {
      schedule.push(`${dayName}: ${dayHours.open} - ${dayHours.close}`);
    }
  });

  return schedule;
}
