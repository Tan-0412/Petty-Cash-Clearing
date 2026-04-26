# 📋 ใบเคลียร์เงินยืมทดรอง — PWA

ระบบฟอร์มใบเคลียร์เงินยืมทดรอง รองรับ PWA (ติดตั้งบนมือถือ), พิมพ์, ส่งออก PDF, และบันทึกลง Google Sheet

---

## 🚀 วิธี Deploy บน GitHub Pages

### 1. สร้าง Repository บน GitHub
```
ชื่อ repo: petty-cash-form (หรือชื่อใดก็ได้)
ตั้งเป็น Public
```

### 2. อัปโหลดไฟล์เหล่านี้
```
index.html
sw.js
manifest.json
icon-192.png
icon-512.png
README.md
```

### 3. เปิด GitHub Pages
- Settings → Pages
- Source: **Deploy from a branch**
- Branch: **main** / **(root)**
- Save

URL ของคุณจะเป็น: `https://[username].github.io/[repo-name]/`

---

## 🔗 เชื่อม Google Sheet

### Google Sheet ที่สร้างไว้:
https://docs.google.com/spreadsheets/d/1FP0A53UPuawzb9GQM1D4OABhy0dXSvF3nignIMyEXtk/edit

---

## ⚙️ ตั้งค่า Google Apps Script (สำหรับบันทึกข้อมูลอัตโนมัติ)

### ขั้นตอนที่ 1: เปิด Apps Script
1. เปิด Google Sheet ด้านบน
2. ไปที่ **Extensions → Apps Script**
3. ลบโค้ดเดิม วางโค้ดนี้:

```javascript
const SHEET_NAME = 'ใบเคลียร์เงินยืมทดรอง';

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      const headers = ['Timestamp','บริษัท','ชื่อผู้เบิก','วันที่ยื่น','วันที่ได้รับเงิน',
        'วัตถุประสงค์','ยอดเงินยืม (฿)','ลำดับ','วันที่รายการ','รายการ',
        'เลขที่ใบเสร็จ','จำนวนเงิน (฿)','รวมค่าใช้จ่าย (฿)','คืน (฿)','จ่ายเพิ่ม (฿)'];
      const hRange = sheet.getRange(1,1,1,headers.length);
      hRange.setValues([headers]);
      hRange.setBackground('#3d5a3e').setFontColor('white').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const d = JSON.parse(e.parameter.data);
    const ts = new Date().toLocaleString('th-TH',{timeZone:'Asia/Bangkok'});
    const rows = d.items.map(item => [
      ts, d.company, d.empName, d.submitDate, d.loanDate||'', d.purpose,
      d.loanAmount, item.no, item.date||'', item.desc||'', item.receipt||'',
      item.amount, d.totalExpense,
      d.diff >= 0 ? d.diff : 0,
      d.diff < 0 ? Math.abs(d.diff) : 0
    ]);

    if (rows.length > 0) {
      const lr = sheet.getLastRow();
      sheet.getRange(lr+1, 1, rows.length, rows[0].length).setValues(rows);
      [7,12,13,14,15].forEach(c =>
        sheet.getRange(lr+1, c, rows.length).setNumberFormat('#,##0.00'));
    }

    return ContentService
      .createTextOutput(JSON.stringify({success:true}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({success:false,error:err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({status:'ok',time:new Date().toISOString()}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### ขั้นตอนที่ 2: Deploy
1. **Deploy → New deployment**
2. Type: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone**
5. **Deploy** → คัดลอก URL

### ขั้นตอนที่ 3: ใส่ URL ในแอป
เปิดแอปบน GitHub Pages → กด F12 → Console → พิมพ์:
```javascript
localStorage.setItem('gscript_url', 'วาง_URL_ที่นี่');
location.reload();
```

---

## 📱 ติดตั้งเป็นแอปบนมือถือ

### Android (Chrome)
- เปิดเว็บในแอป Chrome
- จะมี Banner "ติดตั้งแอป" ปรากฏด้านบน → กด **ติดตั้ง**
- หรือ Menu (⋮) → **Add to Home screen**

### iOS (Safari)
- เปิดเว็บใน Safari
- กด Share (□↑) → **Add to Home Screen**
- กด **Add**

---

## 🖨️ พิมพ์ / ส่งออก PDF
- กดปุ่ม 🖨 **พิมพ์** หรือ 📄 **PDF** ใน toolbar
- เลือก **Save as PDF** ในหน้าต่างพิมพ์

---

## 📁 โครงสร้างไฟล์
```
/
├── index.html      ← หน้าหลัก (แบบฟอร์ม)
├── sw.js           ← Service Worker (PWA offline)
├── manifest.json   ← PWA Manifest
├── icon-192.png    ← App icon 192x192
├── icon-512.png    ← App icon 512x512
└── README.md       ← คู่มือนี้
```
