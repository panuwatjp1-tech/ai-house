# ขั้นตอนมาตรฐาน: คลิปเสร็จ → โพสต์ผ่าน Metricool

ทดสอบผ่านแล้ว 14 พ.ย. 2569 ทำแบบนี้ทุกครั้ง ไม่เปลี่ยนวิธี

1. คลิปเสร็จ (mp4 แนวตั้ง 1080x1920 มีลายน้ำ "ภนว | AI Guide") วางไว้ที่ `clips/<ช่อง>/<YYYY-MM-DD>-<ชื่อสั้น>.mp4`
   - ช่อง: `herpick` / `main` / `test`
2. `git add` → `commit` → `git -c push.negotiate=true push origin main`
3. ลิงก์สาธารณะ: `https://raw.githubusercontent.com/panuwatjp1-tech/ai-house/main/clips/<ช่อง>/<ไฟล์>.mp4` (เช็กด้วย `curl -sI` ต้องได้ 200)
4. **ส่งคลิป + แคปชันให้เจ้าของบ้านดูก่อนทุกครั้ง** รอคำว่าอนุมัติ
5. หลังอนุมัติ: Metricool `createScheduledPost`
   - Her Pick blogId `7962396` timezone `Asia/Bangkok`
   - `media`: ลิงก์ข้อ 3 (Metricool ดึงไฟล์ไปเก็บเองอัตโนมัติ)
   - `tiktokData.title` **ต้องใส่** ไม่งั้น error "TikTok title is required"
   - `isAigc: true`, `privacyOption: PUBLIC_TO_EVERYONE`, `draft: false`, `autoPublish: true`
6. รายงานลิงก์ `plannerUrl` กลับให้เจ้าของบ้าน
