import Container from "@/components/partials/Container";
import {
  Brain,
  Search,
  Filter,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { useSpecialities } from "@/hooks/useSpecialities";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Speciality } from "@/interfaces/specialitiesInterface";
import { toast } from "sonner";
import SpecialityModal from "@/components/modals/SpecialityModal";

const SpecialitiesPage = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedSpeciality, setSelectedSpeciality] =
    useState<Speciality | null>(null);
  const itemsPerPage = 25;

  // Calcular offset para la paginación
  const offset = (currentPage - 1) * itemsPerPage;

  // Determinar el valor del filtro de estado
  const statusValue =
    statusFilter === "all" ? null : statusFilter === "active" ? true : false;

  // Obtener especialidades con los filtros aplicados
  const { data, isLoading, isError, error, refetch } = useSpecialities({
    limit: itemsPerPage,
    offset: offset,
    search: search || null,
    status: statusValue,
  });

  // Extraer los items de la respuesta de la API
  const specialities = data?.items || [];
  const canGoNext = specialities.length === itemsPerPage; // Si hay items completos, probablemente hay más

  // Handlers
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Resetear a la primera página al buscar
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Resetear a la primera página al cambiar filtro
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleRefetchData = () => {
    refetch();
    toast.success("Actualizando y sincronizando especialidades");
  };

  const handleOpenCreateModal = () => {
    setModalMode("create");
    setSelectedSpeciality(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (speciality: Speciality) => {
    setModalMode("edit");
    setSelectedSpeciality(speciality);
    setModalOpen(true);
  };

  return (
    <>
      <Container
        titleModule="Gestión de especialidades"
        description="Administra las especialidades médicas disponibles en el sistema"
        icon={<Brain size={30} />}
        onRetryData={handleRefetchData}
        titleButton="Agregar especialidad"
        onClickButton={handleOpenCreateModal}
      >
        {/* Filtros */}
        <Card className="p-4 mb-4 w-full">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Buscador */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, código o descripción..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Filtro de estado */}
            <div className="w-full sm:w-fit">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tabla */}
        <Card className="py-2 gap-0 px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="w-[100px]">Estado</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Skeleton mientras carga
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-60" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-8 w-20 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : isError ? (
                // Error
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <p className="text-sm text-destructive font-semibold">
                      {error?.message || "Ocurrió un error inesperado"}
                    </p>
                  </TableCell>
                </TableRow>
              ) : !data || specialities.length === 0 ? (
                // Sin resultados
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    <div className="text-muted-foreground">
                      No se encontraron especialidades
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                // Datos
                specialities.map((speciality: Speciality) => (
                  <TableRow key={speciality.id}>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {speciality.code}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">
                      {speciality.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-72 truncate">
                      {speciality.description || "Sin descripción"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={speciality.status ? "success" : "destructive"}
                      >
                        {speciality.status ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditModal(speciality)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Página {currentPage}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronsLeft />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNextPage}
                disabled={!canGoNext || isLoading}
              >
                <ChevronsRight />
              </Button>
            </div>
          </div>
        </Card>
      </Container>

      {/* Modal para crear/editar especialidad */}
      <SpecialityModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        speciality={selectedSpeciality}
        mode={modalMode}
      />
    </>
  );
};

export default SpecialitiesPage;
