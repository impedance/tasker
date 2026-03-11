import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/button';
import { Panel } from '../../shared/ui/panel';
import { Input } from '../../shared/ui/input';
import { useApplyAction } from '../../shared/hooks/useApplyAction';
import { provinceRepository } from '../../storage/repositories';
import type { Province } from '../../entities/types';

export default function ClarifyProvincePage() {
    const { provinceId } = useParams<{ provinceId: string }>();
    const navigate = useNavigate();
    const { execute } = useApplyAction();

    const [province, setProvince] = useState<Province | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [desiredOutcome, setDesiredOutcome] = useState('');
    const [firstStep, setFirstStep] = useState('');
    const [estimatedEntryMinutes, setEstimatedEntryMinutes] = useState(15);

    useEffect(() => {
        async function load() {
            if (!provinceId) return;
            const p = await provinceRepository.getById(provinceId);
            if (p) setProvince(p);
            setLoading(false);
        }
        load();
    }, [provinceId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!province) return;

        try {
            setError(null);
            await execute(province, {
                type: 'clarify',
                payload: {
                    desiredOutcome,
                    firstStep,
                    estimatedEntryMinutes,
                },
            });
            navigate(`/map/${province.regionId}`);
        } catch (err: any) {
            setError(err.message || 'Failed to clarify province');
        }
    };

    if (loading) return <div className="page-shell">Loading province...</div>;
    if (!province) return <div className="page-shell">Province not found.</div>;

    if (province.state !== 'fog') {
        return (
            <div className="page-shell">
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="ghost" onClick={() => navigate(`/map/${province.regionId}`)}>
                        ← Back to Map
                    </Button>
                </div>
                <h1>Clarify Province</h1>
                <Panel title={`Province is already clarified`}>
                    <div className="p-4 space-y-4">
                        <p className="text-muted-foreground">This province is in state: {province.state}</p>
                        <Button onClick={() => navigate(`/province/${province.id}`)}>
                            View Province Details
                        </Button>
                    </div>
                </Panel>
            </div>
        );
    }

    return (
        <div className="page-shell">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" onClick={() => navigate(`/map/${province.regionId}`)}>
                    ← Back to Map
                </Button>
            </div>

            <h1>Clarify Province</h1>
            <p className="lede mb-8">
                Define outcomes and first steps to turn "{province.title}" from fog of war into a ready province.
            </p>

            <Panel title={`Clarify: ${province.title}`}>
                <form onSubmit={handleSubmit} className="p-4 space-y-6">
                    {error && <div className="text-red-400 text-sm p-3 bg-red-400/10 rounded-md border border-red-400/20">{error}</div>}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Desired Outcome</label>
                        <p className="text-xs text-muted-foreground mb-2">What does success look like for this province?</p>
                        <Input
                            required
                            value={desiredOutcome}
                            onChange={e => setDesiredOutcome(e.target.value)}
                            placeholder="e.g. The authentication system is fully implemented and tested"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">First Step</label>
                        <p className="text-xs text-muted-foreground mb-2">What is the immediate next physical action?</p>
                        <Input
                            required
                            value={firstStep}
                            onChange={e => setFirstStep(e.target.value)}
                            placeholder="e.g. Search for 'export const login' in the auth module"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Estimated Entry (Minutes)</label>
                        <p className="text-xs text-muted-foreground mb-2">How long will that first step take?</p>
                        <Input
                            type="number"
                            min={1}
                            required
                            value={estimatedEntryMinutes}
                            onChange={e => setEstimatedEntryMinutes(parseInt(e.target.value))}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" variant="default">
                            Clarify and Readify
                        </Button>
                    </div>
                </form>
            </Panel>
        </div>
    );
}
