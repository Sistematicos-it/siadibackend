import { generate } from 'otp-generator';

export function generateOtpCode(): string {
  const options = {
    digits: true, // Incluir dígitos (0-9)
    lowerCaseAlphabets: true, // Incluir letras mayúsculas y minúsculas (A-Z, a-z)
    upperCaseAlphabets: true, // Incluir solo letras mayúsculas (A-Z)
    specialChars: false, // Excluir caracteres especiales (!@#$%^&*)
    length: 6, // Longitud del código OTP
  };
  return generate(6, options);
}

export function generateNumberOtpCode(): string {
  const options = {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
    length: 6,
  };

  return generate(6, options);
}
