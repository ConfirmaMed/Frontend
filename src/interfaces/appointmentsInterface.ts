// Interfaz para obtener los datos de la api de una cita
export interface AppointmentRequest {
  dates: string[];
  startHour: string;
  endHour: string;
  durationId: number;
  doctorId: number;
  specialityId: number;
}
