import axiosService from "@/config/axiosService";
import type { AppointmentRequest } from "@/interfaces/appointmentsInterface";
import { handleAxiosError } from "@/utils/handleAxiosError";

// URL base para las operaciones de citas
const API_URL = "/appointments";

// Crear una o varias citas
const createAppointment = async (appointmentData: AppointmentRequest) => {
  try {
    const response = await axiosService.post(
      `${API_URL}`,
      appointmentData
    );
    return response.data;
  } catch (error) {
    handleAxiosError(error, "Error al crear la o las agendas");
  }
};

// Exportar el servicio de citas
export const appointmentsService = {
  createAppointment,
};
