import { CompassIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center dark:bg-slate-950">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <CompassIcon className="h-7 w-7" />
      </span>
      <div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          That page doesn&apos;t exist, or the link is out of date.
        </p>
      </div>
      <Link to="/">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
