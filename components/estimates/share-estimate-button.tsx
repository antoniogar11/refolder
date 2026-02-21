"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Send, Mail, MessageCircle, Link2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  generateShareTokenAction,
  sendEstimateEmailAction,
} from "@/app/dashboard/presupuestos/actions";

type ShareEstimateButtonProps = {
  estimateId: string;
  estimateName: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  shareToken?: string | null;
};

export function ShareEstimateButton({
  estimateId,
  estimateName,
  clientName,
  clientEmail,
  clientPhone,
  shareToken: initialShareToken,
}: ShareEstimateButtonProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  // Resolve initial share URL on mount (client-side only)
  useEffect(() => {
    if (initialShareToken && !shareUrl) {
      setShareUrl(`${window.location.origin}/presupuesto/${initialShareToken}`);
    }
  }, [initialShareToken, shareUrl]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTo, setEmailTo] = useState(clientEmail || "");
  const [emailName, setEmailName] = useState(clientName || "");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  async function getOrCreateShareUrl(): Promise<string | null> {
    if (shareUrl) return shareUrl;

    setLoading(true);
    try {
      const result = await generateShareTokenAction(estimateId);
      if (result.success && result.shareToken) {
        // Build URL client-side to avoid NEXT_PUBLIC_APP_URL mismatches
        const url = `${window.location.origin}/presupuesto/${result.shareToken}`;
        setShareUrl(url);
        return url;
      } else {
        toast.error(result.message);
        return null;
      }
    } catch {
      toast.error("Error al generar el enlace.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink() {
    const url = await getOrCreateShareUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Enlace copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  }

  async function handleWhatsApp() {
    const url = await getOrCreateShareUrl();
    if (!url) return;

    const text = `Hola${clientName ? ` ${clientName}` : ""}, te envío el presupuesto "${estimateName}". Puedes verlo aquí: ${url}`;
    const whatsappUrl = clientPhone
      ? `https://wa.me/${clientPhone.replace(/[\s\-\+\(\)]/g, "")}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, "_blank");
  }

  async function handleOpenEmailDialog() {
    // Pre-generate the share URL
    await getOrCreateShareUrl();
    setEmailDialogOpen(true);
  }

  async function handleSendEmail() {
    if (!emailTo || !emailName) {
      toast.error("Completa el nombre y email del destinatario.");
      return;
    }

    setSendingEmail(true);
    try {
      const result = await sendEstimateEmailAction(
        estimateId,
        emailTo,
        emailName,
        emailMessage || undefined,
      );
      if (result.success) {
        toast.success(result.message);
        setEmailDialogOpen(false);
        setEmailMessage("");
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Error al enviar el email.");
    } finally {
      setSendingEmail(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4 text-amber-600" />
            )}
            Enviar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={handleOpenEmailDialog}>
            <Mail className="mr-2 h-4 w-4" />
            Enviar por email
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleWhatsApp}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Enviar por WhatsApp
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-600" />
            ) : (
              <Link2 className="mr-2 h-4 w-4" />
            )}
            {copied ? "Enlace copiado" : "Copiar enlace"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar presupuesto por email</DialogTitle>
            <DialogDescription>
              Envía el presupuesto &ldquo;{estimateName}&rdquo; al cliente por correo electrónico.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-name">Nombre del destinatario</Label>
              <Input
                id="email-name"
                value={emailName}
                onChange={(e) => setEmailName(e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-to">Email del destinatario</Label>
              <Input
                id="email-to"
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="cliente@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Mensaje personalizado (opcional)</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Añade un mensaje para el cliente..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} disabled={sendingEmail || !emailTo || !emailName}>
              {sendingEmail ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {sendingEmail ? "Enviando..." : "Enviar email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
