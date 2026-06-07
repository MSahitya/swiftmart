export default function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton w-1/2" />
        <div className="h-4 skeleton" />
        <div className="h-4 skeleton w-3/4" />
        <div className="flex justify-between items-center pt-1">
          <div className="h-5 skeleton w-1/3" />
          <div className="w-8 h-8 rounded-full skeleton" />
        </div>
      </div>
    </div>
  )
}
