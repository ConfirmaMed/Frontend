import type { AppointmentRequest } from "@/interfaces/appointmentsInterface";
import { appointmentsService } from "@/services/appointemntsService";
import { useMutation } from "@tanstack/react-query";

// Hook para crear una o varias agendas
export const useCreateAppointment = () => {
  return useMutation({
    mutationFn: (data: AppointmentRequest) =>
      appointmentsService.createAppointment(data),
  });
};
