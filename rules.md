# HYDANT Survey & Inspection Platform

## Project Overview

HYDANT Survey & Inspection Platform adalah aplikasi web berbasis Progressive Web App (PWA) yang digunakan untuk melakukan survey, inspeksi, dokumentasi, asset inspection, preventive maintenance, commissioning, dan pembuatan laporan secara digital.

Aplikasi harus bersifat **Dynamic**, sehingga pengguna tidak perlu melakukan perubahan source code ketika ingin membuat jenis survey baru.

Seluruh jenis survey dibuat melalui halaman Admin menggunakan Dynamic Form Builder.

Target utama aplikasi adalah penggunaan di lapangan menggunakan smartphone Android maupun iPhone, namun tetap optimal digunakan pada desktop.

---

# Project Vision

Aplikasi ini bukan hanya aplikasi checklist, tetapi menjadi platform digital yang mampu mengelola:

* Survey
* Inspection
* Asset Management
* Documentation
* Work Order
* Approval
* Reporting

Platform dapat digunakan untuk:

* Water Treatment Plant (WTP)
* Waste Water Treatment Plant (WWTP)
* Grounding Inspection
* Fire Alarm Inspection
* Power Meter Inspection
* Instrument Inspection
* Preventive Maintenance
* Corrective Maintenance
* Commissioning
* FAT
* SAT
* Site Survey
* Asset Inventory
* IoT Installation
* Smart Monitoring

Semuanya cukup dengan membuat Template Survey baru tanpa mengubah source code.

---

# User Role

## Admin

Memiliki akses penuh terhadap sistem.

Fitur:

* Kelola User
* Kelola Role
* Kelola Template Survey
* Kelola Dynamic Form
* Kelola Asset
* Kelola Client
* Kelola Project
* Kelola Laporan
* Dashboard
* Analytics

---

## Surveyor

Fitur:

* Membuat Survey
* Mengisi Form
* Mengambil Foto
* Scan QR Asset
* Upload Dokumen
* Generate PDF

---

## Supervisor

Fitur:

* Review Survey
* Approval
* Memberikan Komentar
* Reject
* Approve

---

# Struktur Sistem

Hierarki aplikasi:

Project

↓

Area

↓

Item Survey

↓

Checklist

↓

Existing Condition

↓

Photo

↓

GPS

↓

Catatan

↓

Recommendation

↓

Complete

↓

Generate Report

---

# Contoh Implementasi

Template Survey:

Survey Pemasangan Sensor HYDANT

Project:

Survey Pemasangan Sensor HYDANT - Bunyut

Area:

* Area Port
* Fuel Station Warehouse
* WTP
* Camp
* Office

Area Port

Item:

* Grounding Area Jetty
* Grounding Fuel Tank
* Grounding Fuel Station

WTP

Item:

* Monitoring Flow Meter
* Monitoring Dosing Pump
* Monitoring Power Meter
* Monitoring TSS
* Monitoring PH
* Monitoring Kimia
* Monitoring Tekanan Air
* Monitoring Backwash Valve

Camp

Item:

* Power Meter
* Grounding
* Fire Alarm
* Sensor Manusia

Office

Item:

* Grounding
* Fire Alarm

Template dapat diubah dari halaman Admin tanpa coding.

---

# Alur Penggunaan

## 1. Admin Membuat Template Survey

Admin menentukan:

* Nama Template
* Area
* Item Survey
* Checklist
* Dynamic Form
* Required Field

Template dapat digunakan berkali-kali.

---

## 2. Surveyor Membuat Project Baru

Mengisi:

* Nama Project
* Client
* Lokasi
* Site
* Tanggal
* Surveyor

Klik:

Mulai Survey

---

## 3. Survey Dimulai

Aplikasi otomatis menampilkan seluruh Area.

Contoh:

Area Port

* Grounding Jetty
* Grounding Fuel Tank
* Grounding Fuel Station

User cukup memilih item yang ingin dikerjakan.

---

## 4. Mengisi Detail Item

Setiap Item memiliki form standar.

### Informasi

* Nama Item
* Status
* Priority
* Lokasi
* GPS

### Existing Condition

Textarea.

### Observation

Textarea.

### Recommendation

Textarea.

### Material Existing

Textarea.

### Estimasi Material

Textarea.

### Estimasi Pekerjaan

Textarea.

### Checklist

Checkbox dinamis.

### Dynamic Form

Field tambahan dari Admin.

---

# Status Item

Pilihan:

* Existing
* Tidak Ada
* Rusak
* Perlu Perbaikan
* Perlu Penggantian
* Perlu Instalasi
* Selesai

---

# Priority

* Low
* Medium
* High
* Critical

---

# Checklist

Admin dapat membuat checklist.

Contoh Grounding:

* Ground Rod
* Ground Cable
* Inspection Pit
* Earth Resistance Test
* Label

Checklist berbeda untuk setiap template.

---

# Dokumentasi Foto

Setiap item dapat memiliki banyak foto.

Kategori:

* Existing
* Before
* During
* After
* Detail
* Panel
* Nameplate
* Wiring
* Installation
* Testing

Foto dapat:

* Zoom
* Rotate
* Crop
* Annotation
* Caption

---

# Kamera HP

Menggunakan kamera perangkat secara langsung.

Setelah foto diambil otomatis diberikan watermark.

Isi watermark:

* Nama Project
* Area
* Item
* Surveyor
* Latitude
* Longitude
* Tanggal
* Jam
* Device
* GPS Accuracy

---

# GPS

Saat survey dimulai aplikasi meminta izin lokasi.

Data yang disimpan:

* Latitude
* Longitude
* Accuracy
* Timestamp

---

# Attachment

Selain foto mendukung upload:

* PDF
* Excel
* Word
* DWG
* ZIP

---

# Auto Save

Semua perubahan langsung tersimpan.

Tidak memerlukan tombol Save.

---

# Draft

Survey dapat dihentikan.

Dilanjutkan kapan saja.

---

# Offline Mode

Survey tetap berjalan walaupun internet terputus.

Data disimpan di perangkat.

Saat online kembali otomatis sinkronisasi.

---

# PWA

Aplikasi wajib mendukung:

* Install ke Home Screen
* Fullscreen
* Offline Cache
* Background Sync

Harus terasa seperti aplikasi Android native.

---

# Dashboard

Menampilkan:

* Total Project
* Total Survey
* Progress
* Pending
* Completed
* Asset Bermasalah
* Grafik

---

# Map

Seluruh titik survey ditampilkan pada peta.

Marker:

Hijau

Kuning

Merah

Abu

Klik marker membuka detail survey.

---

# Asset Management

Survey dapat dikaitkan dengan Asset.

Contoh:

* Flow Meter
* Pump
* Motor
* Generator
* PLC
* Panel
* Grounding
* Fire Alarm
* Valve
* Tank
* Sensor

---

# QR Asset

Setiap Asset memiliki QR Code.

Scan QR:

↓

Membuka Detail Asset

↓

Riwayat Survey

↓

Riwayat Maintenance

↓

Dokumen

↓

Foto

---

# Workflow

Draft

↓

Survey

↓

Supervisor Review

↓

Revision

↓

Approved

↓

Closed

---

# Comment

Supervisor dapat memberikan komentar pada setiap item.

Surveyor dapat membalas komentar.

---

# Revision History

Menyimpan:

* User
* Waktu
* Perubahan

---

# Notification

Mendukung:

* Email
* WhatsApp
* Telegram
* Push Notification

---

# Export

Mendukung:

* PDF
* Excel
* CSV
* JSON

---

# PDF Report

Laporan harus memiliki desain profesional.

Isi:

Cover

↓

Informasi Project

↓

Daftar Isi

↓

Area

↓

Item Survey

↓

Checklist

↓

Existing

↓

Catatan

↓

Rekomendasi

↓

Foto

↓

Kesimpulan

↓

Digital Signature

↓

QR Verification

Header:

* Logo
* Judul
* Nomor Dokumen

Footer:

* Page Number
* Generate Time
* Company Name

---

# Digital Signature

Mendukung tanda tangan:

* Surveyor
* Supervisor
* Client
* Manager

---

# QR Verification

Setiap PDF memiliki QR Code yang mengarah ke halaman verifikasi online.

---

# Dynamic Form Builder

Admin dapat membuat:

* Text
* Number
* Currency
* Dropdown
* Multi Select
* Checkbox
* Radio
* Date
* Time
* GPS
* Camera
* Signature
* File
* QR Scanner
* Barcode Scanner
* Rating
* Toggle
* Textarea

Tanpa coding.

---

# Conditional Logic

Field dapat muncul berdasarkan jawaban sebelumnya.

Contoh:

Apakah Grounding tersedia?

Ya

↓

Munculkan nilai tahanan grounding.

Tidak

↓

Munculkan alasan.

---

# Repeatable Section

User dapat menambah data tanpa batas.

Contoh:

* Tambah Sensor
* Tambah Panel
* Tambah Valve
* Tambah Pompa
* Tambah Foto

---

# Security

* Login
* JWT Authentication
* HTTPS
* Audit Log
* Role Permission

---

# Technology Stack

Frontend:

* Next.js
* TypeScript
* Tailwind CSS
* PWA

Backend:

* Laravel API atau Next.js API

Database:

* MySQL

Storage:

* Local Storage
* S3 Compatible Storage

---

# Future Development

* AI Ringkasan Survey
* OCR Nameplate
* AI Deteksi Kerusakan Foto
* Estimasi Material
* Estimasi Biaya
* Work Order Management
* Preventive Maintenance Scheduler
* IoT Integration
* MQTT
* Modbus
* LoRaWAN
* PLC
* SCADA
* ERP Integration

---

# UI/UX

Desain harus modern, ringan, profesional, dan mobile-first.

Karakteristik:

* Responsive
* Touch Friendly
* Bottom Navigation pada Mobile
* Dark Mode
* Fast Loading
* Minimal Click
* Mudah digunakan saat survey di lapangan dengan satu tangan

---

# Success Criteria

Aplikasi mampu menjadi platform inspeksi universal yang dapat digunakan oleh seluruh divisi perusahaan hanya dengan membuat Template Survey baru melalui halaman Admin, tanpa melakukan perubahan pada source code. Setiap survey dapat didokumentasikan secara lengkap, menghasilkan laporan PDF profesional, mendukung penggunaan offline, serta dapat dikembangkan menjadi platform Asset Management, Work Order, dan Smart Inspection di masa depan.
