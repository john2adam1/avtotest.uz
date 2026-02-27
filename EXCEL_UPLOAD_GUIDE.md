# Excel orqali testlarni Supabase-ga yuklash bo'yicha qo'llanma

Ushbu qo'llanma sizga testlarni Excel fayli orqali qanday tayyorlash va Supabase bazasiga qanday yuklashni o'rgatadi.

## 1. Excel faylini tayyorlash

Excel yoki Google Sheets-da quyidagi ustunlardan iborat jadval yarating:

| Ustun nomi | Tavsif | Misol |
| :--- | :--- | :--- |
| **question** | Test savoli (Lotin) | Mazkur yo'l belgisi nimani bildiradi? |
| **question_cyrl** | Test savoli (Kirill) | Мазкур йўл белгиси нимани билдиради? |
| **answers** | Javoblar (Lotin massiv) | `{"Javob 1", "Javob 2", "Javob 3"}` |
| **answers_cyrl** | Javoblar (Kirill massiv) | `{"Жавоб 1", "Жавоб 2", "Жавоб 3"}` |
| **correct_answer** | To'g'ri javob indeksi | 0 |
| **image_url** | Rasm URL (Majburiy) | https://.../image.jpg |
| **category** | Mavzu nomi (Avtomatik bog'lanadi) | Yo'l belgilari |
| **time_limit** | Vaqt (sekundlarda) | 300 |
| **audio_url** | Audio (Lotin, Ixtiyoriy) | https://.../lo.mp3 |
| **audio_url_cyrl** | Audio (Kirill, Ixtiyoriy) | https://.../cy.mp3 |
| **explanation_text** | Tushuntirish matni (Lotin, Ixtiyoriy) | Bu belgi... |
| **explanation_text_cyrl** | Tushuntirish matni (Kirill, Ixtiyoriy) | Бу белги... |

> [!IMPORTANT]
> - **answers** va **answers_cyrl** massivlari bir xil sondagi elementlarga ega bo'lishi shart.
> - **explanation** (izoh) va **audio** ustunlari ixtiyoriy. Agar ma'lumot bo'lmasa, ustunni bo'sh qoldiring.

> [!TIP]
> **Mavzular haqida:** Siz CSV faylida `topic_id` yozishingiz shart emas. Shunchaki `category` ustuniga mavzu nomini yozing. Tizim avtomatik ravishda ushbu nomli mavzuni topadi va testni unga bog'laydi. Agar bunday mavzu hali mavjud bo'lmasa, u avtomatik yaratiladi.

## 2. Faylni CSV formatida saqlash

Excel faylingizni **CSV (Comma delimited)** formatida saqlang. Supabase CSV formatini juda yaxshi qo'llab-quvvatlaydi.

## 3. Supabase-ga yuklash (Qayerga va Qanday?)

Testlarni bazaga yuklash uchun quyidagi aniq qadamlarni bajaring:

1. **Supabase Dashboard**-ga kiring: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Loyihangizni tanlang.
3. Chap tarafdagi yon menyudan **Table Editor** (jadval belgisi 🗄️) bo'limini tanlang.
4. Jadvallar ro'yxatidan **tests** jadvalini qidirib toping va ustiga bosing.
5. Jadval ochilgandan so'ng, yuqori o'ng burchakda **Insert** tugmasini bosing va ochilgan menyudan **Import data from CSV**-ni tanlang.
6. Kompyuteringizdagi tayyorlangan `.csv` faylini tanlang.
7. **Import configuration** oynasida:
   - "Column mapping" qismida Excel-dagi ustunlar bazadagi ustunlarga mos kelishini tekshiring.
   - Barchasi to'g'ri bo'lsa, pastdagi **Import Data** tugmasini bosing.

> [!TIP]
> Agar bazada allaqachon mavjud bo'lgan testlarni o'chirishni xohlasangiz, yuklashdan oldin jadvaldagi barcha qatorlarni tanlab "Delete" qilib yuborishingiz mumkin.

## 4. Javoblar formatini tekshirish

`answers` ustunidagi ma'lumotlar quyidagi ko'rinishda bo'lishi shart:
`{"Javob 1", "Javob 2", "Javob 3", "Javob 4"}`

- Massiv har doim jingalak qavs `{}` bilan boshlanib tugashi kerak.
- Har bir javob qo'shnoqtich `"` ichida bo'lishi kerak.
- Javoblar bir-biridan vergul `,` bilan ajratilishi kerak.

## 5. Testlarni biletlarga avtomatik bo'lish

Agar sizda 1000 dan ortiq test bo'lsa va ularni qo'lda biletlarga bo'lish qiyin bo'lsa, bazadagi maxsus funksiyadan foydalanishingiz mumkin:

1. Supabase **SQL Editor** bo'limiga kiring.
2. Yangi so'rov (New Query) oching.
3. Quyidagi kodni yozing va **Run** tugmasini bosing:
   ```sql
   SELECT divide_tests_into_tickets(20);
   ```
   *Bu erda `20` - bitta biletda nechta savol bo'lishini bildiradi.*

4. Funksiya avtomatik ravishda yangi biletlar yaratadi va hali biletga biriktirilmagan barcha testlarni ushbu biletlarga 20 tadan qilib taqsimlab chiqadi.
