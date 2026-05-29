const styles = {
    income:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',

    expense:
        'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',

    warning:
        'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',

    info:
        'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',

    critical:
        'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',

    neutral:
        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const StatusPill = ({ variant = 'neutral', children }) => {
    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize transition ${styles[variant] || styles.neutral}`}
        >
            {children}
        </span>
    );
};

export default StatusPill;