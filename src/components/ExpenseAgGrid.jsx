// components/ExpenseAgGrid.jsx
'use client';

import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { CalendarIcon } from '@heroicons/react/24/outline';

// Register all community features
ModuleRegistry.registerModules([AllCommunityModule]);

export default function ExpenseListView({ expenses }) {
  if (!expenses || expenses.length === 0) return null;

  // Column Definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Category',
      field: 'type',
      flex: 1,
      minWidth: 150,
      cellRenderer: (params) => (
        <div className="flex items-center h-full">
          <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-bold font-mono border border-primary/20">
            {params.value || 'General'}
          </span>
        </div>
      ),
    },
    {
      headerName: 'Description',
      field: 'description',
      flex: 2,
      minWidth: 240,
      cellRenderer: (params) => (
        <div className="flex items-center h-full">
          <span className="text-sm font-medium text-dark dark:text-light truncate">
            {params.value || 'No description provided'}
          </span>
        </div>
      ),
    },
    {
      headerName: 'Date',
      field: 'createdAt',
      flex: 1,
      minWidth: 150,
      cellRenderer: (params) => {
        const dateStr = params.value ? new Date(params.value).toLocaleDateString() : 'Just now';
        return (
          <div className="flex items-center h-full">
            <span className="text-xs text-dark/60 dark:text-light/60 flex items-center gap-1.5 font-mono">
              <CalendarIcon className="h-3.5 w-3.5" />
              {dateStr}
            </span>
          </div>
        );
      },
    },
    {
      headerName: 'Amount',
      field: 'amount',
      flex: 1,
      minWidth: 130,
      sortable: true,
      cellRenderer: (params) => (
        <div className="flex items-center justify-end sm:justify-start h-full">
          <span className="text-sm font-extrabold font-heading text-primary">
            ${Number(params.value || 0).toFixed(2)}
          </span>
        </div>
      ),
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 font-sans">
      {/* AG Grid Theme Wrapper Container */}
      <div className="ag-theme-alpine w-full h-[480px] rounded-3xl overflow-hidden bg-white/80 dark:bg-dark/80 border border-tertiary/20 dark:border-tertiary/10 shadow-sm p-4">
        <AgGridReact
          rowData={expenses}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={8}
          rowHeight={64}
          headerHeight={52}
        />
      </div>
    </div>
  );
}