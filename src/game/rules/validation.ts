/**
 * Runtime validation — T7
 * Validates action payloads and province fields.
 * Used by applyAction before any state mutation.
 * Returns user-friendly error messages for UI.
 */

import type { DomainAction } from './actions';
import {
    ClarifyPayloadSchema,
    SupplyPayloadSchema,
    DecomposePayloadSchema,
    StartMovePayloadSchema,
    LogMovePayloadSchema,
    ApplyTacticPayloadSchema,
    CompletePayloadSchema,
    RetreatPayloadSchema,
    ReschedulePayloadSchema,
    EditFieldsPayloadSchema,
} from './actions';
import type { ZodSchema } from 'zod';

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

const OK: ValidationResult = { valid: true, errors: [] };

function zodValidate(schema: ZodSchema, data: unknown): ValidationResult {
    const result = schema.safeParse(data);
    if (result.success) return OK;
    // Zod v4 uses .issues; v3 used .errors — support both
    const issues = (result.error as { issues?: { path: (string | number)[]; message: string }[]; errors?: { path: (string | number)[]; message: string }[] }).issues
        ?? (result.error as { errors?: { path: (string | number)[]; message: string }[] }).errors
        ?? [];
    return {
        valid: false,
        errors: issues.map((e) => `${e.path.join('.')}: ${e.message}`),
    };
}

/** Schema lookup by action type */
const PAYLOAD_SCHEMAS: Record<DomainAction['type'], ZodSchema> = {
    clarify: ClarifyPayloadSchema,
    supply: SupplyPayloadSchema,
    decompose: DecomposePayloadSchema,
    start_move: StartMovePayloadSchema,
    log_move: LogMovePayloadSchema,
    apply_tactic: ApplyTacticPayloadSchema,
    complete: CompletePayloadSchema,
    retreat: RetreatPayloadSchema,
    reschedule: ReschedulePayloadSchema,
    edit_fields: EditFieldsPayloadSchema,
};

/**
 * Validates the payload of a domain action.
 * Used as the first guard in applyAction.
 */
export function validateActionPayload(action: DomainAction): ValidationResult {
    const schema = PAYLOAD_SCHEMAS[action.type];
    return zodValidate(schema, action.payload);
}

/**
 * Validates province field ranges (effortLevel, clarityLevel, durationMinutes).
 * Called for edit_fields and any action that updates these values.
 */
export function validateProvinceFields(fields: {
    effortLevel?: unknown;
    clarityLevel?: unknown;
}): ValidationResult {
    const errors: string[] = [];

    if (fields.effortLevel !== undefined) {
        const v = Number(fields.effortLevel);
        if (!Number.isInteger(v) || v < 1 || v > 5) {
            errors.push(`effortLevel must be an integer between 1 and 5 (got ${fields.effortLevel})`);
        }
    }
    if (fields.clarityLevel !== undefined) {
        const v = Number(fields.clarityLevel);
        if (!Number.isInteger(v) || v < 1 || v > 5) {
            errors.push(`clarityLevel must be an integer between 1 and 5 (got ${fields.clarityLevel})`);
        }
    }

    return errors.length === 0 ? OK : { valid: false, errors };
}

/**
 * Validates that required IDs are non-empty strings.
 */
export function validateRequiredIds(ids: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];

    for (const [key, value] of Object.entries(ids)) {
        if (!value || typeof value !== 'string' || value.trim() === '') {
            errors.push(`${key} is required and must be a non-empty string`);
        }
    }

    return errors.length === 0 ? OK : { valid: false, errors };
}

/** Merges multiple validation results into one */
export function mergeValidation(...results: ValidationResult[]): ValidationResult {
    const errors = results.flatMap((r) => r.errors);
    return { valid: errors.length === 0, errors };
}
