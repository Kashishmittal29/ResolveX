export function StatusBadge({ status }) {
  const map = {
    PENDING:     'badge-pending',
    IN_PROGRESS: 'badge-progress',
    RESOLVED:    'badge-resolved',
    ESCALATED:   'badge-escalated',
  };
  const labels = {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    ESCALATED: 'Escalated',
  };
  return (
    <span className={map[status] || 'badge bg-surface-100 text-surface-600'}>
      {labels[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const map = {
    LOW:      'badge-low',
    MEDIUM:   'badge-medium',
    HIGH:     'badge-high',
    CRITICAL: 'badge-critical',
  };
  return (
    <span className={map[priority] || 'badge bg-surface-100 text-surface-600'}>
      {priority}
    </span>
  );
}
