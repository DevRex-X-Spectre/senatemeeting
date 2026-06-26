"use client";

import * as React from "react";
import { useActionState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createAgendaItemAction, reorderAgendaItemsAction, deleteAgendaItemAction } from "@/lib/agenda/actions";
import { getAgendaItems } from "@/lib/meetings/queries";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea } from "@/components/ui";
import { GripVertical, Trash2, ArrowLeft } from "lucide-react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} loading={pending} size="sm">Add item</Button>;
}

export default function AgendaBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params) as { id: string };
  const meetingId = resolvedParams.id;
  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    getAgendaItems(meetingId).then(setItems);
  }, [meetingId]);

  const [, addAction] = useActionState(createAgendaItemAction, null);
  const [, reorderAction] = useActionState(reorderAgendaItemsAction, null);
  const [, deleteAction] = useActionState(deleteAgendaItemAction, null);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIdx = prev.findIndex((i) => i.id === active.id);
      const newIdx = prev.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx);
      const formData = new FormData();
      formData.set("meetingId", meetingId);
      formData.set("orderedIds", reordered.map((i) => i.id).join(","));
      reorderAction(formData);
      return reordered;
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <div>
        <Link href="/admin/meetings" className="mb-3 inline-flex items-center gap-1.5 text-signal-blue hover:underline">
          <ArrowLeft className="size-4" /> Back
        </Link>
        <h1 className="text-heading font-bold text-midnight-navy">Build agenda</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add agenda item</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={addAction} className="flex flex-col gap-3">
            <input type="hidden" name="meetingId" value={meetingId} />
            <input type="hidden" name="orderIndex" value={items.length} />
            <Input label="Title" name="title" placeholder="e.g. Approval of previous minutes" required />
            <Textarea label="Description (optional)" name="description" rows={2} />
            <Input label="Allocated time (minutes)" name="allocatedMin" type="number" defaultValue={10} min={1} max={240} required />
            <SubmitButton />
          </form>
        </CardContent>
      </Card>

      {items.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onDelete={() => {
                    setItems((prev) => prev.filter((i) => i.id !== item.id));
                    const formData = new FormData();
                    formData.set("itemId", item.id);
                    deleteAction(formData);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <p className="py-6 text-center text-caption text-slate-blue">
          Add agenda items above. Drag to reorder once added.
        </p>
      )}
    </div>
  );
}

function SortableItem({ item, onDelete }: { item: any; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-mist-border bg-paper p-3"
    >
      <button type="button" {...attributes} {...listeners} className="cursor-grab text-slate-blue hover:text-midnight-navy">
        <GripVertical className="size-4" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-midnight-navy truncate">{item.title}</p>
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