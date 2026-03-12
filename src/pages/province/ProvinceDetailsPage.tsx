import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/button';
import { Panel } from '../../shared/ui/panel';
import { useProvince, useProvinceActions } from '../../features/province-actions';
import type { ActionType, DomainAction } from '../../game/rules/actions';
import { isTransitionAllowed } from '../../game/rules/transitions';

function buildAvailabilityAction(actionType: ActionType): DomainAction {
    switch (actionType) {
        case 'clarify':
            return {
                type: 'clarify',
                payload: {
                    desiredOutcome: 'placeholder outcome',
                    firstStep: 'placeholder step',
                    estimatedEntryMinutes: 5,
                },
            };
        case 'supply':
            return { type: 'supply', payload: { contextNotes: 'Added supplies' } };
        case 'decompose':
            return { type: 'decompose', payload: { subProvinceIds: ['placeholder-sub-province'] } };
        case 'start_move':
            return { type: 'start_move', payload: { durationMinutes: 25 } };
        case 'log_move':
            return { type: 'log_move', payload: { durationMinutes: 25 } };
        case 'apply_tactic':
            return {
                type: 'apply_tactic',
                payload: {
                    tacticType: 'scout',
                    siegeEventId: 'placeholder-siege-event',
                    data: {
                        tacticType: 'scout',
                        desiredOutcome: 'placeholder outcome',
                        firstStep: 'placeholder step',
                        estimatedEntryMinutes: 5,
                    },
                },
            };
        case 'complete':
            return { type: 'complete', payload: { note: 'Completed manually via UI' } };
        case 'retreat':
            return { type: 'retreat', payload: { reason: 'Retreating to reconsider approach' } };
        case 'reschedule':
            return { type: 'reschedule', payload: { reason: 'Rescheduling for later' } };
        case 'edit_fields':
            return { type: 'edit_fields', payload: { title: 'Edited title' } };
    }
}

export function isProvinceActionAvailable(province: import('../../entities/types').Province, actionType: ActionType): boolean {
    return isTransitionAllowed(province.state, buildAvailabilityAction(actionType));
}

export default function ProvinceDetailsPage() {
    const { provinceId } = useParams<{ provinceId: string }>();
    const navigate = useNavigate();
    const { province, loading, error: loadError, refresh } = useProvince(provinceId);
    const { executeAction } = useProvinceActions();
    const [actionError, setActionError] = useState<string | null>(null);

    const error = loadError || actionError;

    const handleAction = async (action: DomainAction) => {
        if (!province) return;
        try {
            setActionError(null);
            const actionWrapper = {
                type: action.type as 'clarify' | 'start_move' | 'complete' | 'apply_tactic',
                provinceId: province.id,
                payload: action.payload as any
            };
            await executeAction(actionWrapper);
            // Reload province after action
            await refresh();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : `Failed to execute ${action.type}`;
            setActionError(message);
        }
    };

    if (loading) return <div className="page-shell">Loading province details...</div>;
    if (!province) return <div className="page-shell">Province not found.</div>;

    const isFog = province.state === 'fog';

    return (
        <div className="page-shell">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate(`/map/${province.regionId}`)}>
                    ← Back to Map
                </Button>
            </div>

            <h1>{province.title}</h1>
            <p className="lede mb-8">
                Current State: <span className="font-bold text-[#f0b35f]">{province.state.toUpperCase()}</span>
            </p>

            {error && <div className="mb-6 text-red-400 text-sm p-3 bg-red-400/10 rounded-md border border-red-400/20">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Panel title="Core Actions">
                    <div className="p-4 space-y-3">
                        {isFog ? (
                            <Button onClick={() => navigate(`/province/${province.id}/clarify`)} className="w-full justify-start">
                                Clarify Province
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={() => handleAction({ type: 'start_move', payload: { durationMinutes: 25 } })}
                                    className="w-full justify-start"
                                    disabled={!isProvinceActionAvailable(province, 'start_move')}
                                >
                                    Start Work (25m)
                                </Button>
                                <Button
                                    onClick={() => handleAction({ type: 'log_move', payload: { durationMinutes: 25 } })}
                                    className="w-full justify-start"
                                    disabled={!isProvinceActionAvailable(province, 'log_move')}
                                >
                                    Log Progress (25m)
                                </Button>
                                <Button
                                    onClick={() => handleAction({ type: 'supply', payload: { contextNotes: 'Added supplies' } })}
                                    className="w-full justify-start"
                                    disabled={!isProvinceActionAvailable(province, 'supply')}
                                >
                                    Supply
                                </Button>
                                <Button
                                    onClick={() => handleAction({ type: 'complete', payload: { note: 'Completed manually via UI' } })}
                                    className="w-full justify-start"
                                    disabled={!isProvinceActionAvailable(province, 'complete')}
                                >
                                    Mark as Completed
                                </Button>
                                <Button
                                    onClick={() => handleAction({ type: 'retreat', payload: { reason: 'Retreating to reconsider approach' } })}
                                    className="w-full justify-start"
                                    disabled={!isProvinceActionAvailable(province, 'retreat')}
                                >
                                    Retreat
                                </Button>
                                <Button
                                    onClick={() => handleAction({ type: 'reschedule', payload: { reason: 'Rescheduling for later' } })}
                                    className="w-full justify-start"
                                    disabled={!isProvinceActionAvailable(province, 'reschedule')}
                                >
                                    Reschedule
                                </Button>
                                <Button
                                    onClick={() => handleAction({ type: 'edit_fields', payload: { title: `${province.title} (Edited)` } })}
                                    className="w-full justify-start"
                                    disabled={!isProvinceActionAvailable(province, 'edit_fields')}
                                >
                                    Edit Name (Demo)
                                </Button>
                            </>
                        )}
                    </div>
                </Panel>

                <Panel title="Province Data">
                    <div className="p-4 space-y-4 text-sm font-mono opacity-80">
                        <div><strong>ID:</strong> {province.id}</div>
                        {province.desiredOutcome && <div><strong>Outcome:</strong> {province.desiredOutcome}</div>}
                        {province.firstStep && <div><strong>First Step:</strong> {province.firstStep}</div>}
                        {province.estimatedEntryMinutes !== undefined && <div><strong>Entry Mins:</strong> {province.estimatedEntryMinutes}</div>}
                        <div><strong>Created:</strong> {new Date(province.createdAt).toLocaleString()}</div>
                        <div><strong>Updated:</strong> {new Date(province.updatedAt).toLocaleString()}</div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}
