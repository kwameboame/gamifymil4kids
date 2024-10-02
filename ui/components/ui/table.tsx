import React from 'react';

export const Table: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <table className="min-w-full border-collapse border border-gray-200">{children}</table>;
};

export const TableHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <thead className="bg-gray-100">{children}</thead>;
};

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const TableRow: React.FC<{ children: React.ReactNode; key: string | number }> = ({ children, key }) => {
  return <tr key={key} className="border-b">{children}</tr>;
};

export const TableCell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <td className="border px-4 py-2">{children}</td>;
};

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <th className="border px-4 py-2 text-left">{children}</th>;
};