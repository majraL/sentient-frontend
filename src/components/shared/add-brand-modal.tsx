"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { configurationApi } from "@/features/configuration/api/configuration-api";
import { brandSchema, type BrandSchema } from "@/features/configuration/schemas/configuration-schema";
import type { Brand } from "@/types/api";

type AddBrandModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (brand: Brand) => void | Promise<void>;
};

export function AddBrandModal({ open, onOpenChange, onCreated }: AddBrandModalProps) {
  const form = useForm<BrandSchema>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      website: "",
      industry: "",
    },
  });

  const createBrandMutation = useMutation({
    mutationFn: (values: BrandSchema) => configurationApi.createBrand(values),
    onSuccess: async (brand) => {
      await onCreated(brand);
      form.reset({
        name: "",
        website: "",
        industry: "",
      });
      onOpenChange(false);
      toast.success("Brand created");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          form.reset({
            name: "",
            website: "",
            industry: "",
          });
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Brand</DialogTitle>
          <DialogDescription>
            Create a new brand now, then add tasks when you are ready.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit((values) => createBrandMutation.mutate(values))}>
          <div className="space-y-2">
            <Label>Brand name</Label>
            <Input {...form.register("name")} placeholder="Velora Skin" />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input {...form.register("website")} placeholder="https://veloraskin.com" />
          </div>
          <div className="space-y-2">
            <Label>Industry</Label>
            <Input {...form.register("industry")} placeholder="Beauty" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBrandMutation.isPending}>
              Create Brand
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
