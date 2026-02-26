'use client'

export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 rounded-xl">
          <div className="shimmer h-3 w-20 mb-2" />
          <div className="shimmer h-7 w-16 mb-1" />
          <div className="shimmer h-2 w-24" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 flex gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="shimmer h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 flex gap-4" style={{ borderBottom: '1px solid var(--border)' }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="shimmer h-3 flex-1" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass-card p-4 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="shimmer w-10 h-10 rounded-lg shrink-0" />
            <div className="flex-1">
              <div className="shimmer h-4 w-48 mb-2" />
              <div className="shimmer h-3 w-72" />
            </div>
            <div className="shimmer h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      {[false, true, false, true].map((isUser, i) => (
        <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[60%] ${isUser ? 'items-end' : 'items-start'}`}>
            <div className="shimmer rounded-2xl p-4" style={{ width: `${180 + Math.random() * 200}px`, height: `${40 + Math.random() * 30}px` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
