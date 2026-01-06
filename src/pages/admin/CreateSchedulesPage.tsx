import Container from "@/components/partials/Container";
import { Calendar } from "@/components/ui/calendar";
import { CalendarPlus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import type { DateRange } from "react-day-picker";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  appointmentCreateSchema,
  type AppointmentCreateFormValues,
} from "@/schemas/appointmentsSchema";
import { useSpecialities } from "@/hooks/useSpecialities";
import { useDoctorsBySpeciality } from "@/hooks/useSpecialities";
import { useDurations } from "@/hooks/useDurations";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const CreateSchedulesPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: undefined,
  });
  const [selectedSpecialityId, setSelectedSpecialityId] = useState<
    number | null
  >(null);

  const { data: specialitiesData } = useSpecialities({
    limit: null,
    offset: null,
    search: null,
    status: true,
  });

  const { data: doctorsData, isLoading: loadingDoctors } =
    useDoctorsBySpeciality(selectedSpecialityId || 0);

  const { data: durationsData } = useDurations();
  const createAppointment = useCreateAppointment();

  const form = useForm<AppointmentCreateFormValues>({
    resolver: zodResolver(appointmentCreateSchema),
    defaultValues: {
      specialityId: undefined,
      doctorId: undefined,
      dates: [],
      startHour: "",
      endHour: "",
      durationId: undefined,
    },
  });

  // Actualizar las fechas cuando cambie el rango seleccionado
  useEffect(() => {
    if (dateRange?.from) {
      const dates: string[] = [];
      const currentDate = new Date(dateRange.from);
      const endDate = dateRange.to || dateRange.from;

      while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      form.setValue("dates", dates);
    }
  }, [dateRange, form]);

  // Resetear doctor cuando cambie la especialidad
  useEffect(() => {
    if (selectedSpecialityId) {
      form.resetField("doctorId");
    }
  }, [selectedSpecialityId, form]);

  const onSubmit = async (data: AppointmentCreateFormValues) => {
    // Validar que los campos opcionales estén presentes
    if (!data.specialityId || !data.doctorId) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    try {
      await createAppointment.mutateAsync({
        ...data,
        specialityId: data.specialityId,
        doctorId: data.doctorId,
      });
      toast.success(
        `${data.dates.length} agenda(s) médica(s) creada(s) exitosamente`
      );
      // Resetear formulario
      form.reset();
      setDateRange({ from: new Date(), to: undefined });
      setSelectedSpecialityId(null);
    } catch (error) {
      toast.error((error as Error).message || "Error al crear las agendas");
    }
  };

  const selectedDates = form.watch("dates");

  return (
    <Container
      titleModule="Creación de agendas médicas"
      description="Crea y administra las agendas médicas de los doctores"
      showButtons={false}
      icon={<CalendarPlus size={30} />}
    >
      <div className="grid xl:grid-cols-[2fr_1fr] gap-2 py-0.5 w-full">
        {/* Calendario */}
        <Card className="px-6">
          <div>
            <h3 className="text-lg font-semibold">Selecciona las fechas</h3>
            <p className="text-xs opacity-70">
              Elige las fechas para las cuales deseas crear las agendas médicas
            </p>
          </div>
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={3}
            className="rounded-lg border shadow-sm mx-auto"
          />

          {selectedDates.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg border">
              <p className="text-sm font-medium mb-3">
                Fechas seleccionadas: {selectedDates.length} día(s)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs w-full text-muted-foreground mb-1">
                    Desde:
                  </p>
                  {format(new Date(selectedDates[0]), "dd MMM yyyy", {
                    locale: es,
                  })}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Hasta:</p>
                  {format(
                    new Date(selectedDates[selectedDates.length - 1]),
                    "dd MMM yyyy",
                    { locale: es }
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Formulario */}
        <Card className="px-6">
          <div>
            <h3 className="text-lg font-semibold">
              Configuración de la agenda
            </h3>
            <p className="text-xs opacity-70">
              Completa los campos para crear las agendas médicas para las fechas
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Especialidad */}
              <FormField
                control={form.control}
                name="specialityId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Especialidad <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      key={field.value}
                      onValueChange={(value) => {
                        const numValue = Number(value);
                        field.onChange(numValue);
                        setSelectedSpecialityId(numValue);
                      }}
                      value={field.value?.toString()}
                      disabled={createAppointment.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione una especialidad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {specialitiesData?.items?.map(
                          (speciality: { id: number; name: string }) => (
                            <SelectItem
                              key={speciality.id}
                              value={speciality.id.toString()}
                            >
                              {speciality.name}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecciona la especialidad médica
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Doctor */}
              <FormField
                control={form.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Doctor <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      key={field.value}
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={
                        !selectedSpecialityId ||
                        loadingDoctors ||
                        createAppointment.isPending
                      }
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={
                              !selectedSpecialityId
                                ? "Primero selecciona una especialidad"
                                : loadingDoctors
                                ? "Cargando doctores..."
                                : "Seleccione un doctor"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctorsData?.items?.map(
                          (doctor: {
                            id: number;
                            name: string;
                            lastName: string;
                          }) => (
                            <SelectItem
                              key={doctor.id}
                              value={doctor.id.toString()}
                            >
                              {doctor.name} {doctor.lastName}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Selecciona el doctor de la especialidad
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hora de inicio y fin */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Hora de inicio{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={createAppointment.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endHour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Hora de fin <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          disabled={createAppointment.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Duración de consulta */}
              <FormField
                control={form.control}
                name="durationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Duración de consulta{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      key={field.value}
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={createAppointment.isPending}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccione la duración" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {durationsData?.items?.map(
                          (duration: { id: number; interval: string }) => (
                            <SelectItem
                              key={duration.id}
                              value={duration.id.toString()}
                            >
                              {duration.interval.split(":")[1]} Minutos
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Tiempo de duración por consulta
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botón de envío */}
              <Button
                type="submit"
                className="w-full"
                disabled={
                  createAppointment.isPending || selectedDates.length === 0
                }
              >
                {createAppointment.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Crear {selectedDates.length > 0 && `${selectedDates.length}`}{" "}
                Agenda(s)
              </Button>
            </form>
          </Form>
        </Card>
      </div>
    </Container>
  );
};

export default CreateSchedulesPage;
