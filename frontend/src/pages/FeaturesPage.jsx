import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { featuresService } from '../services/features';

export function FeaturesPage() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { name: '' } });

  const loadFeatures = () => {
    setLoading(true);
    featuresService.list()
      .then((r) => {
        const data = r.data;
        setFeatures(Array.isArray(data) ? data : (data?.results || []));
      })
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load features'))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadFeatures(), []);

  const onSubmit = async (data) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await featuresService.create({ name: data.name.trim() });
      reset({ name: '' });
      loadFeatures();
    } catch (err) {
      const d = err.response?.data;
      setSubmitError(d?.name?.[0] || d?.detail || 'Failed to create feature');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && features.length === 0) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Features</h1>
      </div>
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}
      {submitError && <ErrorMessage error={submitError} onDismiss={() => setSubmitError(null)} />}

      <div className="form-card">
        <h2>Create feature</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Feature name *</label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Login flow"
              {...register('name', { required: 'Required' })}
            />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-medium" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create feature'}
          </button>
        </form>
      </div>

      <h2 className="section-title">All features</h2>
      {features.length === 0 ? (
        <p className="muted">No features yet. Create one above to use in work logs.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Created by</th>
                <th>Created at</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.created_by_username || '—'}</td>
                  <td>{f.created_at ? new Date(f.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
