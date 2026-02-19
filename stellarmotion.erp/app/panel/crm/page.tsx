"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Trash2, Edit, MoreVertical, Search } from "lucide-react";
import { toast } from "sonner";

interface Pipeline {
  id: string;
  nombre: string;
  descripcion?: string | null;
  is_default?: boolean;
}

interface Stage {
  id: string;
  pipeline_id: string;
  nombre: string;
  posicion: number;
}

interface Opportunity {
  id: string;
  stage_id: string;
  descripcion?: string | null;
  valor_estimado?: number | null;
  moneda?: string;
  lead_id?: string | null;
  lead_nombre?: string | null;
  ciudad?: string | null;
  origen?: string | null;
  interes?: string | null;
  estado?: string | null;
}

const ESTADO_OPTS = [
  { value: "abierta", label: "Abierta" },
  { value: "ganada", label: "Ganada" },
  { value: "perdida", label: "Perdida" },
];

const INTERES_OPTS = [
  { value: "bajo", label: "Bajo" },
  { value: "medio", label: "Medio" },
  { value: "alto", label: "Alto" },
];

export default function CRMPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [pipelineId, setPipelineId] = useState<string | null>(null);
  const [stages, setStages] = useState<Stage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOpps, setLoadingOpps] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const [modalOportunidad, setModalOportunidad] = useState(false);
  const [modalPipeline, setModalPipeline] = useState(false);
  const [modalEtapa, setModalEtapa] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formStageId, setFormStageId] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formValor, setFormValor] = useState<number | "">("");
  const [formCiudad, setFormCiudad] = useState("");
  const [formOrigen, setFormOrigen] = useState("");
  const [formInteres, setFormInteres] = useState("");
  const [formEstado, setFormEstado] = useState("abierta");
  const [formLeadId, setFormLeadId] = useState<string | null>(null);

  const [formPipelineNombre, setFormPipelineNombre] = useState("");
  const [formPipelineDesc, setFormPipelineDesc] = useState("");
  const [formEtapaNombre, setFormEtapaNombre] = useState("");
  const [contactosList, setContactosList] = useState<{ id: string; displayName: string }[]>([]);
  const [loadingContactos, setLoadingContactos] = useState(false);

  const fetchPipelines = async () => {
    try {
      const res = await fetch("/api/crm/pipelines", { credentials: "include" });
      const data = await res.json();
      const list = data.success && data.data ? data.data : [];
      setPipelines(Array.isArray(list) ? list : []);
      const defaultP = list.find((p: Pipeline) => p.is_default) ?? list[0];
      if (defaultP?.id) setPipelineId(defaultP.id);
    } catch (e) {
      toast.error("Error al cargar pipelines");
    } finally {
      setLoading(false);
    }
  };

  const fetchContactos = async () => {
    setLoadingContactos(true);
    try {
      const res = await fetch("/api/contactos?limit=500", { credentials: "include" });
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data : [];
      setContactosList(
        list.map((c: { id: string; displayName?: string }) => ({
          id: c.id,
          displayName: c.displayName ?? c.nombre ?? "",
        }))
      );
    } catch {
      setContactosList([]);
    } finally {
      setLoadingContactos(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  useEffect(() => {
    if (!pipelineId) {
      setStages([]);
      setOpportunities([]);
      return;
    }
    (async () => {
      setLoadingOpps(true);
      try {
        const params = new URLSearchParams();
        if (searchQ) params.set("q", searchQ);
        const [stagesRes, oppsRes] = await Promise.all([
          fetch(`/api/crm/pipelines/${pipelineId}/stages`, { credentials: "include" }),
          fetch(`/api/crm/pipelines/${pipelineId}/opportunities?${params.toString()}`, {
            credentials: "include",
          }),
        ]);
        const stagesData = await stagesRes.json();
        const oppsData = await oppsRes.json();
        setStages(Array.isArray(stagesData.data) ? stagesData.data : []);
        setOpportunities(Array.isArray(oppsData.data) ? oppsData.data : []);
      } catch (e) {
        toast.error("Error al cargar etapas u oportunidades");
      } finally {
        setLoadingOpps(false);
      }
    })();
  }, [pipelineId, searchQ]);

  const openNuevaOportunidad = (stageId?: string) => {
    setEditingId(null);
    setFormStageId(stageId || (stages[0]?.id ?? ""));
    setFormDescripcion("");
    setFormValor("");
    setFormCiudad("");
    setFormOrigen("");
    setFormInteres("");
    setFormEstado("abierta");
    setFormLeadId(null);
    fetchContactos();
    setModalOportunidad(true);
  };

  const openEditOportunidad = (opp: Opportunity) => {
    setEditingId(opp.id);
    setFormStageId(opp.stage_id);
    setFormDescripcion(opp.descripcion ?? "");
    setFormValor(opp.valor_estimado ?? "");
    setFormCiudad(opp.ciudad ?? "");
    setFormOrigen(opp.origen ?? "");
    setFormInteres(opp.interes ?? "");
    setFormEstado(opp.estado ?? "abierta");
    setFormLeadId(opp.lead_id ?? null);
    fetchContactos();
    setModalOportunidad(true);
  };

  const handleSaveOportunidad = async () => {
    if (!pipelineId) return;
    if (!editingId && !formLeadId) {
      toast.error("Selecciona un contacto");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        pipeline_id: pipelineId,
        stage_id: formStageId,
        contacto_id: formLeadId || undefined,
        descripcion: formDescripcion || null,
        valor_estimado: formValor === "" ? null : Number(formValor),
        ciudad: formCiudad || null,
        origen: formOrigen || null,
        interes: formInteres || null,
        estado: formEstado,
        lead_id: formLeadId || undefined,
      };
      if (editingId) {
        const res = await fetch(`/api/crm/opportunities/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            descripcion: payload.descripcion,
            valor_estimado: payload.valor_estimado,
            ciudad: payload.ciudad,
            origen: payload.origen,
            interes: payload.interes,
            estado: payload.estado,
            stage_id: payload.stage_id,
            contacto_id: formLeadId || undefined,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success("Oportunidad actualizada");
      } else {
        const res = await fetch("/api/crm/opportunities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        toast.success("Oportunidad creada");
      }
      setModalOportunidad(false);
      const [stagesRes, oppsRes] = await Promise.all([
        fetch(`/api/crm/pipelines/${pipelineId}/stages`, { credentials: "include" }),
        fetch(`/api/crm/pipelines/${pipelineId}/opportunities`, { credentials: "include" }),
      ]);
      const stagesData = await stagesRes.json();
      const oppsData = await oppsRes.json();
      setStages(Array.isArray(stagesData.data) ? stagesData.data : []);
      setOpportunities(Array.isArray(oppsData.data) ? oppsData.data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCrearPipeline = async () => {
    if (!formPipelineNombre.trim()) {
      toast.error("El nombre del pipeline es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/crm/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre: formPipelineNombre.trim(),
          descripcion: formPipelineDesc.trim() || null,
          is_default: pipelines.length === 0,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Pipeline creado");
      setModalPipeline(false);
      setFormPipelineNombre("");
      setFormPipelineDesc("");
      await fetchPipelines();
      if (data.data?.id) setPipelineId(data.data.id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear pipeline");
    } finally {
      setSaving(false);
    }
  };

  const handleAgregarEtapa = async () => {
    if (!pipelineId || !formEtapaNombre.trim()) {
      toast.error("El nombre de la etapa es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/pipelines/${pipelineId}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nombre: formEtapaNombre.trim() }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Etapa creada");
      setModalEtapa(false);
      setFormEtapaNombre("");
      const stagesRes = await fetch(`/api/crm/pipelines/${pipelineId}/stages`, {
        credentials: "include",
      });
      const stagesData = await stagesRes.json();
      setStages(Array.isArray(stagesData.data) ? stagesData.data : []);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear etapa");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOportunidad = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/crm/opportunities/${deleteId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Oportunidad eliminada");
      setDeleteId(null);
      if (pipelineId) {
        const oppsRes = await fetch(`/api/crm/pipelines/${pipelineId}/opportunities`, {
          credentials: "include",
        });
        const oppsData = await oppsRes.json();
        setOpportunities(Array.isArray(oppsData.data) ? oppsData.data : []);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setSaving(false);
    }
  };

  const selectedPipeline = pipelines.find((p) => p.id === pipelineId);

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
        <p className="text-muted-foreground text-sm">Oportunidades por etapa</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : pipelines.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="py-16 px-6 text-center">
            <p className="text-foreground font-medium mb-2">
              Aún no tienes ningún pipeline
            </p>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Crea tu primer pipeline para empezar a gestionar oportunidades de venta.
            </p>
            <Button
              className="bg-[#e94446] hover:bg-[#d63d3f] text-white"
              onClick={() => {
                setFormPipelineNombre("");
                setFormPipelineDesc("");
                setModalPipeline(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear pipeline
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Select
              value={pipelineId ?? ""}
              onValueChange={(v) => setPipelineId(v || null)}
            >
              <SelectTrigger className="w-[200px] bg-muted/50 border-border text-foreground font-medium">
                <SelectValue placeholder="Pipeline" />
              </SelectTrigger>
              <SelectContent>
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPipeline && (
              <Badge variant="secondary" className="text-foreground border-border">
                {selectedPipeline.nombre}
              </Badge>
            )}
            <div className="flex-1" />
            <Button
              variant="outline"
              size="sm"
              className="border-border"
              onClick={() => {
                setFormEtapaNombre("");
                setModalEtapa(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar etapa
            </Button>
            <Button
              className="bg-[#e94446] hover:bg-[#d63d3f] text-white"
              onClick={() => openNuevaOportunidad()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nueva oportunidad
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar oportunidades..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
          </div>

          {loadingOpps ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map((stage) => {
                const stageOpps = opportunities.filter((o) => o.stage_id === stage.id);
                const totalStage = stageOpps.reduce(
                  (sum, o) => sum + (Number(o.valor_estimado) || 0),
                  0
                );
                return (
                  <Card
                    key={stage.id}
                    className="min-w-[300px] shrink-0 border-border bg-card flex flex-col"
                  >
                    <CardHeader className="py-3 flex flex-row items-center justify-between space-y-0">
                      <CardTitle className="text-base text-foreground flex items-center gap-2">
                        <span>{stage.nombre}</span>
                        <span className="text-muted-foreground font-normal text-sm">
                          {stageOpps.length}
                        </span>
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openNuevaOportunidad(stage.id)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2 pt-0 flex-1 overflow-auto">
                      {stageOpps.map((opp) => (
                        <div
                          key={opp.id}
                          className="rounded-lg border border-border bg-background p-3 text-foreground"
                        >
                          <div className="text-sm font-medium">
                            {opp.descripcion || "Sin descripción"}
                          </div>
                          {opp.lead_nombre && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {opp.lead_nombre}
                            </div>
                          )}
                          {opp.valor_estimado != null && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {Number(opp.valor_estimado).toLocaleString("es-ES", {
                                style: "currency",
                                currency: opp.moneda || "EUR",
                              })}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {opp.estado && (
                              <Badge variant="outline" className="text-xs">
                                {opp.estado}
                              </Badge>
                            )}
                            {opp.origen && (
                              <Badge variant="outline" className="text-xs">
                                {opp.origen}
                              </Badge>
                            )}
                            {opp.interes && (
                              <Badge variant="outline" className="text-xs">
                                {opp.interes}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => openEditOportunidad(opp)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-destructive hover:text-destructive"
                              onClick={() => setDeleteId(opp.id)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      ))}
                      {stageOpps.length > 0 && (
                        <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-2">
                          Total de la etapa:{" "}
                          {totalStage.toLocaleString("es-ES", {
                            style: "currency",
                            currency: "EUR",
                          })}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal Crear pipeline */}
      <Dialog open={modalPipeline} onOpenChange={setModalPipeline}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear pipeline</DialogTitle>
            <DialogDescription>
              Define un nuevo pipeline de ventas para organizar oportunidades.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={formPipelineNombre}
                onChange={(e) => setFormPipelineNombre(e.target.value)}
                placeholder="Ej: Ventas publicidad"
                className="mt-1 bg-background border-border focus-visible:ring-[#e94446]"
              />
            </div>
            <div>
              <Label>Descripción (opcional)</Label>
              <Input
                value={formPipelineDesc}
                onChange={(e) => setFormPipelineDesc(e.target.value)}
                placeholder="Breve descripción"
                className="mt-1 bg-background border-border focus-visible:ring-[#e94446]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalPipeline(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#e94446] hover:bg-[#d63d3f] text-white"
              onClick={handleCrearPipeline}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Agregar etapa */}
      <Dialog open={modalEtapa} onOpenChange={setModalEtapa}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar etapa</DialogTitle>
            <DialogDescription>
              Añade una nueva etapa al pipeline actual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nombre de la etapa</Label>
              <Input
                value={formEtapaNombre}
                onChange={(e) => setFormEtapaNombre(e.target.value)}
                placeholder="Ej: Contacto inicial"
                className="mt-1 bg-background border-border focus-visible:ring-[#e94446]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalEtapa(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#e94446] hover:bg-[#d63d3f] text-white"
              onClick={handleAgregarEtapa}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nueva / Editar oportunidad */}
      <Dialog open={modalOportunidad} onOpenChange={setModalOportunidad}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Editar oportunidad" : "Nueva oportunidad"}
            </DialogTitle>
            <DialogDescription>
              Completa los datos de la oportunidad.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Contacto {!editingId && "(requerido)"}</Label>
              <Select
                value={formLeadId ?? ""}
                onValueChange={(v) => setFormLeadId(v || null)}
                disabled={loadingContactos}
              >
                <SelectTrigger className="mt-1 bg-background border-border focus-visible:ring-[#e94446]">
                  <SelectValue
                    placeholder={
                      loadingContactos ? "Cargando contactos…" : "Seleccionar contacto"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {contactosList.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.displayName || c.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={formDescripcion}
                onChange={(e) => setFormDescripcion(e.target.value)}
                placeholder="Descripción de la oportunidad..."
                className="mt-1 bg-background border-border focus-visible:ring-[#e94446] min-h-[80px]"
              />
            </div>
            <div>
              <Label>Valor estimado</Label>
              <Input
                type="number"
                step={0.01}
                value={formValor}
                onChange={(e) =>
                  setFormValor(e.target.value === "" ? "" : Number(e.target.value))
                }
                placeholder="0.00"
                className="mt-1 bg-background border-border focus-visible:ring-[#e94446]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ciudad</Label>
                <Input
                  value={formCiudad}
                  onChange={(e) => setFormCiudad(e.target.value)}
                  placeholder="Ej: Madrid"
                  className="mt-1 bg-background border-border focus-visible:ring-[#e94446]"
                />
              </div>
              <div>
                <Label>Origen</Label>
                <Input
                  value={formOrigen}
                  onChange={(e) => setFormOrigen(e.target.value)}
                  placeholder="Ej: Web, Referido, Evento"
                  className="mt-1 bg-background border-border focus-visible:ring-[#e94446]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Interés</Label>
                <Select value={formInteres} onValueChange={setFormInteres}>
                  <SelectTrigger className="mt-1 bg-background border-border focus-visible:ring-[#e94446]">
                    <SelectValue placeholder="Seleccionar interés" />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERES_OPTS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={formEstado} onValueChange={setFormEstado}>
                  <SelectTrigger className="mt-1 bg-background border-border focus-visible:ring-[#e94446]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ESTADO_OPTS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!editingId && stages.length > 0 && (
              <div>
                <Label>Etapa</Label>
                <Select value={formStageId} onValueChange={setFormStageId}>
                  <SelectTrigger className="mt-1 bg-background border-border focus-visible:ring-[#e94446]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOportunidad(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-[#e94446] hover:bg-[#d63d3f] text-white"
              onClick={handleSaveOportunidad}
              disabled={saving}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingId ? (
                "Guardar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar oportunidad</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que quieres eliminar esta oportunidad?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOportunidad}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
