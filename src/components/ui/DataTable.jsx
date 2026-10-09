import { SkeletonRows } from './States';

/**
 * Desktop renders a table; below `md` each row becomes a stacked card, because horizontally
 * scrolling a table on a phone is unusable.
 */
export default function DataTable({ columns, rows, loading, empty, rowKey }) {
  if (loading) return <SkeletonRows rows={6} />;
  if (!rows?.length) return empty;

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className="bg-surface-alt px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-ink-500 first:rounded-l-xl last:rounded-r-xl"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={rowKey(row)} className="transition hover:bg-surface-alt/60">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="border-b border-surface-line px-4 py-4 align-middle text-ink-900"
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={rowKey(row)} className="rounded-xl bg-surface-alt p-4">
            <dl className="space-y-2">
              {columns.map((column) => (
                <div key={column.key} className="flex items-start justify-between gap-3">
                  <dt className="text-xs text-ink-500">{column.header}</dt>
                  <dd className="text-right text-sm text-ink-900">{column.render(row)}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
