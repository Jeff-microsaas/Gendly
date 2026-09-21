export const BRAZILIAN_HOLIDAYS_FIXED: Record<string, string> = {
  '01-01': 'Ano Novo / Confraternização Universal',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '12-25': 'Natal',
};

const parseDate = (dateInput: string | Date): { year: number; month: number; day: number; dateObj: Date } => {
  if (typeof dateInput === 'string') {
    const parts = dateInput.split('T')[0].split('-').map(Number);
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const dateObj = new Date(year, month - 1, day, 12, 0, 0);
      return { year, month, day, dateObj };
    }
  }
  const d = new Date(dateInput);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    dateObj: d,
  };
};

export const getHolidayName = (dateInput: string | Date): string | null => {
  const { month, day } = parseDate(dateInput);
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return BRAZILIAN_HOLIDAYS_FIXED[key] || null;
};

export const isHoliday = (dateInput: string | Date): boolean => {
  return getHolidayName(dateInput) !== null;
};

export const isWorkingDay = (
  dateInput: string | Date,
  workOnSaturdays = true,
  workOnSundays = false,
  workOnHolidays = false
): boolean => {
  const { dateObj } = parseDate(dateInput);
  const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 6 is Saturday

  if (dayOfWeek === 0 && !workOnSundays) {
    return false;
  }
  if (dayOfWeek === 6 && !workOnSaturdays) {
    return false;
  }
  if (!workOnHolidays && isHoliday(dateInput)) {
    return false;
  }
  return true;
};

export const getNonWorkingReason = (
  dateInput: string | Date,
  workOnSaturdays = true,
  workOnSundays = false,
  workOnHolidays = false
): string | null => {
  const { dateObj } = parseDate(dateInput);
  const dayOfWeek = dateObj.getDay();

  if (dayOfWeek === 0 && !workOnSundays) {
    return 'Domingo (sem expediente configurado)';
  }
  if (dayOfWeek === 6 && !workOnSaturdays) {
    return 'Sábado (sem expediente configurado)';
  }
  if (!workOnHolidays && isHoliday(dateInput)) {
    const holiday = getHolidayName(dateInput);
    return `Feriado: ${holiday} (sem expediente)`;
  }
  return null;
};

export const generateTimeSlots = (
  openingTime: string = '08:00',
  closingTime: string = '19:00',
  intervalMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  const [startH, startM] = (openingTime || '08:00').split(':').map(Number);
  const [endH, endM] = (closingTime || '19:00').split(':').map(Number);

  let current = new Date();
  current.setHours(startH, startM, 0, 0);

  const end = new Date();
  end.setHours(endH, endM, 0, 0);

  while (current <= end) {
    const h = String(current.getHours()).padStart(2, '0');
    const m = String(current.getMinutes()).padStart(2, '0');
    slots.push(`${h}:${m}`);
    current.setMinutes(current.getMinutes() + (intervalMinutes || 30));
  }
  return slots;
};
