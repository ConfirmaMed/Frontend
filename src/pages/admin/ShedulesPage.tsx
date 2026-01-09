import Container from "@/components/partials/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FunnelPlus } from "lucide-react";

const ShedulesPage = () => {
  return (
    <Container
      titleModule="Agendas programadas"
      description="Gestione las agendas programadas desde este módulo."
      showButtons={false}
    >
      <div className="space-y-4">
        <Card className="py-3">
          <div className="w-full">
            <Button variant={"outline"}>
              Filtros
              <FunnelPlus />
            </Button>
          </div>
        </Card>

        <Card className="py-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora inicial</TableHead>
                <TableHead>Hora final</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead></TableHead>
                <TableHead>Especialidad</TableHead>
              </TableRow>
            </TableHeader>
          </Table>
        </Card>
      </div>
    </Container>
  );
};

export default ShedulesPage;
