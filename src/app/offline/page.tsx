import Link from 'next/link'
import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Logo from '@/components/logo'

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-8">
      <div className="max-w-md w-full text-center">
        <div className="mb-8 flex justify-center">
          <Logo size={64} />
        </div>
        
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 rounded-full flex items-center justify-center">
            <WifiOff size={48} className="text-indigo-600" />
          </div>
          
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            Você está offline
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Parece que você perdeu a conexão com a internet. 
            Verifique sua conexão e tente novamente.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary px-8 py-4 rounded-full flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition-all"
          >
            <RefreshCw size={20} />
            Tentar Novamente
          </button>
          
          <Link
            href="/"
            className="btn btn-outline px-8 py-4 rounded-full flex items-center justify-center gap-2 bg-white/80 backdrop-blur-sm hover:bg-white transition-all"
          >
            <Home size={20} />
            Voltar para Início
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40">
          <p className="text-sm text-gray-600 mb-2 font-semibold">
            💡 Dica
          </p>
          <p className="text-xs text-gray-500 leading-relaxed">
            Algumas páginas podem estar disponíveis offline se você já as visitou antes.
          </p>
        </div>
      </div>
    </div>
  )
}

