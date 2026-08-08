# Panduan Lengkap Deployment EzSurvey (Next.js + MySQL + Apache2 + Cloudflare Tunnel)

Panduan ini berisi langkah-langkah komprehensif untuk mendeploy aplikasi Next.js (EzSurvey) ke cloud server (berbasis Ubuntu/Debian) menggunakan Apache2 sebagai reverse proxy, MySQL sebagai database, dan Cloudflare Tunnel untuk mengekspos aplikasi ke internet secara aman.

## 1. Persiapan Server

Pastikan server Anda sudah diupdate.
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js dan npm
Aplikasi Next.js membutuhkan Node.js. (Gunakan versi 20.x atau sesuai dengan requirement)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install PM2
PM2 digunakan untuk menjaga aplikasi Next.js tetap berjalan di latar belakang (background).
```bash
sudo npm install -g pm2
```

### Install MySQL Server
```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

### Install Apache2
```bash
sudo apt install -y apache2
```
Aktifkan modul-modul proxy di Apache:
```bash
sudo a2enmod proxy proxy_http headers rewrite
sudo systemctl restart apache2
```

## 2. Setup Database MySQL

Masuk ke console MySQL:
```bash
sudo mysql -u root -p
```
Jalankan perintah berikut untuk membuat database dan user:
```sql
CREATE DATABASE ezsurvey;
CREATE USER 'ezsurvey_user'@'localhost' IDENTIFIED BY 'PasswordKuatAnda123!';
GRANT ALL PRIVILEGES ON ezsurvey.* TO 'ezsurvey_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## 3. Setup Aplikasi

Upload file project Anda ke server (misal diletakkan di `/var/www/ezsurvey`). Anda bisa menggunakan Git clone, SFTP, atau SCP.

Masuk ke direktori aplikasi:
```bash
cd /var/www/ezsurvey
```

Install semua dependency:
```bash
npm install
```

## 4. Konfigurasi Environment Variables (.env)

Buat atau edit file `.env` di dalam folder project:
```bash
nano .env
```
Isi dengan konfigurasi berikut (sesuaikan dengan database Anda):
```env
# Koneksi Database
DATABASE_URL="mysql://ezsurvey_user:PasswordKuatAnda123!@localhost:3306/ezsurvey"

# NextAuth Configuration
NEXTAUTH_SECRET="buat_secret_key_acak_yang_panjang_dan_aman_disini"
# Ganti dengan domain/URL publik Anda nanti
NEXTAUTH_URL="https://domain-anda.com" 
```

## 5. Build dan Migrasi Database

Jalankan perintah Prisma untuk sinkronisasi schema database:
```bash
npx prisma generate
npx prisma db push 
```

Jalankan seeder database (opsional, jika ada data awal). Karena di package.json Anda menggunakan tsx, jalankan:
```bash
npx tsx prisma/seed.ts
```

Build aplikasi Next.js untuk production:
```bash
npm run build
```

## 6. Menjalankan Aplikasi dengan PM2

Jalankan aplikasi Next.js (secara default akan berjalan di port 3000):
```bash
pm2 start npm --name "ezsurvey" -- run start
```
Untuk memastikan aplikasi berjalan otomatis saat server di-restart (reboot):
```bash
pm2 startup
# Jalankan perintah yang dihasilkan oleh pm2 startup, kemudian jalankan:
pm2 save
```

## 7. Konfigurasi Apache2 sebagai Reverse Proxy

Buat file konfigurasi virtual host baru:
```bash
sudo nano /etc/apache2/sites-available/ezsurvey.conf
```
Isi dengan konfigurasi berikut:
```apache
<VirtualHost *:80>
    ServerName domain-anda.com
    
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    ErrorLog ${APACHE_LOG_DIR}/ezsurvey_error.log
    CustomLog ${APACHE_LOG_DIR}/ezsurvey_access.log combined
</VirtualHost>
```

Aktifkan konfigurasi dan restart Apache:
```bash
sudo a2ensite ezsurvey.conf
sudo systemctl restart apache2
```

## 8. Setup Cloudflare Tunnel

Karena Anda menggunakan Cloudflare Tunnel, Anda tidak perlu membuka port 80/443 di firewall server Anda dan tidak perlu mengatur SSL/TLS di Apache (Cloudflare yang akan menanganinya secara otomatis dari sisi publik).

1. Login ke **Cloudflare Zero Trust Dashboard**.
2. Masuk ke **Networks > Tunnels** dan klik **Create a tunnel**.
3. Pilih **Cloudflared** dan berikan nama tunnel (misal: `ezsurvey-tunnel`).
4. Pilih environment server Anda (Linux -> Debian/Ubuntu) dan copy perintah instalasi yang diberikan, lalu jalankan di server cloud Anda. Contoh perintah instalasi dari Cloudflare:
   ```bash
   curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared.deb
   sudo cloudflared service install [TOKEN_ANDA]
   ```
5. Setelah tunnel terhubung (status Healthy), kembali ke Dashboard Cloudflare, dan buat **Public Hostname**.
6. Konfigurasi Public Hostname:
   - **Subdomain/Domain**: `domain-anda.com` (Sesuai dengan domain yang Anda gunakan)
   - **Service Type**: `HTTP`
   - **URL**: `localhost:80` (Ini akan mengarahkan traffic ke Apache2 port 80, yang kemudian akan di-proxy oleh Apache ke Next.js di port 3000). 
   - *(Alternatif: Anda juga bisa langsung mengisi URL dengan `localhost:3000` jika ingin memotong jalur Apache, namun karena Anda menggunakan Apache2, arahkan saja ke `localhost:80`)*.

Klik **Save**. Sekarang aplikasi EzSurvey Anda sudah bisa diakses melalui domain Anda secara aman dengan koneksi HTTPS dari Cloudflare!
