// src/components/dashboard/PostsPagination.tsx
import React from 'react';
import { Box, Pagination } from '@mui/material';

type Props = {
  totalPages: number;
  page: number;
  onChange: (value: number) => void;
};

export default function PostsPagination({ totalPages, page, onChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, val) => onChange(val)}
        color="primary"
        shape="rounded"
      />
    </Box>
  );
}
