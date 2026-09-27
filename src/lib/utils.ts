/**
 * Calcula la edad exacta en años a partir de una fecha de nacimiento (YYYY-MM-DD)
 */
export function calculateAge(fechaNacimiento: string): number {
  if (!fechaNacimiento) return 0;

  const today = new Date();
  const birthDate = new Date(fechaNacimiento);

  if (isNaN(birthDate.getTime())) return 0;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Valida si una persona cumple con la edad requerida de 15 a 18 años para el registro manual.
 */
export function validateAgeRangeForRegister(fechaNacimiento: string): {
  valid: boolean;
  age: number;
  message?: string;
} {
  const age = calculateAge(fechaNacimiento);

  if (age < 15 || age > 18) {
    return {
      valid: false,
      age,
      message: 'Usted no cumple con la edad requerida (debe tener entre 15 y 18 años).'
    };
  }

  return {
    valid: true,
    age
  };
}
