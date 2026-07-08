import type { PostgrestError } from "@supabase/supabase-js";

export type SupabaseFailureKind =
  | "network_timeout"
  | "network_unreachable"
  | "auth_bad_credentials"
  | "not_found"
  | "permission_denied"
  | "service_unavailable"
  | "validation"
  | "unknown";

export type AppError = {
  kind: SupabaseFailureKind;
  message: string;
  code?: string;
  details?: string;
};

export type ActionSuccess<T = undefined> = T extends undefined
  ? { ok: true; error?: never; fieldErrors?: never; errors?: never }
  : { ok: true; data: T; error?: never; fieldErrors?: never; errors?: never };

export type ActionFailure = {
  ok: false;
  error: string;
  kind?: SupabaseFailureKind;
  fieldErrors?: Record<string, string[] | undefined>;
  errors?: Record<string, string[] | undefined>;
};

export type ActionResult<T = undefined> = ActionSuccess<T> | ActionFailure;

export const SUPABASE_QUERY_TIMEOUT_MS = 12_000;
export const SUPABASE_AUTH_TIMEOUT_MS = 10_000;

const NOT_FOUND_CODES = new Set(["PGRST116"]);
const PERMISSION_CODES = new Set(["42501", "PGRST301"]);

export function mapSupabaseError(error: unknown, fallback = "Something went wrong. Please try again."): AppError {
  if (!error) {
    return { kind: "unknown", message: fallback };
  }

  const postgrestError = error as Partial<PostgrestError>;
  const message = error instanceof Error ? error.message : String(postgrestError.message ?? error);
  const code = postgrestError.code;
  const details = postgrestError.details;
  const normalized = `${message} ${code ?? ""} ${details ?? ""}`.toLowerCase();

  if (normalized.includes("connect timeout") || normalized.includes("timeout") || normalized.includes("und_err_connect_timeout")) {
    return {
      kind: "network_timeout",
      message: "Supabase is taking too long to respond. Check your connection and try again.",
      code,
      details,
    };
  }

  if (normalized.includes("fetch failed") || normalized.includes("failed to fetch") || normalized.includes("networkerror")) {
    return {
      kind: "network_unreachable",
      message: "Cannot reach Supabase right now. Check your internet connection and try again.",
      code,
      details,
    };
  }

  if (normalized.includes("invalid login credentials") || normalized.includes("invalid credentials")) {
    return {
      kind: "auth_bad_credentials",
      message: "The staff ID/email or password is incorrect.",
      code,
      details,
    };
  }

  if (code && NOT_FOUND_CODES.has(code)) {
    return {
      kind: "not_found",
      message: "The requested record could not be found.",
      code,
      details,
    };
  }

  if (code && PERMISSION_CODES.has(code)) {
    return {
      kind: "permission_denied",
      message: "You do not have permission to perform this action.",
      code,
      details,
    };
  }

  if (normalized.includes("service unavailable") || normalized.includes("503") || normalized.includes("502") || normalized.includes("504")) {
    return {
      kind: "service_unavailable",
      message: "Supabase is temporarily unavailable. Please try again shortly.",
      code,
      details,
    };
  }

  return {
    kind: "unknown",
    message: message && !message.includes("fetch failed") ? message : fallback,
    code,
    details,
  };
}

export function actionError(error: unknown, fallback?: string): ActionFailure {
  const mapped = mapSupabaseError(error, fallback);
  return { ok: false, error: mapped.message, kind: mapped.kind };
}

export function validationError(fieldErrors: Record<string, string[] | undefined>): ActionFailure {
  return {
    ok: false,
    error: "Please fix the highlighted fields.",
    kind: "validation",
    fieldErrors,
    errors: fieldErrors,
  };
}

export async function withTimeout<T>(
  operation: PromiseLike<T>,
  label: string,
  timeoutMs = SUPABASE_QUERY_TIMEOUT_MS,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function throwFriendlyError(error: unknown, fallback?: string): never {
  const mapped = mapSupabaseError(error, fallback);
  throw new Error(mapped.message);
}
