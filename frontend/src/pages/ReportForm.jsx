import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/common/Layout';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { reportsApi } from '../api/reports';
import { projectsApi } from '../api/projects';
import { Loading } from '../components/common/Loading';

const defaultValues = {
  project: '',
  date: new Date().toISOString().slice(0, 10),
  total_test_cases_written: 0,
  total_test_cases_reviewed: 0,
  total_test_cases_executed: 0,
  test_cases_passed: 0,
  test_cases_failed: 0,
  test_cases_blocked: 0,
  test_cases_in_progress: 0,
  test_cases_future_execution: 0,
  test_cases_invalid: 0,
  retested_qa_review_tickets: 0,
  total_defects_found: 0,
  defects_raised: 0,
  ticket_number_with_priority: '',
  total_observations: 0,
  observations_found: 0,
  comments_remarks: '',
};

export function ReportForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  useEffect(() => {
    let cancelled = false;
    projectsApi.list().then((r) => !cancelled && setProjects(r.data.results || [])).catch(() => {});
    if (isEdit) {
      reportsApi.get(id)
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
      project: Number(data.project),
      total_test_cases_written: Number(data.total_test_cases_written) || 0,
      total_test_cases_reviewed: Number(data.total_test_cases_reviewed) || 0,
      total_test_cases_executed: Number(data.total_test_cases_executed) || 0,
      test_cases_passed: Number(data.test_cases_passed) || 0,
      test_cases_failed: Number(data.test_cases_failed) || 0,
      test_cases_blocked: Number(data.test_cases_blocked) || 0,
      test_cases_in_progress: Number(data.test_cases_in_progress) || 0,
      test_cases_future_execution: Number(data.test_cases_future_execution) || 0,
      test_cases_invalid: Number(data.test_cases_invalid) || 0,
      retested_qa_review_tickets: Number(data.retested_qa_review_tickets) || 0,
      total_defects_found: Number(data.total_defects_found) || 0,
      defects_raised: Number(data.defects_raised) || 0,
      total_observations: Number(data.total_observations) || 0,
      observations_found: Number(data.observations_found) || 0,
    };
    try {
      if (isEdit) {
        await reportsApi.update(id, payload);
        navigate('/reports');
      } else {
        await reportsApi.create(payload);
        navigate('/reports');
      }
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
        <h1>{isEdit ? 'Edit Report' : 'New Daily Report'}</h1>
      </div>
      <ErrorMessage error={submitError} onDismiss={() => setSubmitError(null)} />
      <form onSubmit={handleSubmit(onSubmit)} className="report-form">
        <section className="form-section">
          <h2>Basic Info</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="project">Project *</label>
              <select id="project" {...register('project', { required: 'Select a project' })}>
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.project && <span className="field-error">{errors.project.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input id="date" type="date" {...register('date', { required: 'Required' })} />
              {errors.date && <span className="field-error">{errors.date.message}</span>}
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Execution Metrics</h2>
          <div className="form-grid">
            {[
              ['total_test_cases_written', 'Test Cases Written'],
              ['total_test_cases_reviewed', 'Test Cases Reviewed'],
              ['total_test_cases_executed', 'Test Cases Executed'],
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
          <h2>Defect Tracking</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="total_defects_found">Total Defects Found</label>
              <input id="total_defects_found" type="number" min={0} {...register('total_defects_found')} />
            </div>
            <div className="form-group">
              <label htmlFor="defects_raised">Defects Raised</label>
              <input id="defects_raised" type="number" min={0} {...register('defects_raised')} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="ticket_number_with_priority">Ticket Number with Priority</label>
            <input id="ticket_number_with_priority" type="text" {...register('ticket_number_with_priority')} placeholder="e.g. TKT-101 (High)" />
          </div>
        </section>

        <section className="form-section">
          <h2>Observations</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="total_observations">Total Observations</label>
              <input id="total_observations" type="number" min={0} {...register('total_observations')} />
            </div>
            <div className="form-group">
              <label htmlFor="observations_found">Observations Found</label>
              <input id="observations_found" type="number" min={0} {...register('observations_found')} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <div className="form-group">
            <label htmlFor="comments_remarks">Comments / Remarks</label>
            <textarea id="comments_remarks" rows={4} {...register('comments_remarks')} />
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
