import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppController } from '../../../controllers/useAppController';
import { getDepartmentById } from '../../../models/selectors';
import type { TaskPriority, TaskType } from '../../../models/types';
import { PATHS } from '../../../routes';
import { PageHeader } from '../../components/shared/PageHeader';
import { StateBoundary } from '../../components/shared/StateBoundary';
import { ScreenFrame } from '../../layouts/ScreenFrame';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FieldShell, Input, Select } from '../../components/ui/Fields';

interface FormState {
  departmentId: string;
  type: TaskType;
  priority: TaskPriority;
  patientId: string;
  patientName: string;
  location: string;
}

export function RequesterCreateScreen() {
  const controller = useAppController();
  const { state } = controller;
  const navigate = useNavigate();
  const mode = state.screenModes['requester.create'];

  const [form, setForm] = useState<FormState>({
    departmentId: state.currentRequesterDeptId,
    type: 'blodprove',
    priority: 'standard',
    patientId: '',
    patientName: '',
    location: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const department = useMemo(() => getDepartmentById(state, form.departmentId), [form.departmentId, state]);
  const validation = {
    patientId: submitted && !form.patientId.trim() ? 'Patient ID er påkrævet' : '',
    location: submitted && !form.location.trim() ? 'Lokation er påkrævet' : '',
  };
  const isValid = !!form.patientId.trim() && !!form.location.trim();

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    if (!isValid) return;
    const taskId = controller.createTask({
      departmentId: form.departmentId,
      type: form.type,
      priority: form.priority,
      patientId: form.patientId.trim(),
      patientName: form.patientName.trim() || 'Patient',
      location: form.location.trim(),
    });
    if (taskId) {
      navigate(PATHS.requesterConfirm(taskId));
    }
  };

  return (
    <ScreenFrame
      screenKey="requester.create"
      header={
        <PageHeader
          eyebrow="Rekvirerende afdeling"
          title="Opret opgave"
          subtitle="Hurtig bestilling i én skærm. Fokus på det nødvendige, så opgaven kan sendes på under 20 sekunder."
          actions={<Badge tone="info">3 trin i én skærm</Badge>}
        />
      }
    >
      <StateBoundary
        mode={mode}
        onRetry={() => controller.retryScreen('requester.create')}
        fallbackContent={<p className="text-sm">Senest valgte afdeling vises fortsat i formularen.</p>}
      >
        <form onSubmit={onSubmit} className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card title="Bestilling" subtitle="Trin 1-3 samlet for lav kognitiv belastning.">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge tone="brand">1. Afdeling</Badge>
                <Badge tone="neutral">2. Opgavetype</Badge>
                <Badge tone="neutral">3. Patient</Badge>
              </div>

              <FieldShell label="Afdeling" hint="Forudfyldt hvor muligt.">
                <Select
                  value={form.departmentId}
                  onChange={(event) => setForm((prev) => ({ ...prev, departmentId: event.target.value }))}
                >
                  {state.departments.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {dep.name}
                    </option>
                  ))}
                </Select>
              </FieldShell>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell label="Type">
                  <Select
                    value={form.type}
                    onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value as TaskType }))}
                  >
                    <option value="blodprove">Blodprøve</option>
                    <option value="ekg">EKG</option>
                    <option value="andet">Andet</option>
                  </Select>
                </FieldShell>
                <FieldShell label="Prioritet">
                  <Select
                    value={form.priority}
                    onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}
                  >
                    <option value="standard">Standard</option>
                    <option value="akut">Akut</option>
                  </Select>
                </FieldShell>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldShell label="Patient ID" error={validation.patientId}>
                  <Input
                    value={form.patientId}
                    onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
                    placeholder="Fx P-2044"
                    disabled={state.offline}
                  />
                </FieldShell>
                <FieldShell label="Patientnavn (valgfri)">
                  <Input
                    value={form.patientName}
                    onChange={(event) => setForm((prev) => ({ ...prev, patientName: event.target.value }))}
                    placeholder="Kun hvis relevant"
                    disabled={state.offline}
                  />
                </FieldShell>
              </div>

              <FieldShell label="Lokation" error={validation.location} hint="Fx Stue 12A eller Rum 3.">
                <Input
                  value={form.location}
                  onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="Angiv hvor patienten er"
                  disabled={state.offline}
                />
              </FieldShell>

              <div className="flex flex-wrap justify-end gap-2">
                <Button type="submit" size="lg" disabled={state.offline}>
                  Send opgave
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 content-start">
            <Card title="Forventet respons" subtitle="Korte forventninger skaber ro hos afdelingen.">
              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">Prioritet: {form.priority === 'akut' ? 'Akut' : 'Standard'}</p>
                  <p className="mt-1 text-slate-600">
                    {form.priority === 'akut'
                      ? 'Akutte opgaver prioriteres først og kan springe ekstra tjek over.'
                      : 'Standardopgaver fordeles i team-kø og kan få ekstra tjek hver 5. patient.'}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-900">Kontaktvej</p>
                  <p className="mt-1 text-slate-600">{department?.phoneLabel ?? 'Fælles linje'}</p>
                </div>
              </div>
            </Card>
            <Card title="Status efter oprettelse" subtitle="Se egne opgaver og seneste opdatering.">
              <Button variant="secondary" fullWidth onClick={() => navigate(PATHS.requesterStatus)}>
                Gå til status på egne opgaver
              </Button>
            </Card>
          </div>
        </form>
      </StateBoundary>
    </ScreenFrame>
  );
}
