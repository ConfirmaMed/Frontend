import type {
  DoctorRequest,
  DoctorUpdateRequest,
} from "@/interfaces/doctorsInterface";
import { doctorsService } from "@/services/doctorsService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Hook para obtener todos los doctores con parámetros opcionales
export const useDoctors = (params: {
  limit?: number | null;
  offset?: number | null;
  search?: string | null;
}) => {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () =>
      doctorsService.getAllDoctors(
        params.limit ?? null,
        params.offset ?? null,
        params.search ?? null
      ),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un doctor por su ID
export const useDoctorById = (id: number) => {
  return useQuery({
    queryKey: ["doctor", id],
    queryFn: () => {
      if (!id) throw new Error("El ID del doctor es requerido");
      return doctorsService.getDoctorById(id);
    },
    enabled: !!id,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  });
};

// Hook para crear un nuevo doctor
export const useCreateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DoctorRequest) => doctorsService.createDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
    },
  });
};

// Hook para actualizar un doctor existente
export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ...data }: DoctorUpdateRequest) =>
      doctorsService.updateDoctor(data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      queryClient.invalidateQueries({ queryKey: ["doctor", id] });
    },
  });
};
