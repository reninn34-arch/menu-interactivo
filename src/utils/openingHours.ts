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

/**
 * Check if the restaurant is currently open based on opening hours
 */
export function isRestaurantOpen(siteConfig: SiteConfig): RestaurantStatus {
  // If no opening hours configured, assume always open
  if (!siteConfig.openingHours) {
    return {
      isOpen: true,
      message: 'Abierto 24/7'
    };
  }

  // If orders are allowed outside hours, always return open
  if (siteConfig.allowOrdersOutsideHours) {
    return {
      isOpen: true,
      message: 'Pedidos disponibles 24/7'
    };
  }

  const now = new Date();
  const currentDay = dayKeys[now.getDay()];
  const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight

  const todayHours = siteConfig.openingHours[currentDay];

  // If today is marked as closed
  if (!todayHours || todayHours.closed) {
    // Find next open day
    const nextOpen = findNextOpenDay(siteConfig.openingHours, now.getDay());
    return {
      isOpen: false,
      message: 'Cerrado hoy',
      nextChange: nextOpen
    };
  }

  // Parse opening and closing times
  const [openHour, openMin] = todayHours.open.split(':').map(Number);
  const [closeHour, closeMin] = todayHours.close.split(':').map(Number);
  const openTime = openHour * 60 + openMin;
  const closeTime = closeHour * 60 + closeMin;

  // Check if currently within opening hours
  if (currentTime >= openTime && currentTime < closeTime) {
    return {
      isOpen: true,
      message: `Abierto hasta las ${todayHours.close}`
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

/**
 * Find the next day the restaurant will be open
 */function findNextOpenDay(
  openingHours: NonNullable<SiteConfig['openingHours']>,
  currentDayIndex: number
): { day: string; time: string } | undefined {
  // Check next 7 days
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

/**
 * Get a formatted schedule string for display
 */
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
