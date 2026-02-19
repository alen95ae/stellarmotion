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
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Pencil, Trash2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

interface UserRow {
  id: string;
  nombre: string;
  email: string;
  fechaCreacion?: string;
  ultimoAcceso?: string | null;
  activo: boolean;
  rol?: string | null;
}

export default function AjustesUsuariosPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserRow | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);
  const [formNombre, setFormNombre] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", "50");
      if (search) params.set("search", search);
      const res = await fetch(`/api/ajustes/usuarios?${params.toString()}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error al cargar");
      const data = await res.json();
      setUsers(data.users ?? []);
      setTotal(data.total ?? 0);
    } catch (e) {
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const openEditModal = (u: UserRow) => {
    setUserToEdit(u);
    setFormNombre(u.nombre || "");
    setFormEmail(u.email || "");
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userToEdit) return;
    if (!formEmail.trim()) {
      toast.error("El email es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/ajustes/usuarios/${userToEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nombre: formNombre.trim() || undefined,
          email: formEmail.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      toast.success("Usuario actualizado");
      setEditModalOpen(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (u: UserRow) => {
    setUserToDelete(u);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/ajustes/usuarios/${userToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Error al eliminar");
      }
      toast.success("Usuario eliminado");
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al eliminar");
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d: string | undefined | null) => {
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

  const getInitials = (u: UserRow) => {
    if (u.nombre?.trim()) {
      return u.nombre
        .trim()
        .split(/\s+/)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return u.email?.[0]?.toUpperCase() || "?";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gestión de Usuarios
        </h1>
        <p className="text-muted-foreground">
          Administra los usuarios del sistema
        </p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5" />
            Usuarios del Sistema
          </CardTitle>
          <CardDescription>Gestiona usuarios del CRM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-background border-border text-foreground"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">
              Usuarios ({total})
            </h3>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                No hay usuarios.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Nombre
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Fecha de Creación
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-foreground">
                        Último Acceso
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-foreground">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-border last:border-0 hover:bg-muted/20"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" alt={u.nombre || u.email} />
                              <AvatarFallback className="bg-[#e94446] text-white text-xs">
                                {getInitials(u)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-foreground">
                              {u.nombre || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-foreground">{u.email}</td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(u.fechaCreacion)}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {formatDate(u.ultimoAcceso)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-foreground hover:bg-muted"
                              onClick={() => openEditModal(u)}
                              aria-label="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              onClick={() => openDeleteDialog(u)}
                              aria-label="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {total > 50 && (
            <div className="flex items-center gap-2 pt-2 text-muted-foreground text-sm">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span>
                Página {page} de {Math.ceil(total / 50)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 50)}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Editar Usuario */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-card border-border text-foreground sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-foreground">Imagen de Perfil</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" alt={formNombre || formEmail} />
                  <AvatarFallback className="bg-[#e94446] text-white text-xl">
                    {formNombre?.trim()
                      ? formNombre
                          .trim()
                          .split(/\s+/)
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      : formEmail?.[0]?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-border bg-background"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Cambiar imagen
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-nombre" className="text-foreground">
                Nombre
              </Label>
              <Input
                id="edit-nombre"
                value={formNombre}
                onChange={(e) => setFormNombre(e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-[#e94446] focus-visible:border-[#e94446]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="text-foreground">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                className="bg-background border-border text-foreground focus-visible:ring-[#e94446] focus-visible:border-[#e94446]"
                required
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
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
                  "Guardar Cambios"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo confirmar eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a{" "}
              {userToDelete?.nombre || userToDelete?.email}? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">
              Cancelar
            </AlertDialogCancel>
            <Button
              onClick={handleConfirmDelete}
              disabled={deleting}
              variant="destructive"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Eliminar"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
