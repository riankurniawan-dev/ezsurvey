'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Download, MapPin } from 'lucide-react'
import QRCode from 'react-qr-code'

export default function ReportPage() {
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [settings, setSettings] = useState<any>({
    pdfHeaderTitle: 'Laporan Inspeksi & Survey Teknis',
    pdfHeaderSubtitle: 'SMART INSPECTION',
    pdfFooterText: '© HYDANT - Hak cipta dilindungi undang-undang.',
    pdfLogoUrl: ''
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const [projectRes, settingsRes] = await Promise.all([
          fetch(`/api/projects/${params.id}`),
          fetch('/api/settings')
        ])
        
        if (projectRes.ok) {
          setData(await projectRes.json())
        }
        if (settingsRes.ok) {
          const sData = await settingsRes.json()
          if (Object.keys(sData).length > 0) {
            setSettings((prev: any) => ({...prev, ...sData}))
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchReport()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!data) return <div className="p-8 text-center text-gray-500">Laporan tidak ditemukan</div>

  const handlePrint = () => {
    window.print()
  }

  const surveys = data.surveys || []

  return (
    <div className="max-w-[210mm] mx-auto bg-white min-h-screen pb-[60px] relative">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 print:hidden z-50 flex flex-col gap-3">
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 transition-transform hover:scale-105 text-sm font-semibold"
        >
          <Download className="w-5 h-5" />
          Cetak / Simpan PDF
        </button>
      </div>

      {/* Global Fixed Footer for Print */}
      <div className="fixed bottom-0 left-0 w-full hidden print:block text-center pb-2 text-[10px] text-gray-400 font-medium">
        {settings.pdfFooterText}
      </div>

      {/* ===== COVER PAGE ===== */}
      <div className="p-12 min-h-[297mm] flex flex-col justify-between relative border border-gray-200 print:border-none page-break-after bg-white">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-blue-600 pb-6 mb-12">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{settings.pdfHeaderTitle || 'HYDANT'}</h1>
              <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mt-1">{settings.pdfHeaderSubtitle || 'Smart Inspection'}</p>
            </div>
            {settings.pdfLogoUrl ? (
              <img src={settings.pdfLogoUrl} alt="Logo" className="h-16 object-contain" />
            ) : data.client?.logo ? (
              <img src={data.client.logo} alt="Client Logo" className="h-16 object-contain" />
            ) : null}
          </div>
          
          {/* Title */}
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">
              Laporan Inspeksi<br/>& Survey Teknis
            </h2>
            <div className="w-16 h-1.5 bg-blue-600 rounded-full"></div>
          </div>

          {/* Project Info */}
          <div className="mt-16 space-y-6">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Nama Project</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{data.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Client</p>
              <p className="text-lg text-slate-800 mt-1">{data.client?.name || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Lokasi</p>
                <p className="text-lg text-slate-800 mt-1">{data.location || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Site</p>
                <p className="text-lg text-slate-800 mt-1">{data.site || '-'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Tanggal Survey</p>
                <p className="text-lg text-slate-800 mt-1">{new Date(data.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Status</p>
                <p className="text-lg font-bold text-blue-600 mt-1">{data.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Cover */}
        <div className="border-t border-gray-200 pt-8 mt-12 flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Disusun Oleh</p>
            <p className="text-lg font-bold text-slate-900 mt-1">{data.surveyor?.name || 'Surveyor'}</p>
            <p className="text-sm text-gray-500">Surveyor</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-2">Verifikasi QR</p>
            <div className="bg-white p-2 border border-gray-200 rounded-lg inline-block">
              <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/report/${data.id}`} size={80} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== SURVEY RESULTS ===== */}
      {surveys.length > 0 && (
        <div className="p-8 print:p-0">
          <div className="border-b-2 border-blue-600 pb-2 mb-6 page-break-inside-avoid print:mt-8">
            <h2 className="text-2xl font-bold text-slate-900">Hasil Survey & Inspeksi</h2>
          </div>

          <div className="space-y-6">
            {surveys.map((survey: any, idx: number) => (
              <div key={survey.id} className="page-break-inside-avoid border border-gray-300 rounded-lg p-4 bg-white">
                {/* Item Header */}
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">{survey.areaName}</span>
                      <span className="text-[10px] text-gray-400">#{idx + 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">{survey.itemName}</h3>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      survey.status === 'EXISTING' ? 'bg-green-100 text-green-700' :
                      survey.status === 'RUSAK' ? 'bg-red-100 text-red-700' :
                      survey.status === 'PERLU_PERBAIKAN' ? 'bg-orange-100 text-orange-700' :
                      survey.status === 'PERLU_PENGGANTIAN' ? 'bg-red-100 text-red-700' :
                      survey.status === 'TIDAK_ADA' ? 'bg-gray-100 text-gray-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {survey.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                      survey.priority === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                      survey.priority === 'HIGH' ? 'bg-orange-50 text-orange-600' :
                      survey.priority === 'MEDIUM' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      Prio: {survey.priority}
                    </span>
                  </div>
                </div>

                {/* Data Fields */}
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Kondisi Existing</p>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{survey.existingCondition || '-'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Observasi</p>
                    <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">{survey.observation || '-'}</p>
                  </div>
                </div>

                {survey.recommendation && (
                  <div className="mb-3">
                    <p className="text-[10px] text-gray-500 uppercase font-semibold mb-0.5">Rekomendasi</p>
                    <p className="text-xs font-medium text-blue-800 bg-blue-50/50 p-2 rounded border border-blue-100/50">
                      {survey.recommendation}
                    </p>
                  </div>
                )}

                {/* Photos & GPS */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {survey.photos && survey.photos.length > 0 && (
                    <div className="flex-1">
                      <div className="flex gap-2">
                        {survey.photos.slice(0, 3).map((photo: any, pidx: number) => (
                          <div key={photo.id || pidx} className="w-24 h-24 sm:w-32 sm:h-32 border border-gray-200 rounded overflow-hidden">
                            <img src={photo.path} alt="Foto" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {survey.gpsLat && survey.gpsLng && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 bg-gray-50 p-1.5 rounded border border-gray-100 self-start">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      <span>{Number(survey.gpsLat).toFixed(5)}, {Number(survey.gpsLng).toFixed(5)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary Footer */}
          <div className="mt-8 pt-6 border-t-2 border-gray-200 page-break-inside-avoid">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Ringkasan Survey</h3>
            <table className="w-full text-xs border border-gray-200 rounded overflow-hidden">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-3 py-1.5 font-semibold text-gray-700 border-b">Status</th>
                  <th className="text-right px-3 py-1.5 font-semibold text-gray-700 border-b">Jumlah</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(
                  surveys.reduce((acc: Record<string, number>, s: any) => {
                    acc[s.status] = (acc[s.status] || 0) + 1
                    return acc
                  }, {} as Record<string, number>)
                ).map(([status, count]) => (
                  <tr key={status} className="border-b border-gray-100">
                    <td className="px-3 py-1.5 text-gray-800">{status.replace(/_/g, ' ')}</td>
                    <td className="px-3 py-1.5 text-right font-semibold text-gray-900">{count as number}</td>
                  </tr>
                ))}
                <tr className="bg-blue-50 font-bold">
                  <td className="px-3 py-1.5 text-blue-700">TOTAL</td>
                  <td className="px-3 py-1.5 text-right text-blue-700">{surveys.length}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signature Area */}
          <div className="mt-12 grid grid-cols-2 gap-12 page-break-inside-avoid pb-12">
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-700 mb-16">Surveyor</p>
              <div className="border-t border-gray-400 pt-1.5 mx-8">
                <p className="text-xs font-bold text-gray-900">{data.surveyor?.name || '________________'}</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-700 mb-16">Supervisor</p>
              <div className="border-t border-gray-400 pt-1.5 mx-8">
                <p className="text-xs font-bold text-gray-900">________________</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4; margin: 10mm 15mm; }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
            margin: 0; 
            background: white !important;
          }
          .page-break-after { page-break-after: always; }
          .page-break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
        }
      `}} />
    </div>
  )
}
