import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { DriveInner } from './_components/DriveInner'

export default function DrivePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: '#000' }}>
          <Loader2 size={20} className="animate-spin" style={{ color: '#444' }} />
        </div>
      }
    >
      <DriveInner />
    </Suspense>
  )
}
