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
    <div className="max-w-[210mm] mx-auto bg-white min-h-screen pb-[60px] relative font-sans text-slate-800">
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 print:hidden z-50 flex flex-col gap-3">
        <button 
          onClick={handlePrint}
          className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded shadow-xl flex items-center gap-2 transition-transform hover:scale-105 text-sm font-semibold"
        >
          <Download className="w-5 h-5" />
          Cetak PDF
        </button>
      </div>

      {/* Global Fixed Footer for Print */}
      <div className="fixed bottom-0 left-0 w-full hidden print:block border-t border-slate-300 bg-white">
        <div className="max-w-[210mm] mx-auto px-12 py-2 flex justify-between items-center text-[9px] text-slate-500 font-medium">
          <span>{settings.pdfFooterText}</span>
          <span>Dicetak otomatis dari Sistem EzSurvey</span>
        </div>
      </div>

      {/* ===== COVER PAGE ===== */}
      <div className="p-12 min-h-[297mm] flex flex-col relative bg-white border border-slate-200 print:border-none page-break-after">
        
        {/* Cover Header */}
        <div className="flex justify-between items-center border-b-2 border-slate-800 pb-6 mb-16">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{settings.pdfHeaderTitle || 'INSPEKSI TEKNIS'}</h1>
            <p className="text-sm font-bold text-slate-500 tracking-widest uppercase mt-1">{settings.pdfHeaderSubtitle || 'Laporan Resmi'}</p>
          </div>
          {settings.pdfLogoUrl ? (
            <img src={settings.pdfLogoUrl} alt="Logo" className="h-16 object-contain" />
          ) : data.client?.logo ? (
            <img src={data.client.logo} alt="Client Logo" className="h-16 object-contain" />
          ) : null}
        </div>
        
        {/* Document Title */}
        <div className="text-center mt-12 mb-20 space-y-4">
          <h2 className="text-4xl font-bold text-slate-900 uppercase tracking-wide">
            Dokumen Laporan<br/>Hasil Survey
          </h2>
          <div className="w-24 h-1 bg-slate-800 mx-auto"></div>
        </div>

        {/* Project Metadata Table */}
        <div className="flex-1">
          <table className="w-full border-collapse border border-slate-800 mb-12">
            <tbody>
              <tr className="border-b border-slate-800">
                <td className="w-1/3 bg-slate-100 p-4 font-bold text-xs uppercase tracking-wider text-slate-700 border-r border-slate-800">Nama Project</td>
                <td className="p-4 font-bold text-lg text-slate-900">{data.name}</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="bg-slate-100 p-4 font-bold text-xs uppercase tracking-wider text-slate-700 border-r border-slate-800">Klien</td>
                <td className="p-4 font-bold text-lg text-slate-900">{data.client?.name || '-'}</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="bg-slate-100 p-4 font-bold text-xs uppercase tracking-wider text-slate-700 border-r border-slate-800">Lokasi / Site</td>
                <td className="p-4 text-base font-medium">{data.location || '-'} <span className="text-slate-400 mx-2">|</span> {data.site || '-'}</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="bg-slate-100 p-4 font-bold text-xs uppercase tracking-wider text-slate-700 border-r border-slate-800">Tanggal Survei</td>
                <td className="p-4 text-base font-medium">{new Date(data.createdAt).toLocaleDateString('id-ID', { dateStyle: 'long' })}</td>
              </tr>
              <tr>
                <td className="bg-slate-100 p-4 font-bold text-xs uppercase tracking-wider text-slate-700 border-r border-slate-800">Status Laporan</td>
                <td className="p-4 text-base font-bold text-slate-900 uppercase tracking-widest">{data.status}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Cover Footer / Signatures Info */}
        <div className="border-t-2 border-slate-800 pt-6 flex justify-between items-end">
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Disusun Oleh</p>
            <p className="text-xl font-bold text-slate-900">{data.surveyor?.name || 'Surveyor'}</p>
            <p className="text-sm font-medium text-slate-600">{data.surveyor?.email || 'Tim Surveyor'}</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] text-slate-500 mb-2 uppercase font-bold">Verifikasi Dokumen</p>
            <div className="bg-white p-1.5 border-2 border-slate-800 inline-block">
              <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/report/${data.id}`} size={70} />
            </div>
          </div>
        </div>
      </div>

      {/* ===== SURVEY RESULTS (Using Table Header for repeating headers on every printed page) ===== */}
      {surveys.length > 0 && (
        <div className="p-8 print:p-0">
          <table className="w-full">
            <thead className="print:table-header-group hidden">
              <tr>
                <td className="pb-6 pt-4">
                  <div className="flex justify-between items-center border-b-2 border-slate-800 pb-2">
                    <span className="font-bold text-slate-900 text-sm uppercase">{data.name}</span>
                    <span className="text-xs text-slate-500">{new Date(data.createdAt).toLocaleDateString('id-ID')}</span>
                  </div>
                </td>
              </tr>
            </thead>
            
            <tbody>
              <tr>
                <td>
                  <div className="border-b-2 border-slate-800 pb-2 mb-8 page-break-inside-avoid print:mt-0 mt-8">
                    <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">Rincian Hasil Inspeksi</h2>
                  </div>

                  <div className="space-y-8">
                    {surveys.map((survey: any, idx: number) => (
                      <div key={survey.id} className="page-break-inside-avoid border border-slate-800 bg-white">
                        
                        {/* Item Header */}
                        <div className="bg-slate-100 border-b border-slate-800 p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded-sm uppercase tracking-wider">{survey.areaName}</span>
                              <span className="text-[10px] font-bold text-slate-500">NO. {String(idx + 1).padStart(3, '0')}</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 leading-tight uppercase">{survey.itemName}</h3>
                          </div>
                          
                          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] uppercase font-bold text-slate-500">STATUS:</span>
                              <span className="text-xs font-bold text-slate-900 uppercase border border-slate-800 px-2 py-0.5 bg-white">
                                {survey.status.replace(/_/g, ' ')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] uppercase font-bold text-slate-500">PRIORITAS:</span>
                              <span className="text-[10px] font-bold text-slate-900 uppercase">
                                {survey.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Text Data Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 border-b border-slate-800">
                          <div className="p-4">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Kondisi Existing</p>
                            <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">{survey.existingCondition || '-'}</p>
                          </div>
                          <div className="p-4">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Observasi / Temuan</p>
                            <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">{survey.observation || '-'}</p>
                          </div>
                        </div>

                        {survey.recommendation && (
                          <div className="p-4 border-b border-slate-800 bg-slate-50">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-2">Rekomendasi Tindakan</p>
                            <p className="text-xs font-medium text-slate-900 whitespace-pre-wrap">
                              {survey.recommendation}
                            </p>
                          </div>
                        )}

                        {/* Checklists & Dynamic Data */}
                        {(survey.dynamicData?.length > 0 || survey.checklists?.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 border-b border-slate-800">
                            
                            {/* Checklists */}
                            <div className="p-4">
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-3">Item Pengecekan</p>
                              {survey.checklists?.length > 0 ? (
                                <table className="w-full text-xs">
                                  <tbody>
                                    {survey.checklists.map((c: any) => (
                                      <tr key={c.id || c.checklistId} className="border-b border-dashed border-slate-300 last:border-0">
                                        <td className="py-1.5 w-6">
                                          <div className={`w-3 h-3 border ${c.checked ? 'border-slate-800 bg-slate-800' : 'border-slate-400 bg-white'} flex items-center justify-center`}>
                                            {c.checked && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                          </div>
                                        </td>
                                        <td className="py-1.5 text-slate-800">{c.checklist?.name || c.name || 'Checklist Item'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-xs text-slate-400 italic">Tidak ada checklist.</p>
                              )}
                            </div>

                            {/* Dynamic Fields */}
                            <div className="p-4">
                              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-3">Data Teknis Tambahan</p>
                              {survey.dynamicData?.length > 0 ? (
                                <table className="w-full text-xs">
                                  <tbody>
                                    {survey.dynamicData.map((d: any) => (
                                      <tr key={d.id || d.fieldId} className="border-b border-dashed border-slate-300 last:border-0">
                                        <td className="py-1.5 text-slate-600 w-1/2 pr-2">{d.fieldName || 'Field'}</td>
                                        <td className="py-1.5 font-bold text-slate-900 w-1/2 break-words">{d.value || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              ) : (
                                <p className="text-xs text-slate-400 italic">Tidak ada data teknis tambahan.</p>
                              )}
                            </div>
                            
                          </div>
                        )}

                        {/* Photos & GPS */}
                        <div className="p-4">
                          <div className="flex justify-between items-end mb-3">
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Lampiran Visual</p>
                            {survey.gpsLat && survey.gpsLng && (
                              <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-sm border border-slate-300">
                                <MapPin className="w-3 h-3 text-slate-800" />
                                <span>{Number(survey.gpsLat).toFixed(6)}, {Number(survey.gpsLng).toFixed(6)}</span>
                              </div>
                            )}
                          </div>
                          
                          {survey.photos && survey.photos.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                              {survey.photos.map((photo: any, pidx: number) => (
                                <div key={photo.id || pidx} className="border-2 border-slate-200 bg-slate-50 p-1.5">
                                  <div className="aspect-[4/3] bg-slate-200 w-full mb-1.5 flex items-center justify-center overflow-hidden">
                                    <img src={photo.path} alt={`Dokumentasi ${pidx+1}`} className="w-full h-full object-contain" />
                                  </div>
                                  <p className="text-[8px] text-center text-slate-500 uppercase tracking-widest font-bold">Foto {pidx+1}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                              <p className="text-xs text-slate-400 italic">Tidak ada lampiran foto untuk item ini.</p>
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Summary & Signatures Section */}
                  <div className="mt-12 page-break-inside-avoid">
                    {/* Summary Footer */}
                    <div className="mb-12">
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b-2 border-slate-800 pb-2">Ringkasan Eksekutif</h3>
                      <table className="w-full sm:w-1/2 text-xs border border-slate-800">
                        <thead>
                          <tr className="bg-slate-100 border-b border-slate-800">
                            <th className="text-left px-4 py-2 font-bold text-slate-800 uppercase tracking-wider border-r border-slate-800">Status Kondisi</th>
                            <th className="text-right px-4 py-2 font-bold text-slate-800 uppercase tracking-wider">Jumlah Item</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(
                            surveys.reduce((acc: Record<string, number>, s: any) => {
                              acc[s.status] = (acc[s.status] || 0) + 1
                              return acc
                            }, {} as Record<string, number>)
                          ).map(([status, count]) => (
                            <tr key={status} className="border-b border-slate-300 last:border-slate-800">
                              <td className="px-4 py-2 text-slate-800 border-r border-slate-800 font-medium">{status.replace(/_/g, ' ')}</td>
                              <td className="px-4 py-2 text-right font-bold text-slate-900">{count as number}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-800 text-white font-bold">
                            <td className="px-4 py-2 border-r border-slate-600">TOTAL KESELURUHAN</td>
                            <td className="px-4 py-2 text-right">{surveys.length}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Signature Area */}
                    <div className="border border-slate-800 bg-white">
                      <div className="bg-slate-100 border-b border-slate-800 p-3 text-center">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Lembar Pengesahan</h3>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-800">
                        <div className="p-6 flex flex-col items-center justify-between min-h-[160px]">
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Dibuat Oleh,<br/>Surveyor Pelaksana</p>
                          <div className="w-48 text-center mt-20">
                            <p className="text-sm font-bold text-slate-900 border-b border-slate-800 pb-1 mb-1">{data.surveyor?.name || '______________________'}</p>
                            <p className="text-[10px] text-slate-500">Tgl: {new Date(data.createdAt).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                        <div className="p-6 flex flex-col items-center justify-between min-h-[160px]">
                          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Diperiksa Oleh,<br/>Supervisor / Manajer</p>
                          <div className="w-48 text-center mt-20">
                            <p className="text-sm font-bold text-slate-900 border-b border-slate-800 pb-1 mb-1">______________________</p>
                            <p className="text-[10px] text-slate-500">Tgl: __________________</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 12mm 15mm 20mm 15mm; }
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
