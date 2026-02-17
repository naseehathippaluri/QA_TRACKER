import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/common/Layout';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { worklogsService } from '../services/worklogs';
import { featuresService } from '../services/features';
import { Loading } from '../components/common/Loading';

const PROJECT_OPTIONS = [
  { value: '', label: 'Select project' },
  { value: 'TOO', label: 'TOO' },
  { value: 'TFA', label: 'TFA' },
];
import { useAuth } from '../contexts/AuthContext';

const defaultValues = {
  feature: '',
  project: '',
  date: new Date().toISOString().slice(0, 10),
  test_cases_written: 0,
  test_cases_reviewed: 0,
  test_cases_executed: 0,
  test_cases_passed: 0,
  test_cases_failed: 0,
  test_cases_blocked: 0,
  test_cases_in_progress: 0,
  test_cases_future_execution: 0,
  test_cases_invalid: 0,
  retested_qa_review_tickets: 0,
  defects_raised: 0,
  ticket_number_with_priority: '',
  observations_found: 0,
  comments: '',
  assigned_to: '',
};

export function WorkLogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const isEdit = Boolean(id);
  const [features, setFeatures] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  useEffect(() => {
    let cancelled = false;
    featuresService.list().then((r) => !cancelled && setFeatures(r.data.results || [])).catch(() => {});
    if (isEdit) {
      worklogsService.get(id)
        .then((r) => {
          if (!cancelled) reset({ ...defaultValues, ...r.data });
        })
        .catch(() => {})
        .finally(() => !cancelled && setLoading(false));
    } else {
      setLoading(false);
    }
    return () => { cancelled = true; };
  }, [id, isEdit, reset]);

  const onSubmit = async (data) => {
    setSubmitError(null);
    setSubmitting(true);
    const payload = {
      ...data,
      feature: Number(data.feature),
      project: data.project,
      assigned_to: isAdmin && data.assigned_to ? Number(data.assigned_to) : null,
      test_cases_written: Number(data.test_cases_written) || 0,
      test_cases_reviewed: Number(data.test_cases_reviewed) || 0,
      test_cases_executed: Number(data.test_cases_executed) || 0,
      test_cases_passed: Number(data.test_cases_passed) || 0,
      test_cases_failed: Number(data.test_cases_failed) || 0,
      test_cases_blocked: Number(data.test_cases_blocked) || 0,
      test_cases_in_progress: Number(data.test_cases_in_progress) || 0,
      test_cases_future_execution: Number(data.test_cases_future_execution) || 0,
      test_cases_invalid: Number(data.test_cases_invalid) || 0,
      retested_qa_review_tickets: Number(data.retested_qa_review_tickets) || 0,
      defects_raised: Number(data.defects_raised) || 0,
      observations_found: Number(data.observations_found) || 0,
    };
    try {
      if (isEdit) {
        await worklogsService.update(id, payload);
      } else {
        await worklogsService.create(payload);
      }
      navigate('/worklogs');
    } catch (err) {
      const d = err.response?.data;
      setSubmitError(d?.errors?.non_field_errors?.[0] || d?.detail || 'Save failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && isEdit) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Work Log' : 'Create Work Log'}</h1>
      </div>
      <ErrorMessage error={submitError} onDismiss={() => setSubmitError(null)} />
      <form onSubmit={handleSubmit(onSubmit)} className="worklog-form report-form">
        <section className="form-section">
          <h2>Basic Info</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="feature">Feature *</label>
              <select id="feature" {...register('feature', { required: 'Select a feature' })}>
                <option value="">Select feature</option>
                {features.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              {errors.feature && <span className="field-error">{errors.feature.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="project">Project *</label>
              <select id="project" {...register('project', { required: 'Select a project' })}>
                {PROJECT_OPTIONS.map((opt) => (
                  <option key={opt.value || 'none'} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.project && <span className="field-error">{errors.project.message}</span>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input id="date" type="date" {...register('date', { required: 'Required' })} />
            {errors.date && <span className="field-error">{errors.date.message}</span>}
          </div>
          {isAdmin && (
            <div className="form-group">
              <label htmlFor="assigned_to">Assigned to (optional)</label>
              <select id="assigned_to" {...register('assigned_to')}>
                <option value="">—</option>
                {/* User list could be from API; for now leave empty or add users endpoint */}
              </select>
            </div>
          )}
        </section>

        <section className="form-section">
          <h2>Test Execution Metrics</h2>
          <div className="form-grid">
            {[
              ['test_cases_written', 'Test Cases Written'],
              ['test_cases_reviewed', 'Test Cases Reviewed'],
              ['test_cases_executed', 'Test Cases Executed'],
              ['test_cases_passed', 'Passed'],
              ['test_cases_failed', 'Failed'],
              ['test_cases_blocked', 'Blocked'],
              ['test_cases_in_progress', 'In Progress'],
              ['test_cases_future_execution', 'Future Execution'],
              ['test_cases_invalid', 'Invalid'],
              ['retested_qa_review_tickets', 'Retested QA Review Tickets'],
            ].map(([name, label]) => (
              <div key={name} className="form-group">
                <label htmlFor={name}>{label}</label>
                <input id={name} type="number" min={0} {...register(name)} />
              </div>
            ))}
          </div>
        </section>

        <section className="form-section">
          <h2>Defects</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="defects_raised">Defects Raised</label>
              <input id="defects_raised" type="number" min={0} {...register('defects_raised')} />
            </div>
            <div className="form-group">
              <label htmlFor="ticket_number_with_priority">Ticket Number with Priority</label>
              <input id="ticket_number_with_priority" type="text" {...register('ticket_number_with_priority')} placeholder="e.g. TKT-101 (High)" />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Observations</h2>
          <div className="form-group">
            <label htmlFor="observations_found">Observations Found</label>
            <input id="observations_found" type="number" min={0} {...register('observations_found')} />
          </div>
        </section>

        <section className="form-section">
          <div className="form-group">
            <label htmlFor="comments">Comments</label>
            <textarea id="comments" rows={4} {...register('comments')} />
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : isEdit ? 'Update' : 'Submit'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
