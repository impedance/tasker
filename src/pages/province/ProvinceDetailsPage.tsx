import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/button';
import { Panel } from '../../shared/ui/panel';
import { useApplyAction } from '../../shared/hooks/useApplyAction';
import { provinceRepository } from '../../storage/repositories';
import type { Province } from '../../entities/types';
import type { ActionType } from '../../game/rules/actions';

export default function ProvinceDetailsPage() {
    const { provinceId } = useParams<{ provinceId: string }>();
    const navigate = useNavigate();
    const { execute } = useApplyAction();

    const [province, setProvince] = useState<Province | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            if (!provinceId) return;
            const p = await provinceRepository.getById(provinceId);
            if (p) setProvince(p);
            setLoading(false);
        }
        load();
    }, [provinceId]);

    const handleAction = async (actionType: ActionType, payload: any = {}) => {
        if (!province) return;
        try {
            setError(null);
            await execute(province, { type: actionType as any, payload });
            // Reload province after action
            const updated = await provinceRepository.getById(province.id);
            if (updated) setProvince(updated);
        } catch (err: any) {
            setError(err.message || `Failed to execute ${actionType}`);
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
                                    onClick={() => handleAction('start_move', { durationMinutes: 25 })}
                                    className="w-full justify-start"
                                    disabled={province.state !== 'ready' && province.state !== 'in_progress'}
                                >
                                    Start Work (25m)
                                </Button>
                                <Button
                                    onClick={() => handleAction('log_move', { durationMinutes: 25 })}
                                    className="w-full justify-start"
                                    disabled={province.state !== 'in_progress'}
                                >
                                    Log Progress (25m)
                                </Button>
                                <Button
                                    onClick={() => handleAction('supply', { contextNotes: 'Added supplies' })}
                                    className="w-full justify-start"
                                    disabled={province.state === 'captured'}
                                >
                                    Supply
                                </Button>
                                <Button
                                    onClick={() => handleAction('complete', { note: 'Completed manually via UI' })}
                                    className="w-full justify-start"
                                    disabled={province.state === 'captured'}
                                >
                                    Mark as Completed
                                </Button>
                                <Button
                                    onClick={() => handleAction('retreat', { reason: 'Retreating to reconsider approach' })}
                                    className="w-full justify-start"
                                    disabled={province.state === 'captured'}
                                >
                                    Retreat
                                </Button>
                                <Button
                                    onClick={() => handleAction('reschedule', { reason: 'Rescheduling for later' })}
                                    className="w-full justify-start"
                                    disabled={province.state === 'captured'}
                                >
                                    Reschedule
                                </Button>
                                <Button
                                    onClick={() => handleAction('edit_fields', { title: province.title + ' (Edited)' })}
                                    className="w-full justify-start"
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
