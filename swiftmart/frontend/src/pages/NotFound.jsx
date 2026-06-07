import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFound() {
  return (
    <>
      <Helmet><title>404 — SwiftMart</title></Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 text-center">
        <div>
          <p className="text-8xl font-black text-orange-100 mb-2">404</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    </>
  )
}
