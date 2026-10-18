// A small controlled grammar, shared by the local server and the offline app.
// Every slot is a closed, grammatical phrase in its role, never user-supplied text.
export const RULE_VERSION='daily-scenes-1';
export const RULE_LANGUAGES=['en','zh','ja','ko','es','fr','ru','ar','id','hi'];
const t=(...values)=>Object.fromEntries(RULE_LANGUAGES.map((id,i)=>[id,values[i]]));
const time={
  now:t('Now, ','现在，','今、','지금 ','Ahora, ','Maintenant, ','Сейчас ','الآن، ','Sekarang, ','अभी '),
  today:t('Today, ','今天，','今日、','오늘 ','Hoy, ',"Aujourd’hui, ",'Сегодня ','اليوم، ','Hari ini, ','आज '),
  morning:t('This morning, ','今天早上，','今朝、','오늘 아침에 ','Esta mañana, ','Ce matin, ','Утром ','هذا الصباح، ','Pagi ini, ','आज सुबह '),
  evening:t('This evening, ','今天晚上，','今夜、','오늘 저녁에 ','Esta tarde, ','Ce soir, ','Вечером ','هذا المساء، ','Malam ini, ','आज शाम ')
};
const items={
  book:t('my book','我的书','私の本を','제 책을','mi libro','mon livre','мою книгу','كتابي','bukuku','मेरी किताब'),
  key:t('my key','我的钥匙','私の鍵を','제 열쇠를','mi llave','ma clé','мой ключ','مفتاحي','kunciku','मेरी चाबी'),
  phone:t('my phone','我的手机','私の携帯電話を','제 휴대전화를','mi teléfono','mon téléphone','мой телефон','هاتفي','ponselku','मेरा फ़ोन'),
  letter:t('my letter','我的信','私の手紙を','제 편지를','mi carta','ma lettre','моё письмо','رسالتي','suratku','मेरी चिट्ठी')
};
const owned={
  book:t('my book','我的书','私の本','제 책','mi libro','mon livre','моя книга','كتابي','bukuku','मेरी किताब'),
  key:t('my key','我的钥匙','私の鍵','제 열쇠','mi llave','ma clé','мой ключ','مفتاحي','kunciku','मेरी चाबी'),
  phone:t('my phone','我的手机','私の携帯電話','제 휴대전화','mi teléfono','mon téléphone','мой телефон','هاتفي','ponselku','मेरा फ़ोन'),
  letter:t('my letter','我的信','私の手紙','제 편지','mi carta','ma lettre','моё письмо','رسالتي','suratku','मेरी चिट्ठी')
};
const subjects={
  book:t('the book','书','本は','책은','el libro','le livre','книга','الكتاب','buku ini','किताब'),
  key:t('the key','钥匙','鍵は','열쇠는','la llave','la clé','ключ','المفتاح','kunci ini','चाबी'),
  phone:t('the phone','手机','携帯電話は','휴대전화는','el teléfono','le téléphone','телефон','الهاتف','ponsel ini','फ़ोन'),
  letter:t('the letter','信','手紙は','편지는','la carta','la lettre','письмо','الرسالة','surat ini','चिट्ठी')
};
const places={
  table:t('on the table','在桌子上','テーブルの上で','탁자 위에서','en la mesa','sur la table','на столе','على الطاولة','di atas meja','मेज़ पर'),
  chair:t('under the chair','在椅子下面','椅子の下で','의자 아래에서','debajo de la silla','sous la chaise','под стулом','تحت الكرسي','di bawah kursi','कुर्सी के नीचे'),
  bag:t('in the bag','在包里','かばんの中で','가방 안에서','en la bolsa','dans le sac','в сумке','في الحقيبة','di dalam tas','बैग में')
};
const destinations={
  park:t('to the park','去公园','公園に','공원에','al parque','au parc','в парк','إلى الحديقة','ke taman','पार्क'),
  library:t('to the library','去图书馆','図書館に','도서관에','a la biblioteca','à la bibliothèque','в библиотеку','إلى المكتبة','ke perpustakaan','पुस्तकालय'),
  shop:t('to the shop','去商店','店に','가게에','a la tienda','au magasin','в магазин','إلى المتجر','ke toko','दुकान')
};
const readings={
  book:t('this book','这本书','この本を','이 책을','este libro','ce livre','эту книгу','هذا الكتاب','buku ini','यह किताब'),
  guide:t('this guide','这份指南','この案内を','이 안내문을','esta guía','ce guide','это руководство','هذا الدليل','panduan ini','यह मार्गदर्शिका')
};
const drinks={
  tea:{object:t('some tea','茶','お茶を','차를','té','du thé','чай','الشاي','teh','चाय'),subject:t('some tea','茶','お茶が','차가','té','du thé','чай','الشاي','teh','चाय')},
  coffee:{object:t('some coffee','咖啡','コーヒーを','커피를','café','du café','кофе','القهوة','kopi','कॉफ़ी'),subject:t('some coffee','咖啡','コーヒーが','커피가','café','du café','кофе','القهوة','kopi','कॉफ़ी')},
  water:{object:t('some water','水','水を','물을','agua',"de l’eau",'воду','الماء','air','पानी'),subject:t('some water','水','水が','물이','agua',"de l’eau",'вода','الماء','air','पानी')}
};
const clauses={
  home:[
    t('this is {owned}.','这是{owned}。','これは{owned}です。','이것은 {owned}입니다.','esto es {owned}.','voici {owned}.','это {owned}.','هذا {owned}.','ini {owned}.','यह {owned} है।'),
    t('here is {owned}.','我的东西在这里：{owned}。','ここに{owned}があります。','여기에 {owned}이 있습니다.','aquí está {owned}.','voici {owned}.','вот {owned}.','هنا {owned}.','ini {owned}.','यहाँ {owned} है।')
  ],
  homeMiddle:[
    t('I am at home.','我在家。','私は家にいます。','저는 집에 있습니다.','Estoy en casa.','Je suis à la maison.','Я дома.','أنا في البيت.','Aku ada di rumah.','मैं घर पर हूँ।'),
    t('A friend is here with me.','一位朋友和我一起在这里。','友達がここで私と一緒にいます。','친구가 여기 저와 함께 있습니다.','Un amigo está aquí conmigo.','Un ami est ici avec moi.','Друг здесь со мной.','صديق هنا معي.','Seorang teman ada di sini bersamaku.','एक दोस्त यहाँ मेरे साथ है।')
  ],
  homeExtra:[
    t('I have time to stay here.','我有时间待在这里。','私にはここにいる時間があります。','저는 여기 있을 시간이 있습니다.','Tengo tiempo para quedarme aquí.','J’ai le temps de rester ici.','У меня есть время побыть здесь.','لدي وقت للبقاء هنا.','Aku punya waktu untuk tinggal di sini.','मेरे पास यहाँ रहने का समय है।'),
    t('We do not need to hurry.','我们不用着急。','私たちは急ぐ必要がありません。','우리는 서두를 필요가 없습니다.','No necesitamos darnos prisa.','Nous n’avons pas besoin de nous dépêcher.','Нам не нужно спешить.','لا نحتاج إلى الإسراع.','Kami tidak perlu terburu-buru.','हमें जल्दी करने की ज़रूरत नहीं है।')
  ],
  homeEnd:[
    t('{subject} is {located}.','{subject}{located}。','{subject}{located}あります。','{subject} {located} 있습니다.','{subject} está {located}.','{subject} est {located}.','{subject} {located}.','{subject} {located}.','{subject} ada {located}.','{subject} {located} है।'),
    t('I can see {item} {place}.','我能看到{item}{place}。','私は{place}{item}見ることができます。','저는 {place} {item} 볼 수 있습니다.','Puedo ver {item} {place}.','Je peux voir {item} {place}.','Я могу видеть {selfItem} {place}.','أستطيع رؤية {item} {place}.','Aku bisa melihat {item} {place}.','मैं {place} {item} देख सकता हूँ।')
  ],
  search:[
    t('I cannot find {item}.','我找不到{item}。','私は{item}見つけられません。','저는 {item} 찾지 못합니다.','no puedo encontrar {item}.','je ne trouve pas {item}.','я не могу найти {selfItem}.','لا أستطيع العثور على {item}.','aku tidak bisa menemukan {item}.','मुझे {item} नहीं मिल रही है।'),
    t('I am looking for {item}.','我在找{item}。','私は{item}探しています。','저는 {item} 찾고 있습니다.','estoy buscando {item}.','je cherche {item}.','я ищу {selfItem}.','أبحث عن {item}.','aku sedang mencari {item}.','मैं {item} ढूँढ़ रहा हूँ।')
  ],
  searchHelp:[
    t('A friend helps me look.','一位朋友帮我找。','友達が一緒に探してくれます。','친구가 함께 찾아줍니다.','Un amigo me ayuda a buscar.','Un ami m’aide à chercher.','Друг помогает мне искать.','يساعدني صديق في البحث.','Seorang teman membantuku mencari.','एक दोस्त ढूँढ़ने में मेरी मदद करता है।'),
    t('A friend has an idea.','一位朋友有了主意。','友達に考えがあります。','친구에게 좋은 생각이 있습니다.','Un amigo tiene una idea.','Un ami a une idée.','У друга есть идея.','لدى صديق فكرة.','Seorang teman punya ide.','एक दोस्त के पास एक विचार है।')
  ],
  searchExtra:[
    t('We also look in the room together.','我们也一起在房间里找。','私たちは部屋でも一緒に探します。','우리는 방 안에서도 함께 찾습니다.','También buscamos juntos en la habitación.','Nous cherchons aussi ensemble dans la pièce.','Мы также вместе ищем в комнате.','نبحث أيضا معا في الغرفة.','Kami juga mencari bersama di kamar.','हम कमरे में भी साथ ढूँढ़ते हैं।'),
    t('We take a little more time to look.','我们再花一点时间找。','私たちはもう少し時間をかけて探します。','우리는 조금 더 시간을 들여 찾습니다.','Nos tomamos un poco más de tiempo para buscar.','Nous prenons un peu plus de temps pour chercher.','Мы тратим ещё немного времени на поиски.','نأخذ وقتا أطول قليلا للبحث.','Kami meluangkan sedikit waktu lagi untuk mencari.','हम ढूँढ़ने के लिए थोड़ा और समय लेते हैं।')
  ],
  searchEnd:[
    t('Together we find {item} {place}.','我们一起{place}找到了{item}。','私たちは{place}{item}見つけます。','우리는 함께 {place} {item} 찾습니다.','Juntos encontramos {item} {place}.','Ensemble, nous trouvons {item} {place}.','Вместе мы находим {item} {place}.','نعثر معا على {item} {place}.','Bersama-sama kami menemukan {item} {place}.','हम साथ में {place} {item} ढूँढ़ लेते हैं।'),
    t('At last, we find {item} {place}.','最后，我们{place}找到了{item}。','やっと私たちは{place}{item}見つけます。','마침내 우리는 {place} {item} 찾습니다.','Por fin encontramos {item} {place}.','Enfin, nous trouvons {item} {place}.','Наконец мы находим {item} {place}.','أخيرا نعثر على {item} {place}.','Akhirnya kami menemukan {item} {place}.','आख़िरकार हम {place} {item} ढूँढ़ लेते हैं।')
  ],
  plan:[
    t('we want to go {destination}.','我们想{destination}。','私たちは{destination}行きたいです。','우리는 {destination} 가려고 합니다.','queremos ir {destination}.','nous voulons aller {destination}.','мы хотим пойти {destination}.','نريد الذهاب {destination}.','kami ingin pergi {destination}.','हम {destination} जाना चाहते हैं।'),
    t('we make a plan to go {destination}.','我们计划{destination}。','私たちは{destination}行く計画を立てます。','우리는 {destination} 갈 계획을 세웁니다.','hacemos un plan para ir {destination}.','nous faisons un plan pour aller {destination}.','мы составляем план: пойти {destination}.','نضع خطة للذهاب {destination}.','kami membuat rencana untuk pergi {destination}.','हम {destination} जाने की योजना बनाते हैं।')
  ],
  planCheck:[
    t('First, we check the time.','我们先确认时间。','まず私たちは時間を確認します。','먼저 시간을 확인합니다.','Primero comprobamos la hora.','D’abord, nous vérifions l’heure.','Сначала мы проверяем время.','نتحقق أولا من الوقت.','Pertama, kami memeriksa waktu.','पहले हम समय देखते हैं।'),
    t('First, we check our schedule.','我们先确认日程。','まず私たちは予定を確認します。','먼저 일정을 확인합니다.','Primero revisamos nuestro horario.','D’abord, nous vérifions notre emploi du temps.','Сначала мы проверяем наше расписание.','نتحقق أولا من جدولنا.','Pertama, kami memeriksa jadwal.','पहले हम अपना कार्यक्रम देखते हैं।')
  ],
  planExtra:[
    t('We also look for information together.','我们还一起查找信息。','私たちは情報も一緒に探します。','우리는 필요한 정보도 함께 찾습니다.','También buscamos información juntos.','Nous cherchons aussi des informations ensemble.','Мы также вместе ищем информацию.','نبحث أيضا عن المعلومات معا.','Kami juga mencari informasi bersama.','हम साथ में जानकारी भी ढूँढ़ते हैं।'),
    t('A friend tells us how to get there.','一位朋友告诉我们怎么去那里。','友達がそこへの行き方を教えてくれます。','친구가 가는 방법을 알려줍니다.','Un amigo nos dice cómo llegar.','Un ami nous explique comment y aller.','Друг объясняет нам, как туда добраться.','يخبرنا صديق كيف نصل إلى هناك.','Seorang teman memberi tahu kami cara menuju ke sana.','एक दोस्त हमें बताता है कि वहाँ कैसे जाना है।')
  ],
  planEnd:[
    t('Now we are ready to leave.','现在我们准备好出发了。','これで私たちは出かける準備ができています。','이제 출발할 준비가 되었습니다.','Ahora estamos listos para salir.','Maintenant, nous sommes prêts à partir.','Сейчас мы готовы выходить.','الآن نحن مستعدون للمغادرة.','Sekarang kami siap berangkat.','अब हम निकलने के लिए तैयार हैं।'),
    t('Everything is ready, and we leave together.','一切准备好了，我们一起出发。','準備ができたので、私たちは一緒に出かけます。','준비가 끝나서 우리는 함께 출발합니다.','Todo está listo y salimos juntos.','Tout est prêt et nous partons ensemble.','Всё готово, и мы выходим вместе.','كل شيء جاهز، ونغادر معا.','Semuanya sudah siap, dan kami berangkat bersama.','सब तैयार है और हम साथ निकलते हैं।')
  ],
  read:[
    t('I read {reading}.','我阅读{reading}。','私は{reading}読みます。','저는 {reading} 읽습니다.','leo {reading}.','je lis {reading}.','я читаю {reading}.','أقرأ {reading}.','aku membaca {reading}.','मैं {reading} पढ़ता हूँ।'),
    t('I want to read {reading}.','我想阅读{reading}。','私は{reading}読みたいです。','저는 {reading} 읽고 싶습니다.','quiero leer {reading}.','je veux lire {reading}.','я хочу прочитать {reading}.','أريد قراءة {reading}.','aku ingin membaca {reading}.','मैं {reading} पढ़ना चाहता हूँ।')
  ],
  readDetail:[
    t('I find detailed information in the text.','我在文中找到详细的信息。','文章には詳細な情報があります。','글에서 자세한 정보를 찾습니다.','Encuentro información detallada en el texto.','Je trouve des informations détaillées dans le texte.','В тексте я нахожу подробную информацию.','أجد معلومات مفصلة في النص.','Aku menemukan informasi terperinci dalam teks.','मुझे पाठ में विस्तृत जानकारी मिलती है।'),
    t('I do not have an answer to my question yet.','我的问题还没有答案。','私の質問にはまだ答えがないです。','제 질문에는 아직 답이 없습니다.','Todavía no tengo una respuesta a mi pregunta.','Je n’ai pas encore de réponse à ma question.','У меня пока нет ответа на мой вопрос.','ليس لدي جواب عن سؤالي بعد.','Aku belum punya jawaban untuk pertanyaanku.','मेरे सवाल का जवाब अभी नहीं है।')
  ],
  readExtra:[
    t('I take time to think about the information.','我花时间思考这些信息。','私は時間をかけてその情報について考えます。','저는 시간을 들여 그 정보를 생각합니다.','Me tomo tiempo para pensar en la información.','Je prends le temps de réfléchir aux informations.','Я уделяю время тому, чтобы обдумать информацию.','آخذ وقتا للتفكير في المعلومات.','Aku meluangkan waktu untuk memikirkan informasi itu.','मैं जानकारी पर सोचने के लिए समय लेता हूँ।'),
    t('I want to understand the subject better.','我想更好地理解这个主题。','私はその話題をもっとよく理解したいです。','저는 그 주제를 더 잘 이해하고 싶습니다.','Quiero entender mejor el tema.','Je veux mieux comprendre le sujet.','Я хочу лучше понять эту тему.','أريد فهم الموضوع بشكل أفضل.','Aku ingin memahami topik itu dengan lebih baik.','मैं विषय को बेहतर समझना चाहता हूँ।')
  ],
  readGoodEnd:[
    t('Now I want to know more.','现在我想了解更多。','今、私はもっと知りたいです。','이제 저는 더 알고 싶습니다.','Ahora quiero saber más.','Maintenant, je veux en savoir plus.','Сейчас я хочу узнать больше.','الآن أريد أن أعرف أكثر.','Sekarang aku ingin tahu lebih banyak.','अब मैं और जानना चाहता हूँ।'),
    t('This is worth reading.','这值得一读。','これは読む価値があります。','이것은 읽을 가치가 있습니다.','Vale la pena leer esto.','Cela vaut la peine d’être lu.','Это стоит прочитать.','هذا يستحق القراءة.','Ini layak dibaca.','यह पढ़ने लायक है।')
  ],
  readQuestionEnd:[
    t('I ask a friend for help.','我向一位朋友求助。','私は友達に助けを求めます。','저는 친구에게 도움을 청합니다.','Pido ayuda a un amigo.','Je demande de l’aide à un ami.','Я прошу друга о помощи.','أطلب المساعدة من صديق.','Aku meminta bantuan seorang teman.','मैं एक दोस्त से मदद माँगता हूँ।'),
    t('A friend helps me understand the subject.','一位朋友帮助我理解这个主题。','友達がその話題を理解するのを手伝ってくれます。','친구가 그 주제를 이해하도록 도와줍니다.','Un amigo me ayuda a entender el tema.','Un ami m’aide à comprendre le sujet.','Друг помогает мне понять эту тему.','يساعدني صديق على فهم الموضوع.','Seorang teman membantuku memahami topik itu.','एक दोस्त विषय समझने में मेरी मदद करता है।')
  ],
  drink:[
    t('I want to drink {drink}.','我想喝{drink}。','私は{drink}飲みたいです。','저는 {drink} 마시고 싶습니다.','quiero beber {drink}.','je veux boire {drink}.','я хочу выпить {drink}.','أريد أن أشرب {drink}.','aku ingin minum {drink}.','मैं {drink} पीना चाहता हूँ।'),
    t('A friend and I take a break.','我和一位朋友休息一下。','私と友達は少し休みます。','저와 친구는 잠깐 쉽니다.','un amigo y yo descansamos un poco.','un ami et moi faisons une pause.','мы с другом немного отдыхаем.','آخذ استراحة مع صديق.','aku dan seorang teman beristirahat sebentar.','मैं और एक दोस्त थोड़ा आराम करते हैं।')
  ],
  drinkServe:[
    t('There is {served} on the table.','桌上有{served}。','テーブルに{served}あります。','탁자 위에 {served} 있습니다.','En la mesa hay {served}.','Sur la table, il y a {served}.','На столе есть {served}.','على الطاولة {served}.','Di atas meja ada {served}.','मेज़ पर {served} है।'),
    t('A friend brings {drink}.','一位朋友端来{drink}。','友達が{drink}持ってきます。','친구가 {drink} 가져옵니다.','Un amigo trae {drink}.','Un ami apporte {drink}.','Друг приносит {drink}.','يحضر صديق {drink}.','Seorang teman membawa {drink}.','एक दोस्त {drink} लाता है।')
  ],
  drinkExtra:[
    t('We have time to talk.','我们有时间聊天。','私たちには話す時間があります。','우리는 이야기할 시간이 있습니다.','Tenemos tiempo para hablar.','Nous avons le temps de parler.','У нас есть время поговорить.','لدينا وقت للحديث.','Kami punya waktu untuk berbicara.','हमारे पास बात करने का समय है।'),
    t('We do not need to hurry.','我们不用着急。','私たちは急ぐ必要がありません。','우리는 서두를 필요가 없습니다.','No necesitamos darnos prisa.','Nous n’avons pas besoin de nous dépêcher.','Нам не нужно спешить.','لا نحتاج إلى الإسراع.','Kami tidak perlu terburu-buru.','हमें जल्दी करने की ज़रूरत नहीं है।')
  ],
  drinkEnd:[
    t('We sit down and talk together.','我们坐下来一起聊天。','私たちは座って一緒に話します。','우리는 앉아서 함께 이야기합니다.','Nos sentamos y hablamos juntos.','Nous nous asseyons et nous parlons ensemble.','Мы садимся и разговариваем вместе.','نجلس ونتحدث معا.','Kami duduk dan berbicara bersama.','हम बैठकर साथ बात करते हैं।'),
    t('We enjoy a quiet moment together.','我们一起享受片刻宁静。','私たちは一緒に静かなひとときを楽しみます。','우리는 함께 조용한 시간을 즐깁니다.','Disfrutamos juntos de un momento tranquilo.','Nous profitons ensemble d’un moment calme.','Мы вместе наслаждаемся спокойной минутой.','نستمتع معا بلحظة هادئة.','Kami menikmati saat yang tenang bersama.','हम साथ एक शांत पल का आनंद लेते हैं।')
  ],
  ball:[
    t('I play with a friend.','我和一位朋友玩。','私は友達と遊びます。','저는 친구와 놉니다.','juego con un amigo.','je joue avec un ami.','я играю с другом.','ألعب مع صديق.','aku bermain dengan seorang teman.','मैं एक दोस्त के साथ खेलता हूँ।'),
    t('A friend and I play with a ball.','我和一位朋友玩球。','私と友達はボールで遊びます。','저와 친구는 공을 가지고 놉니다.','un amigo y yo jugamos con una pelota.','un ami et moi jouons au ballon.','мы с другом играем с мячом.','ألعب بالكرة مع صديق.','aku dan seorang teman bermain bola.','मैं और एक दोस्त गेंद से खेलते हैं।')
  ],
  ballHit:[
    t('I hit the ball toward my friend.','我把球打向朋友。','私は友達のほうへボールを打ちます。','저는 친구 쪽으로 공을 칩니다.','Golpeo la pelota hacia mi amigo.','Je frappe la balle vers mon ami.','Я бью по мячу в сторону друга.','أضرب الكرة نحو صديقي.','Aku memukul bola ke arah temanku.','मैं गेंद अपने दोस्त की ओर मारता हूँ।'),
    t('I try to hit the ball toward my friend.','我试着把球打向朋友。','私は友達のほうへボールを打とうとします。','저는 친구 쪽으로 공을 치려고 합니다.','Intento golpear la pelota hacia mi amigo.','J’essaie de frapper la balle vers mon ami.','Я пробую ударить мяч в сторону друга.','أحاول ضرب الكرة نحو صديقي.','Aku mencoba memukul bola ke arah temanku.','मैं गेंद अपने दोस्त की ओर मारने की कोशिश करता हूँ।')
  ],
  ballExtra:[
    t('My friend watches the ball carefully.','朋友仔细地看着球。','友達はボールをよく見ています。','친구는 공을 주의 깊게 봅니다.','Mi amigo mira la pelota con atención.','Mon ami regarde attentivement la balle.','Друг внимательно следит за мячом.','يراقب صديقي الكرة بعناية.','Temanku memperhatikan bola dengan saksama.','मेरा दोस्त गेंद को ध्यान से देखता है।'),
    t('We have plenty of time to play.','我们有充足的时间玩。','私たちには遊ぶ時間がたくさんあります。','우리는 놀 시간이 충분합니다.','Tenemos mucho tiempo para jugar.','Nous avons beaucoup de temps pour jouer.','У нас много времени для игры.','لدينا وقت كثير للعب.','Kami punya banyak waktu untuk bermain.','हमारे पास खेलने के लिए बहुत समय है।')
  ],
  ballEnd:[
    t('My friend catches the ball, and we keep playing.','朋友接住球，我们继续玩。','友達がボールを受け取り、私たちは遊び続けます。','친구가 공을 잡고 우리는 계속 놉니다.','Mi amigo atrapa la pelota y seguimos jugando.','Mon ami attrape la balle et nous continuons à jouer.','Друг ловит мяч, и мы продолжаем играть.','يمسك صديقي بالكرة ونواصل اللعب.','Temanku menangkap bola, lalu kami terus bermain.','मेरा दोस्त गेंद पकड़ता है और हम खेलते रहते हैं।'),
    t('My friend catches the ball and smiles.','朋友接住球，笑了。','友達はボールを受け取って笑います。','친구는 공을 잡고 웃습니다.','Mi amigo atrapa la pelota y sonríe.','Mon ami attrape la balle et sourit.','Друг ловит мяч и улыбается.','يمسك صديقي بالكرة ويبتسم.','Temanku menangkap bola dan tersenyum.','मेरा दोस्त गेंद पकड़ता है और मुस्कुराता है।')
  ]
};

const scenes={home:{slots:{item:Object.keys(items),place:Object.keys(places)},parts:['home','homeMiddle','homeEnd'],extra:'homeExtra'},
  search:{slots:{item:Object.keys(items),place:Object.keys(places)},parts:['search','searchHelp','searchEnd'],extra:'searchExtra'},
  plan:{slots:{destination:Object.keys(destinations)},parts:['plan','planCheck','planEnd'],extra:'planExtra'},
  read:{slots:{reading:Object.keys(readings)},parts:['read','readDetail','readGoodEnd'],extra:'readExtra'},
  drink:{slots:{drink:Object.keys(drinks)},parts:['drink','drinkServe','drinkEnd'],extra:'drinkExtra'},
  ball:{slots:{},parts:['ball','ballHit','ballEnd'],extra:'ballExtra'}};

export function* ruleDerivations(tier=1){
  for(const [scene,grammar] of Object.entries(scenes)){
    let slots=[{}];for(const [name,values] of Object.entries(grammar.slots))slots=slots.flatMap(row=>values.map(value=>({...row,[name]:value})));
    for(const slot of slots)for(const when of Object.keys(time))for(let open=0;open<2;open++)for(let middle=0;middle<2;middle++)for(let end=0;end<2;end++)for(let extra=0;extra<(tier>1?2:1);extra++)
      yield{version:RULE_VERSION,scene,slots:slot,time:when,open,middle,end,extra,tier};
  }
}
export function renderRule(derivation,id){
  const d=derivation,g=scenes[d?.scene];
  if(!g||d.version!==RULE_VERSION||!time[d.time]?.[id]||![1,2,3].includes(d.tier)||![d.open,d.middle,d.end,d.extra].every(n=>n===0||n===1))throw Error('Unknown paragraph rule');
  if(Object.keys(d.slots??{}).length!==Object.keys(g.slots).length||!Object.entries(g.slots).every(([key,values])=>values.includes(d.slots[key])))throw Error('Unknown paragraph slot');
  const slot=d.slots,place=places[slot.place]?.[id];
  const located=id==='ja'?place?.replace(/で$/,'に'):id==='ko'?place?.replace(/에서$/,'에'):place;
  const item=items[slot.item]?.[id],selfItem=id==='ru'?item?.replace('мою','свою').replace('мой','свой').replace('моё','своё'):item;
  const values={item,selfItem,owned:owned[slot.item]?.[id],subject:subjects[slot.item]?.[id],located,place,destination:destinations[slot.destination]?.[id],reading:readings[slot.reading]?.[id],drink:drinks[slot.drink]?.object[id],served:drinks[slot.drink]?.subject[id]};
  const fill=text=>text.replace(/\{(\w+)\}/g,(_,key)=>{if(!values[key])throw Error('Missing role phrase');return values[key];});
  const last=d.scene==='read'&&d.middle===1?'readQuestionEnd':g.parts[2];
  const parts=[time[d.time][id]+fill(clauses[g.parts[0]][d.open][id]),clauses[g.parts[1]][d.middle][id]];
  if(d.tier>1)parts.push(clauses[g.extra][d.extra][id]);parts.push(clauses[last][d.end][id]);
  // No generic agreement guessing: the small exception uses the slot's gender.
  return parts.map(fill).map(text=>{
    if(id==='hi'&&d.scene==='search'&&d.open===0&&slot.item==='phone')text=text.replace('नहीं मिल रही है','नहीं मिल रहा है');
    if(id==='ko'&&d.scene==='home'&&d.open===1&&slot.item!=='book')text=text.replace('이 있습니다','가 있습니다');
    if(id==='ar'&&d.scene==='home'&&d.open===0&&slot.item==='letter')text=text.replace('هذا','هذه');
    if(id==='es'&&d.scene==='home'&&d.open===0)text=text.replace('esto es',slot.item==='key'||slot.item==='letter'?'esta es':'este es');
    return text[0].toLocaleUpperCase(id)+text.slice(1);
  });
}

// Bind only reviewed senses and explicit forms. CJK particles are bound to
// whole role phrases so a character inside an unrelated word cannot count.
const lexical=[];
function word(id,display,pos,sense,forms=[display]){lexical.push({id,display,pos:pos.split('|'),sense:new RegExp(sense,'i'),forms});}
const noun=(id,display,sense,forms)=>word(id,display,'noun',sense,forms);
for(const [id,display,forms] of [['en','book',['book']],['ja','本',['本']],['ko','책',['책']],['es','libro',['libro']],['fr','livre',['livre']],['ru','книга',['книга','книгу']],['ar','كتاب',['كتابي','الكتاب']],['id','buku',['buku','bukuku']],['hi','किताब',['किताब']]])noun(id,display,'book|pages|sheets|printed',forms);
for(const [id,display,forms] of [['en','key',['key']],['ja','鍵',['鍵']],['ko','열쇠',['열쇠']],['es','llave',['llave']],['fr','clé',['clé']],['ru','ключ',['ключ']],['ar','مفتاح',['مفتاحي','المفتاح']],['id','kunci',['kunci','kunciku']],['hi','चाबी',['चाबी']]])noun(id,display,'lock|door|opening',forms);
for(const [id,display,forms] of [['en','phone',['phone']],['ja','携帯電話',['携帯電話']],['ko','휴대전화',['휴대전화']],['es','teléfono',['teléfono']],['fr','téléphone',['téléphone']],['ru','телефон',['телефон']],['ar','هاتف',['هاتفي','الهاتف']],['id','ponsel',['ponsel','ponselku']],['hi','फ़ोन',['फ़ोन']]])noun(id,display,'phone|telephone',forms);
const basics={
  en:[['I','pron','speaker|first.person|\\bI\\b'],['we','pron','we|speaker'],['not','adv','negat'],['morning','noun','early|morning'],['hit','verb','strike|blow'],['now','adv','present|now'],['time','noun','time|duration'],['friend','noun','friend|person'],['information','noun','information'],['plan','noun','plan|intent'],['read','verb','read|interpret'],['find','verb','find|discover|encounter'],['more','adv|det','more|comparative']],
  ja:[['詳細','adj','detailed'],['価値','noun','value|worth'],['ない','adj','nonexistent|not existing'],['今','noun|adv','now|present'],['朝','noun','morning'],['情報','noun','information'],['時間','noun','time'],['計画','noun','plan'],['友達','noun','friend']],
  ko:[['정보','noun','information'],['계획','noun','plan'],['일정','noun','schedule'],['확인','noun','check|confirmation'],['준비','noun','preparation|readiness'],['방법','noun','way|method'],['아직','adv','still|yet'],['계속','adv','continuously'],['가치','noun','value|worth'],['지금','adv|noun','now'],['오늘','noun|adv','today'],['시간','noun','time'],['친구','noun','friend']],
  es:[['yo','pron','\\bI\\b'],['ahora','adv','now'],['esta','det','this'],['tengo','verb','have|possess'],['tiene','verb','have|possess'],['estoy','verb','be|estar'],['hay','verb','there|exist|haber'],['también','adv','also|too'],['tiempo','noun','time|duration'],['plan','noun','plan'],['información','noun','information'],['amigo','noun','friend']],
  fr:[['je','pron','\\bI\\b|speaker'],['pas','adv','not|negat'],['le','article','the|definite'],['la','article','the|definite'],['ami','noun','friend'],['temps','noun','time'],['plan','noun','plan'],['information','noun','information']],
  ru:[['я','pron','\\bI\\b|first.person'],['мы','pron','\\bwe\\b'],['не','particle','not'],['сейчас','adv','now|present'],['где','adv','where'],['также','adv','also'],['просто','adv','simply|just'],['больше','adv','more|comparative'],['понять','verb','understand|comprehend'],['есть','verb','be|exist'],['время','noun','time'],['план','noun','plan'],['друг','noun','friend']],
  ar:[['اليوم','adv','today'],['هذا','pron','this'],['هذه','pron','this'],['أيضا','adv','also'],['أكثر','adv','more'],['كل','noun','each|every'],['في','prep','in|within'],['مع','prep','with'],['من','prep','from']],
  id:[['aku','pron','\\bI\\b|me'],['ini','det','this'],['ada','verb','exist|there'],['tidak','adv','not|negat'],['dan','conj','and'],['di','prep','at|in|on'],['teman','noun','friend'],['waktu','noun','time'],['informasi','noun','information'],['rencana','noun','plan']],
  hi:[['मैं','pron','\\bI\\b'],['हम','pron','\\bwe\\b'],['है','verb','is|present'],['नहीं','particle','not|no'],['आज','adv','today'],['साथ','adv','together'],['और','conj','and'],['समय','noun','time'],['जानकारी','noun','information'],['दोस्त','noun','friend']]
};
for(const [id,rows] of Object.entries(basics))for(const row of rows)word(id,...row);
word('ja','は','particle','topic',['私は','私たちは','私と友達は','文章には','質問には','これは']);
word('ja','を','particle','accusative|direct object',['本を','鍵を','手紙を','情報を','ボールを','水を','時間を']);
word('ja','が','particle','subject',['友達が','情報が','考えが','答えが','価値が','時間が']);
word('ja','と','particle','with|companion',['友達と']);
word('ja','に','particle','recipient',['友達に助け']);
word('ja','の','particle','genitive|possession',['私の本','私の鍵','私の手紙','私の質問','友達の']);
word('ja','で','particle','location|duration|at, in',['部屋でも','上で','下で','中で']);
word('ru','мне','pron','me|dative',['мне']);word('ru','меня','pron','me|genitive',['меня']);
word('ru','в','prep','prepositional|in, at',['в комнате','в сумке','в тексте']);
word('ru','на','prep','accusative|onto',['на поиски']);
word('ru','и','conj','and',['и']);word('ru','с','prep','instrumental|with',['с другом','с мячом']);
word('ar','لعب','verb','play',['ألعب','للعب','اللعب']);
word('ar','صباح','noun','morning|sunrise',['الصباح']);word('ar','على','prep','on|over',['على الطاولة']);
word('fr','a','verb','have|possess',['a une idée']);

export function ruleLexemes(languageId,rows){
  const local=lexical.filter(row=>row.id===languageId),supported=[];
  for(const row of rows){const entry=row.word,normal=entry.display.normalize('NFC').toLocaleLowerCase(languageId);
    const rule=local.find(lex=>lex.display.normalize('NFC').toLocaleLowerCase(languageId)===normal&&lex.pos.includes(entry.pos)&&lex.sense.test(entry.meanings?.en??''));
    if(rule)supported.push({...row,rule});
  }return supported;
}
export function ruleOccurrence(id,rule,text){
  for(const form of rule.forms){const escaped=form.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    const boundary=['ja','ko'].includes(id)?'':`(?<![\\p{L}\\p{N}\\p{M}])`;
    const after=boundary?'(?![\\p{L}\\p{N}\\p{M}])':'';
    const match=new RegExp(boundary+escaped+after,'iu').exec(text);if(match)return match[0];
  }return null;
}
export function validRuleTarget(id,word,surface,text){
  const [bound]=ruleLexemes(id,[{word}]);return Boolean(bound&&bound.rule.forms.some(form=>form.toLocaleLowerCase(id)===surface.toLocaleLowerCase(id))&&ruleOccurrence(id,{forms:[surface]},text));
}
