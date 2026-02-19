"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, RefreshCw, Key, Plus, Loader2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface InvitacionRow {
  id: string;
  email: string;
  rol: string | null;
  estado: string;
  fechaCreacion: string | null;
  expira: string | null;
  token: string | null;
  enlace: string | null;
}

const ESTADOS = [
  { value: "all", label: "Todos" },
  { value: "pendiente", label: "Pendiente" },
  { value: "aceptada", label: "Aceptada" },
  { value: "expirada", label: "Expirada" },
  { value: "cancelada", label: "Cancelada" },
];

const VALIDEZ_OPCIONES = [
  { value: "24", label: "24 horas" },
  { value: "72", label: "72 horas" },
  { value: "168", label: "7 días" },
];

export default function AjustesInvitacionesPage() {
  const [invitaciones, setInvitaciones] = useState<InvitacionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formValidez, setFormValidez] = useState("72");
  const [saving, setSaving] = useState(false);

  const fetchInvitaciones = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (estadoFilter) params.set("estado", estadoFilter);
      const res = await fetch(`/api/ajustes/invitaciones?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setInvitaciones(data.invitaciones ?? []);
    } catch (e) {
      toast.error("Error al cargar invitaciones");
      setInvitaciones([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitaciones();
  }, [estadoFilter]);

  const handleCrearInvitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim()) {
      toast.error("El email del invitado es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/ajustes/invitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formEmail.trim(),
          validezHoras: Number(formValidez) || 72,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al crear invitación");
      }
      toast.success("Invitación creada");
      setModalOpen(false);
      setFormEmail("");
      setFormValidez("72");
      fetchInvitaciones();
      if (data.invitacion?.enlace) {
        await navigator.clipboard.writeText(data.invitacion.enlace);
        toast.info("Enlace copiado al portapapeles");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear invitación");
    } finally {
      setSaving(false);
    }
  };

  const copyEnlace = (enlace: string | null) => {
    if (!enlace) return;
    navigator.clipboard.writeText(enlace).then(() => toast.success("Enlace copiado"));
  };

  const formatDate = (d: string | null | undefined) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gestión de invitaciones
        </h1>
        <p className="text-muted-foreground">
          Administra las invitaciones para nuevos usuarios
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" />
            Gestión de invitaciones
          </CardTitle>
          <CardDescription>
            Crea y gestiona enlaces de invitación para el CRM
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="filter-estado" className="text-foreground text-sm">
              Filtrar por estado
            </Label>
            <Select
              value={estadoFilter || "all"}
              onValueChange={(v) => setEstadoFilter(v === "all" ? "" : v)}
            >
              <SelectTrigger
                id="filter-estado"
                className="w-[180px] bg-background border-border text-foreground"
              >
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {ESTADOS.map((e) => (
                  <SelectItem
                    key={e.value}
                    value={e.value}
                    className="text-foreground"
                  >
                    {e.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInvitaciones}
              disabled={loading}
              className="border-border"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="border-border"
              onClick={() => toast.info("Abrir cambio de contraseña (en desarrollo)")}
            >
              <Key className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </Button>
            <Button
              size="sm"
              className="bg-[#e94446] hover:bg-[#d63d3f] text-white"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Invitación
            </Button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">
              Invitaciones ({invitaciones.length})
            </h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : invitaciones.length === 0 ? (
              <p className="text-muted-foreground py-12 text-center">
                No se encontraron invitaciones
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Rol
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Estado
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Fecha Creación
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Expira
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Enlace
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invitaciones.map((inv) => (
                      <tr
                        key={inv.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20"
                      >
                        <td className="py-3 px-4 text-foreground">{inv.email}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {inv.rol || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={
                              inv.estado === "aceptada"
                                ? "text-green-600 dark:text-green-400"
                                : inv.estado === "expirada"
                                  ? "text-muted-foreground"
                                  : "text-foreground"
                            }
                          >
                            {inv.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(inv.fechaCreacion)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(inv.expira)}
                        </td>
                        <td className="py-3 px-4">
                          {inv.enlace ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => copyEnlace(inv.enlace)}
                                aria-label="Copiar enlace"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                              <a
                                href={inv.enlace}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#e94446] hover:underline inline-flex items-center gap-0.5"
                              >
                                Ver <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal Crear Nueva Invitación */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nueva Invitación</DialogTitle>
            <DialogDescription>
              Genera un enlace de invitación para un nuevo usuario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCrearInvitacion} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="invite-email" className="text-foreground">
                Email del Invitado
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-[#e94446] focus-visible:border-[#e94446]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-validez" className="text-foreground">
                Validez (horas)
              </Label>
              <Select
                value={formValidez}
                onValueChange={setFormValidez}
              >
                <SelectTrigger
                  id="invite-validez"
                  className="bg-background border-border text-foreground focus:ring-[#e94446] focus:border-[#e94446]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {VALIDEZ_OPCIONES.map((o) => (
                    <SelectItem
                      key={o.value}
                      value={o.value}
                      className="text-foreground"
                    >
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-border"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#e94446] hover:bg-[#d63d3f] text-white"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Crear Invitación"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
