export type EntityId = string;

export type AsyncState = "idle" | "loading" | "success" | "error";

export type Option = {
  label: string;
  value: string;
};

export type StatusVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";
