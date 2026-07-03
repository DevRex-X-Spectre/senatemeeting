"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, GripVertical, Trash2 } from "lucide-react";
import { createAgendaItemAction, deleteAgendaItemAction, reorderAgendaItemsAction } from "@/lib/agenda/actions";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@/components/ui";
import type { AgendaItem } from "@/types/domain";

type AgendaBuilderClientProps = {
  meetingId: string;
  initialItems: AgendaItem[];
};

type AgendaActionState = {
  ok?: boolean;
  error?: string;
  errors?: Record<string, string[] | undefined>;
} | null;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} loading={pending} size="sm">
      Add item
    </Button>
  );
}

export function AgendaBuilderClient({ meetingId, initialItems }: AgendaBuilderClientProps) {
  const router = useRouter();
  const [items, setItems] = React.useState<AgendaItem[]>(initialItems);
  const [addState, addAction] = useActionState<AgendaActionState, FormData>(createAgendaItemAction, null);
  const [reorderState, reorderAction] = useActionState<AgendaActionState, FormData>(
    reorderAgendaItemsAction,
    null,
  );
  const [deleteState, deleteAction] = useActionState<AgendaActionState, FormData>(deleteAgendaItemAction, null);

  React.useEffect(() => {
    if (addState?.ok || reorderState?.ok || deleteState?.ok) {
      router.refresh();
    }
  }, [addState, deleteState, reorderState, router]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((previousItems) => {
      const oldIndex = previousItems.findIndex((item) => item.id === active.id);
      const newIndex = previousItems.findIndex((item) => item.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return previousItems;

      const reordered = arrayMove(previousItems, oldIndex, newIndex);
      const formData = new FormData();
      formData.set("meetingId", meetingId);
      formData.set("orderedIds", reordered.map((item) => item.id).join(","));
      reorderAction(formData);
      return reordered;
    });
  }

  function handleDelete(itemId: string) {
    setItems((previousItems) => previousItems.filter((item) => item.id !== itemId));
    const formData = new FormData();
    formData.set("itemId", itemId);
    deleteAction(formData);
  }

  const actionError = addState?.error ?? reorderState?.error ?? deleteState?.error;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <Link href="/admin/meetings" className="mb-3 inline-flex items-center gap-1.5 text-signal-blue hover:underline">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <h1 className="text-heading font-bold text-midnight-navy">Build agenda checklist</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add checklist item</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addAction} className="flex flex-col gap-3">
            <input type="hidden" name="meetingId" value={meetingId} />
            <input type="hidden" name="orderIndex" value={items.length} />
            <Input label="Agenda item" name="title" placeholder="e.g. Review faculty budget proposal" required />
            {addState?.errors?.title ? <p className="text-caption text-danger">{addState.errors.title[0]}</p> : null}
            <Textarea label="Description (optional)" name="description" rows={2} />
            <Input
              label="Allocated time (minutes)"
              name="allocatedMin"
              type="number"
              defaultValue={10}
              min={1}
              max={240}
              required
            />
            {addState?.errors?.allocatedMin ? (
              <p className="text-caption text-danger">{addState.errors.allocatedMin[0]}</p>
            ) : null}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {actionError ? (
        <div className="rounded-lg border border-danger/20 bg-danger-soft px-4 py-3 text-[13px] text-danger">
          {actionError}
        </div>
      ) : null}

      {items.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <SortableItem key={item.id} item={item} onDelete={() => handleDelete(item.id)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="py-6 text-center text-caption text-slate-blue">
          Add the agenda checklist items the VC wants this meeting to cover.
        </p>
      )}
    </div>
  );
}

function SortableItem({ item, onDelete }: { item: AgendaItem; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-mist-border bg-paper p-3"
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-slate-blue hover:text-midnight-navy">
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-medium text-midnight-navy">{item.title}</p>
        <p className="text-caption text-slate-blue">{item.allocated_min} min</p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="rounded-md p-1.5 text-slate-blue hover:bg-danger-soft hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
