'use client';
import dynamic from 'next/dynamic';

// Disable SSR for Three.js / WebGL
const Agent = dynamic(() => import('../../src/components/admin/Agent'), { ssr: false });

export default function AdminPage() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <Agent />
    </div>
  );
}
