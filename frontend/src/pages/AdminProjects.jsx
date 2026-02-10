import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Layout } from '../components/common/Layout';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { projectsApi } from '../api/projects';

export function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: { name: '', description: '', status: 'active' },
  });

  const loadProjects = () => {
    setLoading(true);
    projectsApi
      .list()
      .then((r) => setProjects(r.data.results || []))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load projects'))
      .finally(() => setLoading(false));
  };

  useEffect(() => loadProjects(), []);

  const onSubmit = async (data) => {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await projectsApi.create(data);
      reset({ name: '', description: '', status: 'active' });
      loadProjects();
    } catch (err) {
      const d = err.response?.data;
      setSubmitError(
        d?.detail ||
          (d?.name && d.name[0]) ||
          (typeof d === 'object' && JSON.stringify(d)) ||
          'Failed to create project'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && projects.length === 0) return <Layout><Loading /></Layout>;

  return (
    <Layout>
      <div className="page-header">
        <h1>Manage Projects</h1>
        <Link to="/admin" className="btn btn-secondary">Back to Admin</Link>
      </div>
      {error && <ErrorMessage error={error} onDismiss={() => setError(null)} />}
      {submitError && <ErrorMessage error={submitError} onDismiss={() => setSubmitError(null)} />}

      <div className="form-card">
        <h2>Add new project</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Project name *</label>
              <input
                id="name"
                type="text"
                {...register('name', { required: 'Required' })}
                placeholder="e.g. Project Alpha"
              />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea id="description" rows={2} {...register('description')} placeholder="Optional" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create project'}
          </button>
        </form>
      </div>

      <h2 className="section-title">Existing projects</h2>
      {projects.length === 0 ? (
        <p className="muted">No projects yet. Create one above to use in daily reports.</p>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.description || '—'}</td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
