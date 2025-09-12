'use client';

import React, { memo, useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';

interface Column<T> {
  key: keyof T;
  header: string;
  width: number;
  render?: (value: any, item: T) => React.ReactNode;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  itemHeight?: number;
  className?: string;
}

interface RowProps<T> {
  index: number;
  style: React.CSSProperties;
  data: {
    items: T[];
    columns: Column<T>[];
  };
}

const Row = memo(function Row<T>({ index, style, data }: RowProps<T>) {
  const { items, columns } = data;
  const item = items[index];

  return (
    <div 
      style={style} 
      className="flex border-b border-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700"
    >
      {columns.map((column) => (
        <div 
          key={String(column.key)} 
          className="flex items-center px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
          style={{ width: column.width, minWidth: column.width }}
        >
          {column.render 
            ? column.render(item[column.key], item)
            : String(item[column.key] || '')
          }
        </div>
      ))}
    </div>
  );
});

function VirtualizedTable<T>({
  data,
  columns,
  height = 400,
  itemHeight = 48,
  className = '',
}: VirtualizedTableProps<T>) {
  const itemData = useMemo(() => ({
    items: data as unknown[],
    columns: columns as Column<unknown>[],
  }), [data, columns]);

  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + col.width, 0),
    [columns]
  );

  if (!data.length) {
    return (
      <div className={`border border-gray-200 rounded-lg ${className}`}>
        <div className="p-8 text-center text-gray-500">
          No hay datos disponibles
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div 
        className="flex bg-gray-50 dark:bg-slate-800 border-b border-gray-200"
        style={{ width: totalWidth }}
      >
        {columns.map((column) => (
          <div 
            key={String(column.key)}
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-200"
            style={{ width: column.width, minWidth: column.width }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {/* Virtualized Body */}
      <List
        height={height}
        itemCount={data.length}
        itemSize={itemHeight}
        itemData={itemData}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
}

export default memo(VirtualizedTable) as typeof VirtualizedTable;