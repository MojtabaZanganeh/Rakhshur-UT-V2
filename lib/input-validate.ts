export const validatePersian = (value: string) => {
  return /^[\u0600-\u06FF\s]*$/.test(value);
};

export const validateNumber = (value: string) => {
  return /^\d*$/.test(value);
};