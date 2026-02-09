interface TaskHeaderProps {
  auditId: string;
  createdDate: string;
  title: string;
}

export function TaskHeader({ auditId, createdDate, title }: TaskHeaderProps) {
  return (
    <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <span>Audit ID: {auditId}</span>
          <span>•</span>
          <span>Created {createdDate}</span>
        </div>
        <h1 className="text-slate-900 dark:text-white text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
      </div>
    </div>
  );
}
