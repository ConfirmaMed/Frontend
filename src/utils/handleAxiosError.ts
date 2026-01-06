import axios from "axios";

// Funcion para manejar siempre los errores que me devuelve el backend
export const handleAxiosError = (
  error: unknown,
  defaultMessage: string
): never => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data.Message || defaultMessage;
    throw new Error(message);
  }

  throw new Error(defaultMessage);
};
