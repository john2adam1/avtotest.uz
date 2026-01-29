import csv
import json

data = [
  {
    "question": "Ushbu vaziyatda oxirgi bo‘lib kim o‘tadi?",
    "question_cyrl": "Ушбу вазиятда охирги бўлиб ким ўтади?",
    "answers": ["Qizil avtomobil", "Ko‘k avtomobil", "O‘zaro kelishib o‘tadilar", "Oq avtomobil"],
    "answers_cyrl": ["Қизил автомобил", "Кўк автомобил", "Ўзаро келишиб ўтадилар", "Оқ автомобил"],
    "correct_answer": 0,
    "image_url": "https://ptest.uz/images/41ebbee9-c51c-47f8-875d-9eaf16458d3a.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Ushbu yo‘l belgisi qanday nomlanadi?",
    "question_cyrl": "Ушбу йўл белгиси қандай номланади?",
    "answers": ["Shanba, yakshanba va bayram kunlari", "Hafta kunlari", "Ish kunlari"],
    "answers_cyrl": ["Шанба, якшанба ва байрам кунлари", "Ҳафта кунлари", "Иш кунлари"],
    "correct_answer": 0,
    "image_url": "https://ptest.uz/images/ab1188bb-3caf-49b9-9398-14209c56da25.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Belgilangan yo‘nalishlarda harakatlanishga ruxsat etiladimi?",
    "question_cyrl": "Белгиланган йўналишларда ҳаракатланишга рухсат этиладими?",
    "answers": ["Faqat o‘ngga ruxsat etiladi", "Faqat chapga ruxsat etiladi", "Har ikkisiga ruxsat etiladi"],
    "answers_cyrl": ["Фақат ўнгга рухсат этилади", "Фақат чапга рухсат этилади", "Ҳар иккисига рухсат этилади"],
    "correct_answer": 2,
    "image_url": "https://ptest.uz/images/7f8e5e60-18ad-46d8-9927-85ba106331c8.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Transport vositasi haydovchisi tomonidan chiqarilgan havotadi etanol bug'lari kontsentrasiyasi qancha miqdorni ko'rsatgan hollarda DYHXX xodimi haydovchiga nisbatan alkogolli ichimlik este'mol qilganligi fakti yuzasidan ma'muriy bayonnoma rasmiylashtiradi",
    "question_cyrl": "Транспорт воситаси ҳайдовчиси томонидан чиқарилган ҳавотади этанол буғлари контсентрасияси қанча миқдорни кўрсатган ҳолларда ДЙҲХХ ходими ҳайдовчига нисбатан алкоголли ичимлик эстеъмол қилганлиги факти юзасидан маъмурий баённома расмийлаштиради",
    "answers": ["Puflangan havoning bir litrida 0,105 milligramm va undan yuqori bo'lgan hallorda", "Puflangan havoning bir litrida 0,135 milligramm va undan yuqori bo'lgan hallorda", "Puflangan havoning bir litrida 0,255 milligramm va undan yuqori bo'lgan hallorda"],
    "answers_cyrl": ["Пуфланган ҳавонинг бир литрида 0,105 миллиграмм ва ундан юқори бўлган ҳаллорда", "Пуфланган ҳавонинг бир литрида 0,135 миллиграмм ва ундан юқори бўлган ҳаллорда", "Пуфланган ҳавонинг бир литрида 0,255 миллиграмм ва ундан юқори бўлган ҳаллорда"],
    "correct_answer": 1,
    "image_url": "https://ptest.uz/images/046f48a9-c5f4-4b7a-9a3a-214dfdfa93b1.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Ushbu qora transport vositasining haydovchisi yo'nalishni o'zgartirish qanday nomlanadi?",
    "question_cyrl": "Ушбу қора транспорт воситасининг ҳайдовчиси йўналишни ўзгартириш қандай номланади?",
    "answers": ["Manyovr qilish", "Bo'laklar sonini o'zgartish", "Hafli harakatlanish", "Avariya holat keltirish", "Barcha javoblar to'gri"],
    "answers_cyrl": ["Манёвр қилиш", "Бўлаклар сонини ўзгартиш", "Ҳафли ҳаракатланиш", "Авария ҳолатини келтириш", "Барча жавоблар тўгри"],
    "correct_answer": 3,
    "image_url": "https://ptest.uz/images/c6887865-9975-42d2-ac01-c4836f2bbe59.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Harakatlanish tartibini ko‘rsating:",
    "question_cyrl": "Ҳаракатланиш тартибини кўрсатинг:",
    "answers": ["1-tramvay sariq avtomobil bilan bir vaqtda, 2-tramvay qora avtomobil bilan bir vaqtda", "1-tramvay sariq avtomobil bilan bir vaqtda, qora avtomobil, 2-tramvay", "1-tramvay, 2-tramvay, sariq avtomobil, qora avtomobil"],
    "answers_cyrl": ["1-трамвай сариқ автомобил билан бир вақтда, 2-трамвай қора автомобил билан бир вақтда", "1-трамвай сариқ автомобил билан бир вақтда, қора автомобил, 2-трамвай", "1-трамвай, 2-трамвай, сариқ автомобил, қора автомобил"],
    "correct_answer": 0,
    "image_url": "https://ptest.uz/images/1a3b1e1f-2279-4c9c-a2cd-b4dfe6c0d2eb.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Ko‘k avtomobil haydovchisiga avtoturargohga kirishga ruxsat etiladimi?",
    "question_cyrl": "Кўк автомобил ҳайдовчисига автотураргоҳга киришга рухсат этиладими?",
    "answers": ["Ruxsat etiladi", "Taqiqlanadi"],
    "answers_cyrl": ["Рухсат этилади", "Тақиқланади"],
    "correct_answer": 1,
    "image_url": "https://ptest.uz/images/3a4ecc31-d56f-425d-b362-9b09fb58c2cf.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Ko'rsatilgan yo'l belgilarining qaysi birida eng kam tezlikda harakatlanish kerak ?",
    "question_cyrl": "Кўрсатилган йўл белгиларининг қайси бирида энг кам тезликда ҳаракатланиш керак ?",
    "answers": ["Chapdagi belgida", "O'ngdagi belgida", "Har ikkisida"],
    "answers_cyrl": ["Чапдаги белгида", "Ўнгдаги белгида", "Ҳар иккисида"],
    "correct_answer": 1,
    "image_url": "https://ptest.uz/images/39a57172-587a-45c2-939c-9f08205cb544.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Ushbu yo'l belgisi chorahalarda o'nga burilayotgan relezsiz transport voisitalariga svetaforning qaysi ishorasida harakatlanishga ruhsat etiladi ?",
    "question_cyrl": "Ушбу йўл белгиси чораҳаларда ўнга бурилаётган релезсиз транспорт воиситаларига светафорнинг қайси ишорасида ҳаракатланишга руҳсат этилади ?",
    "answers": ["Qizil ishora", "Sariq ishora", "Yashil ishora", "Ko'rsatilgan barchasi"],
    "answers_cyrl": ["Қизил ишора", "Сариқ ишора", "Яшил ишора", "Кўрсатилган барчаси"],
    "correct_answer": 3,
    "image_url": "https://ptest.uz/images/14bdb389-59ce-45b8-943b-5725968571e0.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Aholi punktlarida quvib o‘tishda qanday ogohlantirish ishoralaridan foydalanish mumkin?",
    "question_cyrl": "Аҳоли пунктларида қувиб ўтишда қандай огоҳлантириш ишораларидан фойдаланиш мумкин?",
    "answers": ["Faralarning uzoqni yorituvchi chiroqlaridan", "Tovushli ishoralardan", "1 va 2"],
    "answers_cyrl": ["Фараларнинг узоқни ёритувчи чироқларидан", "Товушли ишоралардан", "1 ва 2"],
    "correct_answer": 0,
    "image_url": "https://ptest.uz/images/empty_placeholder.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Ko‘k avtomobil haydovchisi qaysi yo‘nalishlarda harakatlanishga ruxsat etilmaydi?",
    "question_cyrl": "Кўк автомобил ҳайдовчиси қайси йўналишларда ҳаракатланишга рухсат этилмайди?",
    "answers": ["Faqat 1", "Faqat 2", "Faqat 1, 3, 4 yo‘nalishlarda", "Barcha yo‘nalishlarda"],
    "answers_cyrl": ["Фақат 1", "Фақат 2", "Фақат 1, 3, 4 йўналишларда", "Барча йўналишларда"],
    "correct_answer": 2,
    "image_url": "https://ptest.uz/images/d9b171b3-94d9-40dc-b0bf-cb4cc33da5a5.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Qaysi yo‘nalish bo‘yicha harakatlanishga ruxsat berilgan?",
    "question_cyrl": "Қайси йўналиш бўйича ҳаракатланишга рухsat berilgan?",
    "answers": ["Faqat \"A\"", "Faqat \"B\"", "Har ikki yo‘nalishda mumkin", "Har ikki yo‘nalishda taqiqlanadi"],
    "answers_cyrl": ["Фақат «А»", "Фақат «B»", "Ҳар икки йўналишда мумкин", "Ҳар икки йўналишда тақиқланади"],
    "correct_answer": 1,
    "image_url": "https://ptest.uz/images/21539512-5ed8-4f58-a5a7-c62dc47bbb92.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Piyodalarga qatnov qismidan kesib o'tishga ruxsat etiladimi ?",
    "question_cyrl": "Пиёдаларга қатнов қисмидан кесиб ўтишга рухсат этиладими ?",
    "answers": ["Ruxsat etiladi", "Taqiqlanadi", "Barcha holatda ruxsat etiladi"],
    "answers_cyrl": ["Рухсат этилади", "Тақиқланади", "Барча ҳолатда рухсат этилади"],
    "correct_answer": 1,
    "image_url": "https://ptest.uz/images/4e5e3eff-0007-46be-ace0-4f461544cd40.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Ushbu yo'l belgisi chorahalarda o'nga burilayotgan relezsiz transport voisitalariga svetaforning qaysi ishorasida harakatlanishga ruhsat etiladi ?",
    "question_cyrl": "Ушбу йўл белгиси чораҳаларда ўнга бурилаётган релезсиз транспорт воиситаларига светафорнинг қайси ишорасида ҳаракатланишга руҳсат этилади ?",
    "answers": ["Qizil ishora", "Sariq ishora", "Yashil ishora", "Ko'rsatilgan bachasi"],
    "answers_cyrl": ["Қизил ишора", "Сариқ ишора", "Яшил ишора", "Кўрсатилган бачаси"],
    "correct_answer": 3,
    "image_url": "https://ptest.uz/images/f130801f-fbb7-4dbe-a22c-94ca987fad8c.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Avtomobilda bolalarni himoya qilish tizimini joylashtirish uchun qaysi joy eng xavfsiz hisoblanadi?",
    "question_cyrl": "Автомобилда болаларни ҳимоя қилиш тизимини жойлаштириш учун қайси жой энг хавфсиз ҳисобланади?",
    "answers": ["Orqa o'rta o'rindiq", "Oldi o'rindiq", "Haydovchi orqasidagi o'rindiq"],
    "answers_cyrl": ["Орқа ўрта ўриндиқ", "Олди ўриндиқ", "Ҳайдовчи орқасидаги ўриндиқ"],
    "correct_answer": 0,
    "image_url": "https://ptest.uz/images/b5629abb-d171-408f-a08c-58ed3ff442d0.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Ushbu belgi qaysi moddalarga kiradi?",
    "question_cyrl": "Ушбу белги қайси моддаларга киради?",
    "answers": ["Toksik moddalar", "Organik peroksidlar", "Oksidlovchi moddalar"],
    "answers_cyrl": ["Токсик моддалар", "Органик пероксидлар", "Оксидловчи моддалар"],
    "correct_answer": 2,
    "image_url": "https://ptest.uz/images/f7aef5cd-cab6-4dcd-a82c-ca5588769c16.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Qaysi rasmda to‘rt tasmali yo‘l ko‘rsatilgan?",
    "question_cyrl": "Қайси расмда тўрт тасмали йўл кўрсатилган?",
    "answers": ["Birinchi", "Birinchi va ikkinchi", "Ikkinchi va uchinchi", "Barchasida"],
    "answers_cyrl": ["Биринчи", "Биринчи ва иккинчи", "Иккинчи ва учинчи", "Барчасида"],
    "correct_answer": 3,
    "image_url": "https://ptest.uz/images/0fad6563-2520-4a9f-ad81-238d74446a58.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Yo'l patrul hizmat hodimlariga yo' l harakat qatnashchilari bilan o'zaro munosabatlari va maxsuz moslamalardan foydalanishda nizom to'grisidagi qonunda qanday tartib qo'yilgan ?",
    "question_cyrl": "Йўл патруль ҳизмат ҳодимларига йў л ҳаракат қатнашчилари билан ўзаро муносабатлари ва махсуз мосламалардан фойдаланишда низом тўгрисидаги қонунда қандай тартиб қўйилган ?",
    "answers": ["Yo'l transport hodisasini oldini olish va harakat hafsizligini taminlash", "Maxsuz tadbirlar o'tqazish", "Taqib qilish", "Kuzatish", "Ko'rsatilgan barcha javoblar"],
    "answers_cyrl": ["Йўл транспорт ҳодисасини олдини олиш ва ҳаракат ҳафсизлигини таминлаш", "Махсуз тадбирлар ўтқазиш", "Тақиб қилиш", "Кузатиш", "Кўрсатилган барча жавоблар"],
    "correct_answer": 4,
    "image_url": "https://ptest.uz/images/50bb879b-2325-489f-8318-8bbb06e9cde9.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Qaysi javobda yo‘l belgilari guruhlarining ketma-ketligi to‘g‘ri ko‘rsatilgan?",
    "question_cyrl": "Қайси жавобда йўл белгилари гуруҳларининг кетма-кетлиги тўғри кўрсатилган?",
    "answers": ["Taqiqlovchi, Imtiyoz, Buyuruvchi, Axborot-ko‘rsatkich, Ogohlantiruvchi, Servis, Qo‘shimcha axborot", "Ogohlantiruvchi, Imtiyoz, Taqiqlovchi, Buyuruvchi, Axborot-ko‘rsatkich, Servis, Qo‘shimcha axborot", "Ogohlantiruvchi, Imtiyoz, Buyuruvchi, Taqiqlovchi, Axborot-ko‘rsatkich, Servis, Qo‘shimcha axborot", "Yuqoridagi barcha javoblar to‘g‘ri"],
    "answers_cyrl": ["Тақиқловчи, Имтиёз, Буюрувчи, Ахборот-кўрсаткич, Огоҳлантирувчи, Сервис, Қўшимча ахборот", "Огоҳлантирувчи, Имтиёз, Тақиқловчи, Буюрувчи, Ахборот-кўрсаткич, Сервис, Қўшимча ахборот", "Огоҳлантирувчи, Имтиёз, Буюрувчи, Тақиқловчи, Ахборот-кўрсаткич, Сервис, Қўшимча ахборот", "Юқоридаги барча жавоблар тўғри"],
    "correct_answer": 1,
    "image_url": "https://ptest.uz/images/empty_placeholder.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  },
  {
    "question": "Aholi punktlaridan tashqarida quvib o‘tishda qanday ogohlantirish ishoralaridan foydalanish mumkin?",
    "question_cyrl": "Аҳоли пунктларидан ташқарида қувиб ўтишда қандай огоҳлантириш ишораларидан фойдаланиш мумкин?",
    "answers": ["Faralarning uzoqni yorituvchi chiroqlaridan", "Tovushli ishoralardan", "1 va 2"],
    "answers_cyrl": ["Фараларнинг узоқни ёритувчи чироқларидан", "Товушли ишоралардан", "1 ва 2"],
    "correct_answer": 2,
    "image_url": "https://ptest.uz/images/empty_placeholder.webp",
    "category": "Yo'l belgilari",
    "time_limit": 300
  }
]

def format_pg_array(arr):
    # PostgreSQL array format: {"val1", "val2"}
    # Use json.dumps to handle escaping within strings
    formatted = "{" + ",".join('"' + s.replace('"', '\\"') + '"' for s in arr) + "}"
    return formatted

filename = 'ticket_60_tests.csv'
header = [
    'question', 'question_cyrl', 'answers', 'answers_cyrl', 
    'correct_answer', 'image_url', 'category', 'time_limit',
    'audio_url', 'audio_url_cyrl', 'explanation_title', 
    'explanation_title_cyrl', 'explanation_text', 'explanation_text_cyrl'
]

with open(filename, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=header)
    writer.writeheader()
    for row in data:
        row['answers'] = format_pg_array(row['answers'])
        row['answers_cyrl'] = format_pg_array(row['answers_cyrl'])
        # Add empty optional fields
        for field in header:
            if field not in row:
                row[field] = ""
        writer.writerow(row)

print(f"File {filename} created successfully.")
