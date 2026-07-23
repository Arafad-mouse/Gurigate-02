import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export type LanguageCode = "en" | "ar" | "so";

type LanguageOption = {
  code: LanguageCode;
  label: string;
  short: string;
};

type LanguageContextValue = {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
};

type LanguageProviderProps = {
  children: ReactNode;
};

type TranslationMap = Record<string, string>;

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", short: "EN" },
  { code: "ar", label: "Arabic", short: "AR" },
  { code: "so", label: "Somali", short: "SO" },
];

const LanguageContext = createContext<LanguageContextValue | null>(null);

const translations: Record<Exclude<LanguageCode, "en">, TranslationMap> = {
  ar: {
    "Choose language": "اختر اللغة",
    "Help Center": "مركز المساعدة",
    "It's easy to start hosting and earn extra income.": "من السهل بدء الاستضافة وكسب دخل إضافي.",
    "Refer a Host": "رشح مضيفا",
    "Find a co-host": "اعثر على مضيف مشارك",
    "Find a Co-host": "اعثر على مضيف مشارك",
    "Gift cards": "بطاقات الهدايا",
    "Gift Cards": "بطاقات الهدايا",
    "Log in or sign up": "تسجيل الدخول أو إنشاء حساب",
    "Welcome back": "مرحبا بعودتك",
    "Premium Member": "عضو مميز",
    "Wishlists": "قوائم الرغبات",
    "Trips": "الرحلات",
    "Messages": "الرسائل",
    "Profile": "الملف الشخصي",
    "Account Settings": "إعدادات الحساب",
    "Language & Currency": "اللغة والعملة",
    "Hosting": "الاستضافة",
    "Log Out": "تسجيل الخروج",
    "Welcome to GuriGate": "مرحبا بك في GuriGate",
    "Country code": "رمز الدولة",
    "Search country or code…": "ابحث عن الدولة أو الرمز...",
    "Phone number": "رقم الهاتف",
    "or": "أو",
    "Email": "البريد الإلكتروني",
    "Password": "كلمة المرور",
    "Enter your password": "أدخل كلمة المرور",
    "Remember me": "تذكرني",
    "Enter your verification code": "أدخل رمز التحقق",
    "Close modal": "إغلاق النافذة",
    "Search properties": "ابحث عن عقارات",
    "Language settings": "إعدادات اللغة",
    "Notifications": "الإشعارات",
    "Quick links": "روابط سريعة",
    "Post your property": "أضف عقارك",
    "Basic details": "التفاصيل الأساسية",
    "Property title": "عنوان العقار",
    "Select property type": "اختر نوع العقار",
    "Commercial": "تجاري",
    "Pricing and location": "السعر والموقع",
    "Price": "السعر",
    "Location or address": "الموقع أو العنوان",
    "Ready to publish": "جاهز للنشر",
    "We’ve staged the essentials for your next listing.": "جهزنا الأساسيات لإعلانك التالي.",
    "Cancel": "إلغاء",
    "Back": "رجوع",
    "Next": "التالي",
    "Publish listing": "نشر الإعلان",
    "Property Summary": "ملخص العقار",
    "Title:": "العنوان:",
    "Type:": "النوع:",
    "Address:": "العنوان:",
    "Features:": "المزايا:",
    "Property created successfully!": "تم إنشاء العقار بنجاح!",
    "You will be redirected shortly...": "سيتم تحويلك قريبا...",
    "Please fix the following errors:": "يرجى إصلاح الأخطاء التالية:",
    "Type": "النوع",
    "Bathrooms": "الحمامات",
    "Size": "المساحة",
    "Max Guests": "الحد الأقصى للضيوف",
    "Created": "تاريخ الإنشاء",
    "Last Updated": "آخر تحديث",
    "Check-in": "تسجيل الوصول",
    "Checkout": "تسجيل المغادرة",
    "/ night": "/ الليلة",
    "reviews": "تقييمات",
    "English": "الإنجليزية",
    "Arabic": "العربية",
    "Somali": "الصومالية",
    "Homes": "المنازل",
    "Manage Property": "إدارة العقارات",
    "Services": "الخدمات",
    "Become a host": "كن مضيفا",
    "Where": "أين",
    "When": "متى",
    "Who": "من",
    "Search destinations": "ابحث عن وجهات",
    "Any time": "أي وقت",
    "Add guests": "أضف الضيوف",
    "Search": "بحث",
    "Suggested destinations": "وجهات مقترحة",
    "Nearby": "بالقرب منك",
    "Find what's around you": "اعثر على ما حولك",
    "Guests": "الضيوف",
    "Adults": "البالغون",
    "Ages 13+": "من عمر 13 سنة فأكثر",
    "Children": "الأطفال",
    "Ages 2–12": "من عمر 2 إلى 12",
    "Infants": "الرضع",
    "Under 2": "أقل من سنتين",
    "Pets": "الحيوانات الأليفة",
    "Bringing a pet?": "هل ستحضر حيوانا أليفا؟",
    "Clear all": "مسح الكل",
    "Apply": "تطبيق",
    "Dates": "التواريخ",
    "Months": "الأشهر",
    "Flexible": "مرن",
    "Clear": "مسح",
    "Editor's Choice": "اختيار المحرر",
    "The Architecture": "هندسة",
    "of Silence.": "الهدوء.",
    "Explore Private Sanctuaries": "استكشف الملاذات الخاصة",
    "Customer": "العميل",
    "Filters": "الفلاتر",
    "Filter": "فلتر",
    "Bedrooms": "غرف النوم",
    "Any": "أي",
    "Price Range": "نطاق السعر",
    "Min price": "أقل سعر",
    "Max price": "أعلى سعر",
    "Square Feet": "المساحة بالقدم المربع",
    "Min sqft": "أقل مساحة",
    "Max sqft": "أكبر مساحة",
    "Year Built": "سنة البناء",
    "Min Year": "أقل سنة",
    "Max Year": "أعلى سنة",
    "Amenities": "المرافق",
    "Show 142 results": "عرض 142 نتيجة",
    "Find your true Sanctuary": "اعثر على ملاذك الحقيقي",
    "Explore our hand-picked collection of remote and beautiful sanctuaries.": "استكشف مجموعتنا المختارة بعناية من الملاذات الهادئة والجميلة.",
    "Explore GuriGate": "استكشف GuriGate",
    "Verified Comfort": "راحة موثوقة",
    "Every home on Sanctuary is personally inspected for quality and soul.": "يتم فحص كل منزل بعناية للتأكد من الجودة والراحة.",
    "Featured Properties": "العقارات المميزة",
    "View All Properties": "عرض كل العقارات",
    "Guest favourite": "مفضل لدى الضيوف",
    "House": "منزل",
    "Hotel": "فندق",
    "Villa": "فيلا",
    "Apartment": "شقة",
    "Studio": "استوديو",
    "Popular homes in Nairobi": "منازل رائجة في نيروبي",
    "Popular homes in Hargeisa": "منازل رائجة في هرجيسا",
    "Show all (142)": "عرض الكل (142)",
    "Show map": "عرض الخريطة",
    "All Available Properties": "كل العقارات المتاحة",
    "Discover your perfect stay from our curated selection of properties": "اكتشف إقامتك المثالية من مجموعتنا المختارة من العقارات",
    "Hide Filters": "إخفاء الفلاتر",
    "All": "الكل",
    "Property Type": "نوع العقار",
    "Townhouse": "تاون هاوس",
    "Reset filters": "إعادة ضبط الفلاتر",
    "Load more properties": "تحميل المزيد من العقارات",
    "Sort properties": "فرز العقارات",
    "Sort by: Recommended": "الفرز حسب: الموصى به",
    "Price: Low to High": "السعر: من الأقل إلى الأعلى",
    "Price: High to Low": "السعر: من الأعلى إلى الأقل",
    "Rating: High to Low": "التقييم: من الأعلى إلى الأقل",
    "Popular homes in": "منازل رائجة في",
    "Nairobi": "نيروبي",
    "Hargeisa": "هرجيسا",
    "Kenya": "كينيا",
    "Tanzania": "تنزانيا",
    "Somalia": "الصومال",
    "Ethiopia": "إثيوبيا",
    "Malaysia": "ماليزيا",
    "Dar es Salaam": "دار السلام",
    "Mombasa": "مومباسا",
    "Addis Ababa": "أديس أبابا",
    "Kuala Lumpur": "كوالالمبور",
    "Modern Penthouse in Kileleshwa": "بنتهاوس عصري في كيليليشوا",
    "Garden Oasis, Karen": "واحة حديقة في كارين",
    "Luxury Studio in Westlands": "استوديو فاخر في ويستلاندز",
    "Cozy Apartment in Lavington": "شقة مريحة في لافينغتون",
    "Spacious Townhouse in Runda": "تاون هاوس واسع في روندا",
    "Apartment in Nairobi": "شقة في نيروبي",
    "Villa in Nairobi": "فيلا في نيروبي",
    "Studio in Nairobi": "استوديو في نيروبي",
    "Townhouse in Nairobi": "تاون هاوس في نيروبي",
    "Apartment in Hargeisa": "شقة في هرجيسا",
    "Villa in Hargeisa": "فيلا في هرجيسا",
    "for 2 nights": "لمدة ليلتين",
    "FOR SALE": "للبيع",
    "FOR RENT": "للإيجار",
    "SHORT STAY": "إقامة قصيرة",
    "Are you looking to explore a property at your own convenience? Look no further than GuriGate! As Somali Peninsula's first property company with extensive listings for all regions, we offer the ability to buy, sell, or rent a property easily through our app and website. With GuriGate, your dream property is just a click away!": "هل ترغب في استكشاف عقار في الوقت الذي يناسبك؟ GuriGate هو خيارك. بصفتنا أول شركة عقارية في شبه الجزيرة الصومالية بقوائم واسعة لكل المناطق، نمنحك إمكانية شراء أو بيع أو استئجار العقارات بسهولة عبر التطبيق والموقع. مع GuriGate، عقار أحلامك على بعد نقرة واحدة.",
    "Links": "روابط",
    "About us": "من نحن",
    "Terms and Conditions": "الشروط والأحكام",
    "Privacy policy": "سياسة الخصوصية",
    "FAQ": "الأسئلة الشائعة",
    "Contact us": "اتصل بنا",
    "Subscribe to our newsletter": "اشترك في نشرتنا البريدية",
    "Stay updated with curated travel guides, exclusive offers, and latest sanctuary destinations delivered to your inbox.": "ابق على اطلاع بأدلة السفر المختارة والعروض الحصرية وأحدث الوجهات مباشرة في بريدك.",
    "Enter your email": "أدخل بريدك الإلكتروني",
    "Subscribe": "اشترك",
    "By subscribing, you agree to our Privacy Policy and Terms of Service.": "بالاشتراك، فإنك توافق على سياسة الخصوصية وشروط الخدمة.",
    "Connect to Social Media": "تواصل عبر وسائل التواصل",
    "Customer Service Email": "بريد خدمة العملاء",
    "All Rights Reserved.": "جميع الحقوق محفوظة.",
  },
  so: {
    "Choose language": "Dooro luqadda",
    "Help Center": "Xarunta caawinta",
    "It's easy to start hosting and earn extra income.": "Way fududahay inaad martigelin bilowdo oo dakhli dheeraad ah hesho.",
    "Refer a Host": "Soo jeedi martigeliye",
    "Find a co-host": "Raadi la-martigeliye",
    "Find a Co-host": "Raadi la-martigeliye",
    "Gift cards": "Kaararka hadiyadda",
    "Gift Cards": "Kaararka hadiyadda",
    "Log in or sign up": "Gal ama is diiwaangeli",
    "Welcome back": "Ku soo dhawoow mar kale",
    "Premium Member": "Xubin sare",
    "Wishlists": "Liisaska rabitaanka",
    "Trips": "Safarro",
    "Messages": "Fariimo",
    "Profile": "Profile",
    "Account Settings": "Dejinta koontada",
    "Language & Currency": "Luqadda iyo lacagta",
    "Hosting": "Martigelin",
    "Log Out": "Ka bax",
    "Welcome to GuriGate": "Ku soo dhawoow GuriGate",
    "Country code": "Koodhka dalka",
    "Search country or code…": "Raadi dal ama koodh...",
    "Phone number": "Lambarka telefoonka",
    "or": "ama",
    "Email": "Email",
    "Password": "Furaha sirta",
    "Enter your password": "Geli furaha sirta",
    "Remember me": "I xasuuso",
    "Enter your verification code": "Geli koodhka xaqiijinta",
    "Close modal": "Xir daaqadda",
    "Search properties": "Raadi guryo",
    "Language settings": "Dejinta luqadda",
    "Notifications": "Ogeysiisyo",
    "Quick links": "Xiriiriyeyaal degdeg ah",
    "Post your property": "Ku dar gurigaaga",
    "Basic details": "Faahfaahinta aasaasiga ah",
    "Property title": "Cinwaanka guriga",
    "Select property type": "Dooro nooca guriga",
    "Commercial": "Ganacsi",
    "Pricing and location": "Qiime iyo goob",
    "Price": "Qiime",
    "Location or address": "Goob ama cinwaan",
    "Ready to publish": "Diyaar u ah daabicid",
    "We’ve staged the essentials for your next listing.": "Waxaan diyaarinay waxyaabaha muhiimka u ah xayeysiiskaaga xiga.",
    "Cancel": "Jooji",
    "Back": "Dib",
    "Next": "Xiga",
    "Publish listing": "Daabac xayeysiiska",
    "Property Summary": "Soo koobidda guriga",
    "Title:": "Cinwaan:",
    "Type:": "Nooc:",
    "Address:": "Cinwaan:",
    "Features:": "Astaamo:",
    "Property created successfully!": "Guriga si guul leh ayaa loo abuuray!",
    "You will be redirected shortly...": "Dhawaan ayaa laguu wareejin doonaa...",
    "Please fix the following errors:": "Fadlan sax khaladaadka soo socda:",
    "Type": "Nooc",
    "Bathrooms": "Musqulo",
    "Size": "Cabbir",
    "Max Guests": "Martida ugu badan",
    "Created": "La abuuray",
    "Last Updated": "Markii ugu dambeysay la cusbooneysiiyay",
    "Check-in": "Gelitaan",
    "Checkout": "Bixitaan",
    "/ night": "/ habeenkii",
    "reviews": "faallooyin",
    "English": "Ingiriisi",
    "Arabic": "Carabi",
    "Somali": "Soomaali",
    "Homes": "Guryo",
    "Manage Property": "Maamul Guri",
    "Services": "Adeegyo",
    "Become a host": "Noqo martigeliye",
    "Where": "Halkee",
    "When": "Goorma",
    "Who": "Yaa",
    "Search destinations": "Raadi meelaha loo socdo",
    "Any time": "Waqti kasta",
    "Add guests": "Ku dar marti",
    "Search": "Raadi",
    "Suggested destinations": "Meelo la soo jeediyay",
    "Nearby": "Dhow",
    "Find what's around you": "Raadi waxa kugu dhow",
    "Guests": "Martida",
    "Adults": "Dadka waaweyn",
    "Ages 13+": "Da'da 13+",
    "Children": "Carruur",
    "Ages 2–12": "Da'da 2-12",
    "Infants": "Ilmo yar",
    "Under 2": "Ka yar 2 sano",
    "Pets": "Xayawaan",
    "Bringing a pet?": "Ma wadataa xayawaan?",
    "Clear all": "Nadiifi dhammaan",
    "Apply": "Codso",
    "Dates": "Taariikho",
    "Months": "Bilaha",
    "Flexible": "Dabacsan",
    "Clear": "Nadiifi",
    "Editor's Choice": "Xulashada tifaftiraha",
    "The Architecture": "Naqshadda",
    "of Silence.": "xasilloonida.",
    "Explore Private Sanctuaries": "Sahami hoyo gaar ah",
    "Customer": "Macaamiil",
    "Filters": "Shaandheyn",
    "Filter": "Shaandhee",
    "Bedrooms": "Qolalka jiifka",
    "Any": "Kasta",
    "Price Range": "Xadka qiimaha",
    "Min price": "Qiimaha ugu yar",
    "Max price": "Qiimaha ugu badan",
    "Square Feet": "Cabbirka ft²",
    "Min sqft": "Ft² ugu yar",
    "Max sqft": "Ft² ugu badan",
    "Year Built": "Sannadka la dhisay",
    "Min Year": "Sannadka ugu yar",
    "Max Year": "Sannadka ugu badan",
    "Amenities": "Adeegyada guriga",
    "Show 142 results": "Muuji 142 natiijo",
    "Find your true Sanctuary": "Hel hoygaaga dhabta ah",
    "Explore our hand-picked collection of remote and beautiful sanctuaries.": "Sahami ururintayada si taxaddar leh loo doortay ee hoyo qurux badan oo deggan.",
    "Explore GuriGate": "Sahami GuriGate",
    "Verified Comfort": "Raaxo la xaqiijiyay",
    "Every home on Sanctuary is personally inspected for quality and soul.": "Guri kasta si gaar ah ayaa loogu hubiyaa tayada iyo raaxada.",
    "Featured Properties": "Guryaha la xushay",
    "View All Properties": "Eeg dhammaan guryaha",
    "Guest favourite": "Martidu jeceshahay",
    "House": "Guri",
    "Hotel": "Hoteel",
    "Villa": "Villa",
    "Apartment": "Abaartman",
    "Studio": "Istoodiyo",
    "Popular homes in Nairobi": "Guryaha caanka ah ee Nairobi",
    "Popular homes in Hargeisa": "Guryaha caanka ah ee Hargeysa",
    "Show all (142)": "Muuji dhammaan (142)",
    "Show map": "Muuji khariidadda",
    "All Available Properties": "Dhammaan guryaha la heli karo",
    "Discover your perfect stay from our curated selection of properties": "Ka hel joogitaankaaga ku habboon guryaha aan kuu xulnay",
    "Hide Filters": "Qari shaandheynta",
    "All": "Dhammaan",
    "Property Type": "Nooca guriga",
    "Townhouse": "Guri saf ah",
    "Reset filters": "Dib u celi shaandheynta",
    "Load more properties": "Soo rar guryo dheeraad ah",
    "Sort properties": "Kala saar guryaha",
    "Sort by: Recommended": "Kala saar: Lagu taliyay",
    "Price: Low to High": "Qiime: hoose ilaa sare",
    "Price: High to Low": "Qiime: sare ilaa hoose",
    "Rating: High to Low": "Qiimeyn: sare ilaa hoose",
    "Nairobi": "Nairobi",
    "Hargeisa": "Hargeysa",
    "Kenya": "Kenya",
    "Tanzania": "Tansaaniya",
    "Somalia": "Soomaaliya",
    "Ethiopia": "Itoobiya",
    "Malaysia": "Malaysia",
    "Dar es Salaam": "Daarusalaam",
    "Mombasa": "Mombasa",
    "Addis Ababa": "Addis Ababa",
    "Kuala Lumpur": "Kuala Lumpur",
    "Modern Penthouse in Kileleshwa": "Guri dabaq sare oo casri ah Kileleshwa",
    "Garden Oasis, Karen": "Beer deggan oo ku taal Karen",
    "Luxury Studio in Westlands": "Istoodiyo raaxo leh oo Westlands ah",
    "Cozy Apartment in Lavington": "Abaartman raaxo leh oo Lavington ah",
    "Spacious Townhouse in Runda": "Guri saf ah oo ballaaran oo Runda ah",
    "Apartment in Nairobi": "Abaartman ku yaal Nairobi",
    "Villa in Nairobi": "Villa ku taal Nairobi",
    "Studio in Nairobi": "Istoodiyo ku yaal Nairobi",
    "Townhouse in Nairobi": "Guri saf ah oo ku yaal Nairobi",
    "Apartment in Hargeisa": "Abaartman ku yaal Hargeysa",
    "Villa in Hargeisa": "Villa ku taal Hargeysa",
    "for 2 nights": "2 habeen",
    "FOR SALE": "IIB AH",
    "FOR RENT": "KIRO AH",
    "SHORT STAY": "JOOGITAAN GAABAN",
    "Are you looking to explore a property at your own convenience? Look no further than GuriGate! As Somali Peninsula's first property company with extensive listings for all regions, we offer the ability to buy, sell, or rent a property easily through our app and website. With GuriGate, your dream property is just a click away!": "Ma rabtaa inaad guri u daawato si adiga kuu fudud? GuriGate ayaa kuu diyaar ah. Annagoo ah shirkaddii ugu horreysay ee guryaha ee Jasiiradda Soomaaliyeed oo leh liisyo badan oo gobollada oo dhan ah, waxaan kuu fududeyneynaa iibsashada, iibinta, ama kiraynta guri adigoo adeegsanaya app-ka iyo website-ka. GuriGate, guriga riyadaadu waa hal gujin oo keliya.",
    "Links": "Xiriiriyeyaal",
    "About us": "Nagu saabsan",
    "Terms and Conditions": "Shuruudaha iyo xeerarka",
    "Privacy policy": "Siyaasadda asturnaanta",
    "FAQ": "Su'aalaha badanaa la isweydiiyo",
    "Contact us": "Nala soo xiriir",
    "Subscribe to our newsletter": "Isku qor warsidahayaga",
    "Stay updated with curated travel guides, exclusive offers, and latest sanctuary destinations delivered to your inbox.": "La soco hagayaasha safarka, dalabyada gaarka ah, iyo meelaha cusub ee hoyga oo laguugu soo diro email-kaaga.",
    "Enter your email": "Geli email-kaaga",
    "Subscribe": "Isku qor",
    "By subscribing, you agree to our Privacy Policy and Terms of Service.": "Markaad is qorto, waxaad oggolaanaysaa Siyaasadda Asturnaanta iyo Shuruudaha Adeegga.",
    "Connect to Social Media": "Ku xirnow baraha bulshada",
    "Customer Service Email": "Email-ka adeegga macaamiisha",
    "All Rights Reserved.": "Dhammaan xuquuqdu way dhowrsan tahay.",
  },
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function translateText(value: string, language: LanguageCode) {
  const clean = normalizeText(value);

  if (language === "en" || !clean) {
    return value;
  }

  const dictionary = translations[language];
  const translated = dictionary[clean];

  if (translated) {
    return value.replace(clean, translated);
  }

  const propertiesMatch = clean.match(/^(\d+) properties available$/);
  if (propertiesMatch) {
    return language === "ar"
      ? `${propertiesMatch[1]} عقارا متاحا`
      : `${propertiesMatch[1]} guri ayaa la heli karaa`;
  }

  const showAllMatch = clean.match(/^Show all \((\d+)\)$/);
  if (showAllMatch) {
    return language === "ar"
      ? `عرض الكل (${showAllMatch[1]})`
      : `Muuji dhammaan (${showAllMatch[1]})`;
  }

  const popularHomesMatch = clean.match(/^Popular homes in (.+)$/);
  if (popularHomesMatch) {
    const city = dictionary[popularHomesMatch[1]] ?? popularHomesMatch[1];
    return language === "ar" ? `منازل رائجة في ${city}` : `Guryaha caanka ah ee ${city}`;
  }

  return value;
}

function shouldSkipNode(node: Node) {
  const parent = node.parentElement;
  if (!parent) {
    return true;
  }

  return Boolean(parent.closest("script, style, textarea, code, pre, [data-no-translate]"));
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const stored = window.localStorage.getItem("gurigate-language");
    return stored === "ar" || stored === "so" ? stored : "en";
  });

  const textOriginals = useRef<WeakMap<Text, string>>(new WeakMap());
  const translating = useRef(false);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
  };

  useEffect(() => {
    window.localStorage.setItem("gurigate-language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";

    const translateRoot = (root: ParentNode) => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let node = walker.nextNode();

      while (node) {
        textNodes.push(node as Text);
        node = walker.nextNode();
      }

      textNodes.forEach((textNode) => {
        if (shouldSkipNode(textNode)) {
          return;
        }

        const original = textOriginals.current.get(textNode) ?? textNode.nodeValue ?? "";
        textOriginals.current.set(textNode, original);
        const translated = translateText(original, language);
        if (textNode.nodeValue !== translated) {
          textNode.nodeValue = translated;
        }
      });

      const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll("*"))] : Array.from(root.querySelectorAll("*"));
      elements.forEach((element) => {
        if (element.closest("script, style, textarea, code, pre, [data-no-translate]")) {
          return;
        }

        ["placeholder", "title", "aria-label"].forEach((attribute) => {
          const value = element.getAttribute(attribute);
          if (!value) {
            return;
          }

          const originalAttribute = `data-i18n-original-${attribute}`;
          const original = element.getAttribute(originalAttribute) ?? value;
          const translated = translateText(original, language);
          element.setAttribute(originalAttribute, original);
          if (value !== translated) {
            element.setAttribute(attribute, translated);
          }
        });
      });
    };

    const applyTranslations = (root: ParentNode) => {
      translating.current = true;
      translateRoot(root);
      translating.current = false;
    };

    applyTranslations(document.body);

    const observer = new MutationObserver((mutations) => {
      if (translating.current) {
        return;
      }

      mutations.forEach((mutation) => {
        if (mutation.type === "characterData" && mutation.target.parentElement) {
          applyTranslations(mutation.target.parentElement);
          return;
        }

        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            applyTranslations(node as Element);
          }

          if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
            applyTranslations(node.parentElement);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
