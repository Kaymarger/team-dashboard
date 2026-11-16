"use client";

import { useState, type FormEvent } from "react";
import { SubmitButton, SuccessState } from "@/components/form-feedback";
import { AgentField, controlClass, Field } from "@/components/fields";
import { MAX_ENCODED_CHARS, MAX_SCREENSHOTS } from "@/lib/ticket-images";

const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.7;

type Notice = { status: "success" | "error"; message: string };

async function compressImage(file: File): Promise<{ filename: string; base64: string }> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("One of the screenshots could not be read. Try a JPG or PNG.");
  }
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("One of the screenshots could not be read. Try a JPG or PNG.");
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = dataUrl.split(",")[1] ?? "";
  if (!base64) throw new Error("One of the screenshots could not be read. Try a JPG or PNG.");
  return { filename: file.name, base64 };
}

export function CincTicketForm() {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    try {
      const data = new FormData(form);
      const agent = String(data.get("agent") ?? "");
      const issue = String(data.get("issue") ?? "").trim();
      const files = (data.getAll("screenshots") as File[]).filter((file) => file.size > 0);
      if (!issue) {
        setNotice({ status: "error", message: "Describe the issue." });
        return;
      }
      if (files.length > MAX_SCREENSHOTS) {
        setNotice({ status: "error", message: "You can attach up to 3 screenshots." });
        return;
      }
      if (files.some((file) => !file.type.startsWith("image/"))) {
        setNotice({ status: "error", message: "Screenshots need to be image files." });
        return;
      }
      const screenshots = [];
      for (const file of files) screenshots.push(await compressImage(file));
      const total = screenshots.reduce((sum, shot) => sum + shot.base64.length, 0);
      if (total > MAX_ENCODED_CHARS) {
        setNotice({
          status: "error",
          message: "Those screenshots are too large to send. Try fewer or smaller photos.",
        });
        return;
      }
      const response = await fetch("/api/cinc-ticket", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent, issue, screenshots }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setNotice({ status: "error", message: body.error || "The request could not be sent." });
        return;
      }
      form.reset();
      setNotice({ status: "success", message: "Request sent." });
    } catch (error) {
      setNotice({
        status: "error",
        message: error instanceof Error ? error.message : "The request could not be sent.",
      });
    } finally {
      setPending(false);
    }
  }

  if (notice?.status === "success") {
    return <SuccessState message={notice.message} onAnother={() => setNotice(null)} />;
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h2 className="sr-only">Send CINC Support Ticket</h2>
      <AgentField />
      <Field label="Describe the Issue">
        <textarea
          name="issue"
          required
          rows={4}
          placeholder="What isn't working?"
          className={`${controlClass} h-auto py-2`}
        />
      </Field>
      <Field label="Screenshots">
        <input
          name="screenshots"
          type="file"
          accept="image/*"
          multiple
          className={`${controlClass} py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[#f1efea] file:px-2 file:py-1 file:text-xs file:font-medium file:text-[#1f2326]`}
        />
        <span className="text-sm text-[#716c65]">Optional. Up to 3 images.</span>
      </Field>
      <SubmitButton pending={pending} />
      {notice?.status === "error" ? (
        <p className="rounded-xl bg-[#f6f1ea] px-3 py-2 text-sm text-[#6b3a2e]" role="alert">
          {notice.message}
        </p>
      ) : null}
    </form>
  );
}
