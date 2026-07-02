import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UserRoundPen, Settings2, BellDot, Gift, TentTree, Settings, Link,
  ChevronDown, Upload, Eye, EyeOff, Check, X,
  Lock, Mail, Sun, Moon, Monitor,
} from "lucide-react";
import { IntegrationsContent } from "./IntegrationsPage";
import { NotificationsContent } from "./NotificationsPage";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────
interface SidebarItem { label: string; icon: React.ReactNode; }
interface CountryData  { name: string; flag: string; cities: string[]; }

interface ProfileForm {
  firstName: string;
  lastName:  string;
  country:   string;
  city:      string;
  email:     string;
  language:  string;
  timeZone:  string;
  phone:     string;
  occupation: string;
}

interface PasswordForm {
  oldPassword:     string;
  newPassword:     string;
  confirmPassword: string;
}

// ─── Country + City Data ──────────────────────────────────────────────────────
const COUNTRIES: CountryData[] = [
  // Africa
  { name: "Somalia",        flag: "🇸🇴", cities: ["Mogadishu","Hargeisa","Kismayo","Bosaso","Baidoa","Galkayo","Berbera","Marka"] },
  { name: "Kenya",          flag: "🇰🇪", cities: ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Thika","Malindi","Kitale"] },
  { name: "Ethiopia",       flag: "🇪🇹", cities: ["Addis Ababa","Dire Dawa","Gondar","Mekelle","Adama","Hawassa","Bahir Dar","Dessie"] },
  { name: "Djibouti",       flag: "🇩🇯", cities: ["Djibouti City","Ali Sabieh","Tadjoura","Obock","Dikhil","Arta"] },
  { name: "Eritrea",        flag: "🇪🇷", cities: ["Asmara","Keren","Massawa","Assab","Mendefera","Barentu"] },
  { name: "Uganda",         flag: "🇺🇬", cities: ["Kampala","Gulu","Lira","Mbarara","Jinja","Entebbe","Mbale","Masaka"] },
  { name: "Tanzania",       flag: "🇹🇿", cities: ["Dar es Salaam","Dodoma","Arusha","Mwanza","Zanzibar","Tanga","Moshi","Morogoro"] },
  { name: "Rwanda",         flag: "🇷🇼", cities: ["Kigali","Butare","Gisenyi","Ruhengeri","Byumba","Cyangugu","Gitarama"] },
  { name: "Burundi",        flag: "🇧🇮", cities: ["Bujumbura","Gitega","Ngozi","Rutana","Muyinga","Bururi"] },
  { name: "South Sudan",    flag: "🇸🇸", cities: ["Juba","Malakal","Wau","Yei","Bor"] },
  { name: "Sudan",          flag: "🇸🇩", cities: ["Khartoum","Omdurman","Port Sudan","Kassala","Nyala","El Obeid"] },
  { name: "Egypt",          flag: "🇪🇬", cities: ["Cairo","Alexandria","Giza","Shubra El Kheima","Port Said","Suez","Luxor","Aswan"] },
  { name: "Libya",          flag: "🇱🇾", cities: ["Tripoli","Benghazi","Misrata","Bayda","Zawiya","Ajdabiya"] },
  { name: "Tunisia",        flag: "🇹🇳", cities: ["Tunis","Sfax","Sousse","Kairouan","Bizerte","Gabès"] },
  { name: "Algeria",        flag: "🇩🇿", cities: ["Algiers","Oran","Constantine","Annaba","Blida","Batna"] },
  { name: "Morocco",        flag: "🇲🇦", cities: ["Casablanca","Rabat","Fez","Marrakech","Tangier","Salé","Meknes"] },
  { name: "Nigeria",        flag: "🇳🇬", cities: ["Lagos","Abuja","Kano","Ibadan","Kaduna","Port Harcourt","Benin City"] },
  { name: "Ghana",          flag: "🇬🇭", cities: ["Accra","Kumasi","Tamale","Takoradi","Obuasi","Tema"] },
  { name: "Ivory Coast",    flag: "🇨🇮", cities: ["Abidjan","Bouaké","Daloa","Yamoussoukro","Korhogo","San Pedro"] },
  { name: "Senegal",        flag: "🇸🇳", cities: ["Dakar","Pikine","Thiès","Kaolack","Ziguinchor","Saint-Louis"] },
  { name: "Mali",           flag: "🇲🇱", cities: ["Bamako","Sikasso","Mopti","Koutiala","Ségou","Kayes"] },
  { name: "Niger",          flag: "🇳🇪", cities: ["Niamey","Zinder","Maradi","Agadez","Tahoua","Dosso"] },
  { name: "Burkina Faso",   flag: "🇧🇫", cities: ["Ouagadougou","Bobo-Dioulasso","Koudougou","Ouahigouya","Banfora","Dédougou"] },
  { name: "Chad",           flag: "🇹🇩", cities: ["N'Djamena","Moundou","Sarh","Abéché","Doba","Kelo"] },
  { name: "Cameroon",       flag: "🇨🇲", cities: ["Douala","Yaoundé","Garoua","Maroua","Bamenda","Bafoussam"] },
  { name: "Central African Republic", flag: "🇨🇫", cities: ["Bangui","Bimbo","Mbaïki","Bambari","Berbérati","Kaga-Bandoro"] },
  { name: "Equatorial Guinea", flag: "🇬🇶", cities: ["Malabo","Bata","Ebebiyín","Aconibe","Luba"] },
  { name: "Gabon",          flag: "🇬🇦", cities: ["Libreville","Port-Gentil","Franceville","Oyem","Moanda","Mouila"] },
  { name: "Republic of the Congo", flag: "🇨🇬", cities: ["Brazzaville","Pointe-Noire","Dolisie","Nkayi","Owando","Madingou"] },
  { name: "Democratic Republic of the Congo", flag: "🇨🇩", cities: ["Kinshasa","Lubumbashi","Mbuji-Mayi","Kisangani","Kananga","Goma"] },
  { name: "Angola",         flag: "🇦🇴", cities: ["Luanda","Huambo","Lobito","Kuito","Lubango","Namibe"] },
  { name: "Namibia",        flag: "🇳🇦", cities: ["Windhoek","Swakopmund","Walvis Bay","Oshakati","Rundu","Otjiwarongo"] },
  { name: "Botswana",       flag: "🇧🇼", cities: ["Gaborone","Francistown","Molepolole","Maun","Serowe","Kanye"] },
  { name: "Zimbabwe",       flag: "🇿🇼", cities: ["Harare","Bulawayo","Chitungwiza","Mutare","Gweru","Kwekwe"] },
  { name: "Zambia",         flag: "🇿🇲", cities: ["Lusaka","Kitwe","Ndola","Kabwe","Chingola","Mufulira"] },
  { name: "Malawi",         flag: "🇲🇼", cities: ["Lilongwe","Blantyre","Mzuzu","Zomba","Kasungu","Mangochi"] },
  { name: "Mozambique",     flag: "🇲🇿", cities: ["Maputo","Matola","Nampula","Beira","Chimoio","Quelimane"] },
  { name: "Eswatini",       flag: "🇸🇿", cities: ["Mbabane","Manzini","Big Bend","Lobamba","Siteki","Piggs Peak"] },
  { name: "Lesotho",        flag: "🇱🇸", cities: ["Maseru","Mafeteng","Leribe","Mohale's Hoek","Quthing","Berea"] },
  { name: "Madagascar",     flag: "🇲🇬", cities: ["Antananarivo","Toamasina","Antsirabe","Fianarantsoa","Mahajanga","Toliara"] },
  { name: "Mauritius",      flag: "🇲🇺", cities: ["Port Louis","Curepipe","Beau Bassin-Rose Hill","Vacoas-Phoenix","Quatre Bornes","Goodlands"] },
  { name: "Seychelles",     flag: "🇸🇨", cities: ["Victoria","Anse Royale","Beau Vallon","Takamaka","Anse Boileau","La Réunion"] },
  { name: "Comoros",        flag: "🇰🇲", cities: ["Moroni","Mutsamudu","Fomboni","Domoni","Mitsamiouli"] },
  { name: "Cape Verde",     flag: "🇨🇻", cities: ["Praia","Mindelo","Assomada","Santa Maria","São Filipe","Cidade Velha"] },
  { name: "Western Sahara", flag: "🇪🇭", cities: ["Laayoune","Dakhla","Smara","Cape Bojador","Al Mahbes","Guelta Zemmur"] },
  
  // Asia
  { name: "China",          flag: "🇨🇳", cities: ["Beijing","Shanghai","Guangzhou","Shenzhen","Chongqing","Tianjin","Wuhan","Dongguan","Shenyang","Hangzhou"] },
  { name: "India",          flag: "🇮🇳", cities: ["Mumbai","Delhi","Bangalore","Hyderabad","Ahmedabad","Chennai","Kolkata","Surat","Pune","Jaipur"] },
  { name: "Pakistan",       flag: "🇵🇰", cities: ["Karachi","Lahore","Faisalabad","Rawalpindi","Gujranwala","Peshawar","Multan","Islamabad","Quetta","Sialkot"] },
  { name: "Bangladesh",     flag: "🇧🇩", cities: ["Dhaka","Chittagong","Khulna","Rajshahi","Sylhet","Barisal","Rangpur","Mymensingh","Comilla","Narayanganj"] },
  { name: "Japan",          flag: "🇯🇵", cities: ["Tokyo","Osaka","Yokohama","Nagoya","Sapporo","Kobe","Kyoto","Fukuoka","Kawasaki","Saitama"] },
  { name: "Philippines",    flag: "🇵🇭", cities: ["Manila","Quezon City","Davao City","Caloocan","Cebu City","Zamboanga","Antipolo","Taguig","Pasig","Cagayan de Oro"] },
  { name: "Vietnam",        flag: "🇻🇳", cities: ["Ho Chi Minh City","Hanoi","Da Nang","Bien Hoa","Hue","Nha Trang","Can Tho","Rach Gia","Buon Ma Thuot","Vung Tau"] },
  { name: "Indonesia",      flag: "🇮🇩", cities: ["Jakarta","Surabaya","Bandung","Bekasi","Medan","Tangerang","Depok","Semarang","Palembang","Makassar"] },
  { name: "Thailand",       flag: "🇹🇭", cities: ["Bangkok","Nonthaburi","Pattaya","Chiang Mai","Phuket","Hat Yai","Pak Kret","Udon Thani","Khon Kaen","Nakhon Ratchasima"] },
  { name: "Myanmar",        flag: "🇲🇲", cities: ["Yangon","Mandalay","Naypyidaw","Mawlamyine","Pathein","Monywa","Meiktila","Sittwe","Taunggyi","Myeik"] },
  { name: "South Korea",    flag: "🇰🇷", cities: ["Seoul","Busan","Incheon","Daegu","Daejeon","Gwangju","Suwon","Ulsan","Changwon","Goyang"] },
  { name: "North Korea",    flag: "🇰🇵", cities: ["Pyongyang","Hamhung","Nampo","Chongjin","Wonsan","Sinuiju","Sariwon","Kaesong","Hyesan","Songnim"] },
  { name: "Taiwan",         flag: "🇹🇼", cities: ["Taipei","Kaohsiung","Taichung","New Taipei","Tainan","Hsinchu","Taoyuan","Keelung","Chiayi","Changhua"] },
  { name: "Hong Kong",      flag: "🇭🇰", cities: ["Hong Kong","Kowloon","Victoria","Sha Tin","Tsuen Wan","Yuen Long","Tuen Mun","Tai Po","Fanling","Sai Kung"] },
  { name: "Singapore",      flag: "🇸🇬", cities: ["Singapore","Bedok","Jurong West","Tampines","Woodlands","Sengkang","Hougang","Yishun","Punggol","Bishan"] },
  { name: "Malaysia",       flag: "🇲🇾", cities: ["Kuala Lumpur","George Town","Ipoh","Shah Alam","Petaling Jaya","Johor Bahru","Seremban","Kuching","Kota Kinabalu","Klang"] },
  { name: "Cambodia",       flag: "🇰🇭", cities: ["Phnom Penh","Siem Reap","Battambang","Sihanoukville","Poipet","Kampong Cham","Pursat","Ta Khmau","Kampot","Kampong Speu"] },
  { name: "Laos",           flag: "🇱🇦", cities: ["Vientiane","Pakse","Savannakhet","Luang Prabang","Thakhek","Xam Neua","Muang Xay","Phonsavan","Salavan","Vang Vieng"] },
  { name: "Brunei",         flag: "🇧🇳", cities: ["Bandar Seri Begawan","Kuala Belait","Seria","Tutong","Bangar","Lumut","Sukang","Panaga","Kuala Lurah","Pekan Tutong"] },
  { name: "Timor-Leste",    flag: "🇹🇱", cities: ["Dili","Baucau","Suai","Liquiçá","Maliana","Aileu","Ainaro","Viqueque","Same","Ermera"] },
  { name: "Mongolia",       flag: "🇲🇳", cities: ["Ulaanbaatar","Erdenet","Darkhan","Choibalsan","Murun","Bayanhongor","Olgii","Hovd","Tsetserleg","Ulaangom"] },
  { name: "Nepal",          flag: "🇳🇵", cities: ["Kathmandu","Pokhara","Lalitpur","Bharatpur","Biratnagar","Birgunj","Dharan","Hetauda","Janakpur","Bhimdatta"] },
  { name: "Bhutan",         flag: "🇧🇹", cities: ["Thimphu","Punakha","Phuntsholing","Samdrup Jongkhar","Geylegphug","Trongsa","Mongar","Trashigang","Jakar","Zhemgang"] },
  { name: "Sri Lanka",      flag: "🇱🇰", cities: ["Colombo","Dehiwala-Mount Lavinia","Moratuwa","Negombo","Kandy","Kalmunai","Kotte","Galle","Trincomalee","Anuradhapura"] },
  { name: "Maldives",       flag: "🇲🇻", cities: ["Malé","Villingili","Maafushi","Hulhumalé","Addu City","Fuvahmulah","Dhidhdhoo","Kulhudhuffushi","Naifaru","Thinadhoo"] },
  { name: "Afghanistan",    flag: "🇦🇫", cities: ["Kabul","Herat","Kandahar","Mazar-i-Sharif","Kunduz","Jalalabad","Lashkar Gah","Taloqan","Khost","Ghazni"] },
  { name: "Iran",           flag: "🇮🇷", cities: ["Tehran","Mashhad","Isfahan","Karaj","Shiraz","Tabriz","Qom","Kermanshah","Urmia","Rasht"] },
  { name: "Iraq",           flag: "🇮🇶", cities: ["Baghdad","Basra","Mosul","Erbil","Sulaymaniyah","Najaf","Karbala","Kirkuk","Dhi Qar","Duhok"] },
  { name: "Turkey",         flag: "🇹🇷", cities: ["Istanbul","Ankara","Izmir","Bursa","Adana","Gaziantep","Konya","Antalya","Kocaeli","Mersin"] },
  { name: "Syria",          flag: "🇸🇾", cities: ["Damascus","Aleppo","Homs","Latakia","Deir ez-Zor","Hama","Raqqa","Daraa","Idlib","Tartus"] },
  { name: "Lebanon",        flag: "🇱🇧", cities: ["Beirut","Tripoli","Sidon","Tyre","Jounieh","Zahle","Jbeil","Baabda","Aley","Batroun"] },
  { name: "Jordan",         flag: "🇯🇴", cities: ["Amman","Irbid","Zarqa","Aqaba","Madaba","Karak","Tafilah","Jerash","Ajloun","Ma'an"] },
  { name: "Israel",         flag: "🇮🇱", cities: ["Jerusalem","Tel Aviv","Haifa","Rishon LeZion","Ashdod","Beersheba","Petah Tikva","Netanya","Holon","Bnei Brak"] },
  { name: "Palestine",      flag: "🇵🇸", cities: ["Gaza","Hebron","Nablus","Rafah","Jericho","Ramallah","Bethlehem","Khan Yunis","Jabalia","Tulkarm"] },
  { name: "Saudi Arabia",   flag: "🇸🇦", cities: ["Riyadh","Jeddah","Mecca","Medina","Dammam","Taif","Tabuk","Buraidah","Khobar","Abha"] },
  { name: "Yemen",          flag: "🇾🇪", cities: ["Sana'a","Aden","Taiz","Al Hudaydah","Ibb","Dhamar","Mukalla","Al Bayda","Hajjah","Sadah"] },
  { name: "Oman",           flag: "🇴🇲", cities: ["Muscat","Seeb","Salalah","Bawshar","Sohar","Suwayq","Ibra","Saham","Nizwa","Barka"] },
  { name: "United Arab Emirates", flag: "🇦🇪", cities: ["Dubai","Abu Dhabi","Sharjah","Ajman","Ras Al Khaimah","Fujairah","Umm Al Quwain","Al Ain","Khor Fakkan","Kalba"] },
  { name: "Qatar",          flag: "🇶🇦", cities: ["Doha","Al Rayyan","Umm Salal","Al Wakrah","Al Khor","Dukhan","Shahaniya","Mesaieed","Al Daayen","Al Shamal"] },
  { name: "Kuwait",         flag: "🇰🇼", cities: ["Kuwait City","Al Ahmadi","Hawalli","Sabah as Salim","Al Farwaniyah","Al Jahra","Mubarak Al Kabeer","Al Wafrah","Khaitan","Salmiya"] },
  { name: "Bahrain",        flag: "🇧🇭", cities: ["Manama","Riffa","Muharraq","Hamad Town","A'ali","Isa Town","Sitra","Budaiya","Jidd Hafs","Al-Malikiyah"] },
  { name: "Cyprus",         flag: "🇨🇾", cities: ["Nicosia","Limassol","Larnaca","Paphos","Famagusta","Kyrenia","Morphou","Paralimni","Peyia","Polis"] },
  { name: "Georgia",        flag: "🇬🇪", cities: ["Tbilisi","Batumi","Kutaisi","Rustavi","Sukhumi","Gori","Poti","Zugdidi","Samtredia","Marneuli"] },
  { name: "Armenia",        flag: "🇦🇲", cities: ["Yerevan","Gyumri","Vanadzor","Vagharshapat","Abovyan","Kapan","Hrazdan","Armavir","Gavar","Goris"] },
  { name: "Azerbaijan",     flag: "🇦🇿", cities: ["Baku","Ganja","Sumqayit","Mingachevir","Lankaran","Shirvan","Shaki","Yevlakh","Nakhchivan","Khankendi"] },
  { name: "Kazakhstan",     flag: "🇰🇿", cities: ["Almaty","Shymkent","Nur-Sultan","Aktobe","Taraz","Pavlodar","Ust-Kamenogorsk","Semey","Atyrau","Kostanay"] },
  { name: "Uzbekistan",     flag: "🇺🇿", cities: ["Tashkent","Namangan","Samarkand","Andijan","Bukhara","Fergana","Qarshi","Kokand","Urgench","Jizzakh"] },
  { name: "Turkmenistan",   flag: "🇹🇲", cities: ["Ashgabat","Turkmenbashi","Dashoguz","Mary","Bayramaly","Balkanabat","Tejen","Atamyrat","Serdar","Köneürgench"] },
  { name: "Tajikistan",     flag: "🇹🇯", cities: ["Dushanbe","Khujand","Kulob","Kurgan-Tyube","Istaravshan","Kanibadam","Isfara","Panjakent","Vakhdat","Tursunzoda"] },
  { name: "Kyrgyzstan",     flag: "🇰🇬", cities: ["Bishkek","Osh","Jalal-Abad","Karakol","Tokmok","Uzgen","Naryn","Talas","Balykchy","Kara-Balta"] },
  
  // Europe
  { name: "Russia",         flag: "🇷🇺", cities: ["Moscow","Saint Petersburg","Novosibirsk","Yekaterinburg","Nizhny Novgorod","Kazan","Chelyabinsk","Omsk","Samara","Rostov-on-Don"] },
  { name: "Germany",        flag: "🇩🇪", cities: ["Berlin","Hamburg","Munich","Cologne","Frankfurt","Stuttgart","Düsseldorf","Dortmund","Essen","Leipzig"] },
  { name: "United Kingdom", flag: "🇬🇧", cities: ["London","Birmingham","Manchester","Glasgow","Leeds","Liverpool","Bristol","Edinburgh","Sheffield","Leicester"] },
  { name: "France",         flag: "🇫🇷", cities: ["Paris","Marseille","Lyon","Toulouse","Nice","Nantes","Montpellier","Strasbourg","Bordeaux","Lille"] },
  { name: "Italy",          flag: "🇮🇹", cities: ["Rome","Milan","Naples","Turin","Palermo","Genoa","Bologna","Florence","Bari","Catania"] },
  { name: "Spain",          flag: "🇪🇸", cities: ["Madrid","Barcelona","Valencia","Seville","Bilbao","Malaga","Murcia","Palma","Las Palmas","Zaragoza"] },
  { name: "Netherlands",    flag: "🇳🇱", cities: ["Amsterdam","Rotterdam","The Hague","Utrecht","Eindhoven","Tilburg","Groningen","Almere","Breda","Nijmegen"] },
  { name: "Belgium",        flag: "🇧🇪", cities: ["Brussels","Antwerp","Ghent","Charleroi","Liège","Bruges","Namur","Leuven","Mons","Aalst"] },
  { name: "Austria",        flag: "🇦🇹", cities: ["Vienna","Graz","Linz","Salzburg","Innsbruck","Klagenfurt","Villach","Wels","Sankt Pölten","Dornbirn"] },
  { name: "Switzerland",    flag: "🇨🇭", cities: ["Zurich","Geneva","Basel","Bern","Lausanne","Winterthur","St. Gallen","Lucerne","Lugano","Biel/Bienne"] },
  { name: "Poland",         flag: "🇵🇱", cities: ["Warsaw","Kraków","Łódź","Wrocław","Poznań","Gdańsk","Szczecin","Bydgoszcz","Lublin","Katowice"] },
  { name: "Czech Republic",  flag: "🇨🇿", cities: ["Prague","Brno","Ostrava","Plzeň","Liberec","Olomouc","Budweis","Hradec Králové","Ústí nad Labem","Pardubice"] },
  { name: "Hungary",        flag: "🇭🇺", cities: ["Budapest","Debrecen","Szeged","Miskolc","Pécs","Győr","Nyíregyháza","Kecskemét","Szolnok","Székesfehérvár"] },
  { name: "Romania",        flag: "🇷🇴", cities: ["Bucharest","Cluj-Napoca","Timișoara","Iași","Constanța","Craiova","Ploiești","Brașov","Galați","Brăila"] },
  { name: "Bulgaria",       flag: "🇧🇬", cities: ["Sofia","Plovdiv","Varna","Burgas","Ruse","Stara Zagora","Pleven","Sliven","Dobrich","Shumen"] },
  { name: "Serbia",         flag: "🇷🇸", cities: ["Belgrade","Novi Sad","Niš","Kragujevac","Subotica","Zrenjanin","Pančevo","Čačak","Kruševac","Novi Pazar"] },
  { name: "Croatia",        flag: "🇭🇷", cities: ["Zagreb","Split","Rijeka","Osijek","Zadar","Pula","Slavonski Brod","Karlovac","Varaždin","Dubrovnik"] },
  { name: "Slovenia",       flag: "🇸🇮", cities: ["Ljubljana","Maribor","Celje","Kranj","Velenje","Koper","Nova Gorica","Kranjska Gora","Ptuj","Domžale"] },
  { name: "Bosnia and Herzegovina", flag: "🇧🇦", cities: ["Sarajevo","Banja Luka","Zenica","Tuzla","Mostar","Prijedor","Bihać","Brčko","Bijeljina","Trebinje"] },
  { name: "Montenegro",     flag: "🇲🇪", cities: ["Podgorica","Nikšić","Herceg Novi","Bar","Budva","Cetinje","Bijelo Polje","Berane","Kotor","Ulcinj"] },
  { name: "North Macedonia", flag: "🇲🇰", cities: ["Skopje","Bitola","Kumanovo","Prilep","Tetovo","Veles","Štip","Ohrid","Gostivar","Strumica"] },
  { name: "Albania",        flag: "🇦🇱", cities: ["Tirana","Durrës","Vlorë","Elbasan","Shkodër","Korçë","Fier","Berat","Lushnjë","Pogradec"] },
  { name: "Greece",         flag: "🇬🇷", cities: ["Athens","Thessaloniki","Patras","Piraeus","Larissa","Heraklion","Volos","Ioannina","Thessaloniki","Kavala"] },
  { name: "Portugal",       flag: "🇵🇹", cities: ["Lisbon","Porto","Amadora","Braga","Setúbal","Coimbra","Funchal","Almada","Vila Nova de Gaia","Barreiro"] },
  { name: "Ireland",        flag: "🇮🇪", cities: ["Dublin","Cork","Limerick","Galway","Waterford","Drogheda","Dundalk","Swords","Navan","Sligo"] },
  { name: "Denmark",        flag: "🇩🇰", cities: ["Copenhagen","Aarhus","Odense","Aalborg","Esbjerg","Randers","Kolding","Horsens","Vejle","Roskilde"] },
  { name: "Sweden",         flag: "🇸🇪", cities: ["Stockholm","Gothenburg","Malmö","Uppsala","Västerås","Örebro","Linköping","Helsingborg","Jönköping","Norrköping"] },
  { name: "Norway",         flag: "🇳🇴", cities: ["Oslo","Bergen","Trondheim","Stavanger","Kristiansand","Fredrikstad","Tromsø","Sandnes","Drammen","Skien"] },
  { name: "Finland",        flag: "🇫🇮", cities: ["Helsinki","Espoo","Tampere","Vantaa","Oulu","Turku","Jyväskylä","Lahti","Kuopio","Pori"] },
  { name: "Iceland",        flag: "🇮🇸", cities: ["Reykjavik","Kópavogur","Hafnarfjörður","Akureyri","Reykjanesbær","Garðabær","Mosfellsbær","Selfoss","Stokkseyri","Grindavík"] },
  { name: "Estonia",        flag: "🇪🇪", cities: ["Tallinn","Tartu","Narva","Pärnu","Kohtla-Järve","Viljandi","Maardu","Rakvere","Sillamäe","Kuressaare"] },
  { name: "Latvia",         flag: "🇱🇻", cities: ["Riga","Daugavpils","Liepāja","Jelgava","Jūrmala","Ventspils","Rēzekne","Valmiera","Ogre","Tukums"] },
  { name: "Lithuania",      flag: "🇱🇹", cities: ["Vilnius","Kaunas","Klaipėda","Šiauliai","Panevėžys","Alytus","Marijampolė","Mazeikiai","Jonava","Kėdainiai"] },
  { name: "Belarus",        flag: "🇧🇾", cities: ["Minsk","Gomel","Mogilev","Vitebsk","Hrodna","Brest","Babruysk","Baranovichi","Pinsk","Orsha"] },
  { name: "Ukraine",        flag: "🇺🇦", cities: ["Kyiv","Kharkiv","Odesa","Dnipro","Donetsk","Zaporizhzhia","Lviv","Kryvyi Rih","Mykolaiv","Mariupol"] },
  { name: "Moldova",        flag: "🇲🇩", cities: ["Chișinău","Tiraspol","Bălți","Bender","Rîbnița","Cahul","Ungheni","Soroca","Orhei","Dubăsari"] },
  { name: "Slovakia",       flag: "🇸🇰", cities: ["Bratislava","Košice","Prešov","Žilina","Banská Bystrica","Nitra","Trnava","Martin","Trenčín","Poprad"] },
  { name: "Luxembourg",     flag: "🇱🇺", cities: ["Luxembourg","Esch-sur-Alzette","Differdange","Dudelange","Ettelbruck","Diekirch","Echternach","Wiltz","Grevenmacher","Remich"] },
  { name: "Monaco",         flag: "🇲🇨", cities: ["Monte Carlo","La Condamine","Fontvieille","Le Portier","Saint-Roman","Moneghetti","Les Révoires","La Rousse","Larvotto","Exotic Garden"] },
  { name: "Andorra",        flag: "🇦🇩", cities: ["Andorra la Vella","Escaldes-Engordany","Encamp","Sant Julià de Lòria","La Massana","Ordino","Canillo","Arinsal","El Serrat","Soldeu"] },
  { name: "Malta",          flag: "🇲🇹", cities: ["Valletta","Birkirkara","Qormi","Mosta","Żebbuġ","San Pawl il-Baħar","Żurrieq","Sliema","St. Paul's Bay","Birgu"] },
  { name: "Liechtenstein",  flag: "🇱🇮", cities: ["Vaduz","Schaan","Balzers","Triesen","Eschen","Mauren","Triesenberg","Ruggell","Gamprin","Schellenberg"] },
  { name: "San Marino",     flag: "🇸🇲", cities: ["San Marino","Borgo Maggiore","Dogana","Serravalle","Domagnano","Fiorentino","Acquaviva","Chiesanuova","Montegiardino","Faetano"] },
  { name: "Vatican City",   flag: "🇻🇦", cities: ["Vatican City","St. Peter's Basilica","Sistine Chapel","St. Peter's Square","Vatican Museums","Apostolic Palace","Vatican Gardens","St. Paul's Gate"] },
  
  // North America
  { name: "United States",  flag: "🇺🇸", cities: ["New York","Los Angeles","Chicago","Houston","Phoenix","Philadelphia","San Antonio","Dallas","San Diego","San Jose","Austin","Jacksonville","Fort Worth","Columbus","San Francisco","Charlotte","Indianapolis","Seattle","Denver","Washington","Boston","El Paso","Detroit","Nashville","Portland","Memphis","Oklahoma City","Las Vegas","Louisville","Baltimore","Milwaukee","Albuquerque","Tucson","Fresno","Sacramento","Long Beach","Kansas City","Mesa","Virginia Beach","Atlanta","Colorado Springs","Raleigh","Omaha","Miami","Oakland","Tulsa","Minneapolis","Cleveland","Wichita","Arlington","New Orleans","Bakersfield","Tampa","Honolulu","Aurora","Anaheim","Santa Ana","St. Louis","Riverside","Corpus Christi","Lexington","Pittsburgh","Anchorage","Stockton","Cincinnati","Toledo","Greensboro","Plano","Newark","Lincoln","St. Paul","Orlando","Durham","Chula Vista","Irvine","Fort Wayne","Chandler","Laredo","St. Petersburg","Scottsdale","Madison","Gilbert","Reno","Buffalo","Jersey City","Glendale","North Las Vegas","Winston-Salem","Chesapeake","Norfolk","Fremont","Garland","Irving","Hialeah","Richmond","Boise","Spokane","Baton Rouge"] },
  { name: "Canada",         flag: "🇨🇦", cities: ["Toronto","Montreal","Vancouver","Calgary","Edmonton","Ottawa","Winnipeg","Quebec City","Hamilton","Kitchener","London","Victoria","Halifax","Oshawa","Windsor","Saskatoon","Regina","Sherbrooke","St. John's","Barrie","Kelowna","Abbotsford","Sudbury","Saguenay","Kingston","Trois-Rivières","Guelph","Moncton","Brantford","Thunder Bay","Saint John"] },
  { name: "Mexico",         flag: "🇲🇽", cities: ["Mexico City","Tijuana","Ecatepec","León","Guadalajara","Juárez","Zapopan","Nezahualcóyotl","Chihuahua","Naucalpan","Mérida","San Luis Potosí","Aguascalientes","Hermosillo","Saltillo","Mexicali","Culiacán","Querétaro","Monterrey","Toluca","Puebla","Guadalajara","Veracruz","Villahermosa","Acapulco","Cancún","Tuxtla Gutiérrez","Xalapa","Reynosa","Matamoros","San Juan Bautista Tuxtepec","Tepic","Tampico","Morelia","Durango","Irapuato","Ciudad Victoria","Celaya","Mazatlán","Chilpancingo de los Bravo","Chetumal","Comitán de Domínguez","Pachuca de Soto","San Juan del Río","Iguala de la Independencia","Delicias","Cuernavaca","Tecate","Tulancingo de Bravo","Piedras Negras","Río Bravo","Coatzacoalcos","Minatitlán","Poza Rica de Hidalgo","Zamora de Hidalgo","Zacatecas","Tulancingo","Tecate"] },
  { name: "Guatemala",      flag: "🇬🇹", cities: ["Guatemala City","Villa Nueva","Mixco","Petapa","San Juan Sacatepéquez","Quetzaltenango","Villa Canales","Escuintla","Chinautla","Chimaltenango"] },
  { name: "Cuba",           flag: "🇨🇺", cities: ["Havana","Santiago de Cuba","Camagüey","Holguín","Guantánamo","Santa Clara","Las Tunas","Cienfuegos","Pinar del Río","Bayamo"] },
  { name: "Haiti",          flag: "🇭🇹", cities: ["Port-au-Prince","Carrefour","Delmas","Cap-Haïtien","Pétionville","Gonaïves","Port-de-Paix","Les Cayes","Jacmel","Jérémie"] },
  { name: "Dominican Republic", flag: "🇩🇴", cities: ["Santo Domingo","Santiago de los Caballeros","Santo Domingo Oeste","Santo Domingo Este","San Pedro de Macorís","San Cristóbal","La Romana","Higüey","Puerto Plata","La Vega"] },
  { name: "Honduras",       flag: "🇭🇳", cities: ["Tegucigalpa","San Pedro Sula","La Ceiba","El Progreso","Choloma","Comayagua","Puerto Cortés","Tocoa","Danlí","Siguatepeque"] },
  { name: "Nicaragua",      flag: "🇳🇮", cities: ["Managua","León","Chinandega","Masaya","Tipitapa","Matagalpa","Jinotega","Estelí","Granada","Bluefields"] },
  { name: "Costa Rica",     flag: "🇨🇷", cities: ["San José","Limón","Alajuela","San Pedro","Desamparados","Liberia","Puntarenas","Cartago","Guadalupe","San Francisco"] },
  { name: "Panama",         flag: "🇵🇦", cities: ["Panama City","San Miguelito","Tocumen","David","Arraiján","Colón","La Chorrera","Santiago","Las Tablas","Penonomé"] },
  { name: "Jamaica",        flag: "🇯🇲", cities: ["Kingston","Spanish Town","Portmore","Montego Bay","Mandeville","Old Harbour","May Pen","Savanna-la-Mar","Port Antonio","Lucea"] },
  { name: "Trinidad and Tobago", flag: "🇹🇹", cities: ["Port of Spain","San Fernando","Chaguanas","Arima","Couva","Point Fortin","Scarborough","San Juan","Petit Valley","Diego Martin"] },
  { name: "Barbados",       flag: "🇧🇧", cities: ["Bridgetown","Speightstown","Oistins","Holetown","Bathsheba","Crane","St. Lawrence Gap","Paynes Bay","Foul Bay","Bathsheba"] },
  { name: "Bahamas",        flag: "🇧🇸", cities: ["Nassau","Freeport","West End","Cooper's Town","Marsh Harbour","Freetown","High Rock","Andros Town","George Town","Clarence Town"] },
  { name: "Belize",         flag: "🇧🇿", cities: ["Belize City","San Ignacio","Belmopan","Orange Walk","San Pedro","Dangriga","Corozal","Punta Gorda","Benque Viejo del Carmen","San Pablo"] },
  { name: "El Salvador",    flag: "🇸🇻", cities: ["San Salvador","Santa Ana","San Miguel","Soyapango","Mejicanos","Santa Tecla","Apopa","Santiago de la Frontera","Zacatecoluca","Ilobasco"] },
  { name: "Grenada",        flag: "🇬🇩", cities: ["St. George's","Gouyave","Grenville","Victoria","Sauteurs","St. David's","Morne Rouge","Happy Hill","Grand Anse","Boca"] },
  { name: "Saint Lucia",    flag: "🇱🇨", cities: ["Castries","Vieux Fort","Soufrière","Choiseul","Dennery","Micoud","Gros Islet","Anse La Raye","Canaries","Babonneau"] },
  { name: "Saint Vincent and the Grenadines", flag: "🇻🇨", cities: ["Kingstown","Georgetown","Barrouallie","Layou","Calliaqua","Port Elizabeth","Chateaubelair","Mesopotamia","Biabou","Union Island"] },
  { name: "Dominica",       flag: "🇩🇲", cities: ["Roseau","Portsmouth","Marigot","Berekua","Mahaut","Castle Bruce","Grand Bay","Soufrière","Wesley","Calibishie"] },
  { name: "Antigua and Barbuda", flag: "🇦🇬", cities: ["St. John's","All Saints","Liberta","Bolans","Potters Village","Codrington","Freetown","Barnes Hill","Cedar Grove","Old Road"] },
  { name: "Saint Kitts and Nevis", flag: "🇰🇳", cities: ["Basseterre","Charlestown","Sandy Point","Dieppe Bay Town","Cayon","Tabernacle","Molyneux","Fig Tree","Old Road Town","Middle Island"] },
  
  // South America
  { name: "Brazil",         flag: "🇧🇷", cities: ["São Paulo","Rio de Janeiro","Brasília","Salvador","Fortaleza","Belo Horizonte","Manaus","Curitiba","Recife","Belém","Porto Alegre","Goiânia","Guarulhos","Campinas","São Luís","São Gonçalo","Maceió","Duque de Caxias","Nova Iguaçu","Teresina","São Bernardo do Campo","João Pessoa","Jaboatão dos Guararapes","Santo André","Uberlândia","Contagem","Osasco","São José dos Campos","Jundiaí","Sorocaba","Ribeirão Preto","Niterói","Cuiabá","Aracaju","Juiz de Fora","Londrina","Joinville","Aparecida de Goiânia","Anápolis","Porto Velho","Serra","Natal","Caxias do Sul","Camacari","Viamão","Belo Horizonte","São José do Rio Preto","Mogi das Cruzes","Diadema","Betim","Maringá","Carapicuíba","Montes Claros","Suzano","Piracicaba","Caruaru","Ji-Paraná","Americana","Campina Grande","Maceió","Pelotas","São Vicente","Rio Grande","Guarujá","Foz do Iguaçu","São José do Rio Preto","São José dos Pinhais","Itaboraí","São Bernardo do Campo","Jundiaí","Sorocaba","Ribeirão Preto","Niterói","Cuiabá","Aracaju","Juiz de Fora","Londrina","Joinville","Aparecida de Goiânia","Anápolis","Porto Velho","Serra","Natal","Caxias do Sul","Camacari","Viamão","Belo Horizonte","São José do Rio Preto","Mogi das Cruzes","Diadema","Betim","Maringá","Carapicuíba","Montes Claros","Suzano","Piracicaba","Caruaru","Ji-Paraná","Americana","Campina Grande"] },
  { name: "Argentina",      flag: "🇦🇷", cities: ["Buenos Aires","Córdoba","Rosario","Mendoza","Tucumán","La Plata","Mar del Plata","Salta","Santa Fe","San Miguel de Tucumán","San Juan","Resistencia","Neuquén","Bahía Blanca","San Salvador de Jujuy","Comodoro Rivadavia","Concepción del Uruguay","Santiago del Estero","Corrientes","Paraná","Formosa","San Fernando del Valle de Catamarca","San Rafael","La Rioja","San Luis","San Fernando","Río Cuarto","Villa María","San Nicolás de los Arroyos","Venado Tuerto","Olavarría","Santa Rosa","Pergamino","Chivilcoy","Concepción","Gualeguaychú","Zárate","Junín","San Antonio Oeste","San Carlos de Bariloche","Ushuaia","Puerto Madryn","Río Gallegos","El Calafate","Trelew","Comodoro Rivadavia","Viedma","Cipolletti","General Roca","Choele Choel","Río Grande","Tolhuin","Ushuaia"] },
  { name: "Colombia",       flag: "🇨🇴", cities: ["Bogotá","Medellín","Cali","Barranquilla","Cartagena","Cúcuta","Soledad","Ibagué","Bucaramanga","Soacha","Santa Marta","Villavicencio","Bello","Valledupar","Pereira","Montería","Pasto","Manizales","Neiva","Armenia","Popayán","Sincelejo","Floridablanca","Tunja","Cartago","Girardot","Buga","Sogamoso","Duitama","Chía","Envigado","Dosquebradas","Tuluá","Rionegro","Candelaria","Facatativá","Yopal","Zipaquirá","Girón","Barrancabermeja","Sogamoso","Duitama","Chía","Envigado","Dosquebradas","Tuluá","Rionegro","Candelaria","Facatativá","Yopal","Zipaquirá","Girón","Barrancabermeja"] },
  { name: "Chile",          flag: "🇨🇱", cities: ["Santiago","Valparaíso","Concepción","La Serena","Antofagasta","Temuco","Rancagua","Talca","Arica","Chillán","Iquique","Puerto Montt","Coquimbo","Osorno","Valdivia","Punta Arenas","Calama","Quilpué","Copiapó","San Bernardo","Temuco","Rancagua","Talca","Arica","Chillán","Iquique","Puerto Montt","Coquimbo","Osorno","Valdivia","Punta Arenas","Calama","Quilpué","Copiapó","San Bernardo"] },
  { name: "Peru",           flag: "🇵🇪", cities: ["Lima","Arequipa","Trujillo","Chiclayo","Huancayo","Piura","Iquitos","Cusco","Chimbote","Pucallpa","Tacna","Ica","Juliaca","Ayacucho","Sullana","Chincha Alta","Cajamarca","Puno","Tarapoto","Huaraz","Tumbes","Ilo","Moquegua","Pisco","Abancay","Huánuco","Tarma","Cerro de Pasco","Jaén","Moyobamba","Bagua Grande","Tingo María","Quillabamba","Mollendo","Nazca","Sicuani","Huanta","Andahuaylas","Huancayo"] },
  { name: "Venezuela",      flag: "🇻🇪", cities: ["Caracas","Maracaibo","Valencia","Barquisimeto","Maracay","Ciudad Guayana","San Cristóbal","Maturín","Barinas","Ciudad Bolívar","Cumaná","Mérida","Puerto La Cruz","San Fernando de Apure","Los Teques","Punto Fijo","Guarenas","Guatire","Ciudad Ojeda","Cabimas","Carúpano","El Tigre","Valle de la Pascua","Acarigua","Turmero","El Limón","Palo Negro","Ocumare del Tuy","Calabozo","Cagua","Catia La Mar","Santa Teresa del Tuy","San Juan de los Morros","San Felipe","Altagracia de Orituco","Güiria","Caucagua","Araure","Tucupita","San Carlos del Río Negro","Puerto Cabello","Coro","Píritu","El Vigía","Mérida","Trujillo","Barinas","San Cristóbal","Mérida","Valencia"] },
  { name: "Ecuador",        flag: "🇪🇨", cities: ["Guayaquil","Quito","Cuenca","Santo Domingo","Machala","Manta","Portoviejo","Ambato","Eloy Alfaro","Esmeraldas","Quevedo","Latacunga","Milagro","Riobamba","Ibarra","La Libertad","Babahoyo","Durán","Loja","Chone","Otavalo","Pasaje","Santa Rosa","Huaquillas","Playas","Jipijapa","Montecristi","Salinas","Pedernales","El Carmen","Santa Elena","La Concordia","Velasco Ibarra","Zamora","Macas","Tena","Puyo","Francisco de Orellana","Nueva Loja","Zamora","Macas","Tena","Puyo","Francisco de Orellana"] },
  { name: "Bolivia",        flag: "🇧🇴", cities: ["Santa Cruz de la Sierra","La Paz","Cochabamba","Sucre","El Alto","Oruro","Potosí","Sacaba","Tarija","Quillacollo","Riberalta","Trinidad","Warnes","Viacha","Montero","Yacuiba","Cobija","Vinto","Llallagua","Patacamaya","Bermejo","Villazón","Tupiza","Oruro","Potosí","Sacaba","Tarija","Quillacollo","Riberalta","Trinidad","Warnes","Viacha","Montero","Yacuiba","Cobija","Vinto","Llallagua","Patacamaya","Bermejo","Villazón","Tupiza"] },
  { name: "Paraguay",       flag: "🇵🇾", cities: ["Asunción","Ciudad del Este","Luque","San Lorenzo","Lambaré","Capiatá","Itauguá","Pedro Juan Caballero","Villarrica","Caaguazú","Encarnación","Coronel Oviedo","Concepción","San Juan Bautista","Presidente Franco","Alto Paraná","Cerro Corá","San Pedro","Itapúa","Guairá","Caazapá","Amambay","Canindeyú","Ñeembucú","Alto Paraguay","Boquerón","Presidente Hayes"] },
  { name: "Uruguay",        flag: "🇺🇾", cities: ["Montevideo","Salto","Paysandú","Las Piedras","Rivera","Maldonado","Tacuarembó","Melo","Mercedes","Fray Bentos","Artigas","Minas","Pando","Canelones","Florida","Durazno","Punta del Este","San José de Mayo","Treinta y Tres","Río Branco"] },
  { name: "Guyana",         flag: "🇬🇾", cities: ["Georgetown","Linden","New Amsterdam","Anna Regina","Bartica","Mahdia","Lethem","Corriverton","Mabaruma","Parika"] },
  { name: "Suriname",       flag: "🇸🇷", cities: ["Paramaribo","Lelydorp","Nieuw Nickerie","Moengo","Mariënburg","Wageningen","Albina","Nieuw Amsterdam","Groningen","Onverwacht"] },
  { name: "French Guiana",  flag: "🇬🇫", cities: ["Cayenne","Matoury","Saint-Laurent-du-Maroni","Kourou","Remire-Montjoly","Sinnamary","Iracoubo","Saul","Grand-Santi","Apatou"] },
  { name: "Falkland Islands", flag: "🇫🇰", cities: ["Stanley","Mount Pleasant","Goose Green","Port Howard","Fox Bay","Pebble Island","Weddell Island","West Falkland","East Falkland","Saunders Island"] },
  
  // Oceania
  { name: "Australia",      flag: "🇦🇺", cities: ["Sydney","Melbourne","Brisbane","Perth","Adelaide","Gold Coast","Canberra","Hobart","Darwin","Townsville","Newcastle","Wollongong","Logan City","Geelong","Cairns","Sunshine Coast","Ballarat","Bendigo","Albury","Launceston","Mackay","Rockhampton","Toowoomba","Bunbury","Coffs Harbour","Bundaberg","Wagga Wagga","Hervey Bay","Maitland","Mildura","Shepparton","Gladstone","Tamworth","Port Macquarie","Geraldton","Nowra","Bathurst","Orange","Mackay","Rockhampton","Toowoomba","Bunbury","Coffs Harbour","Bundaberg","Wagga Wagga","Hervey Bay","Maitland","Mildura","Shepparton","Gladstone","Tamworth","Port Macquarie","Geraldton","Nowra","Bathurst","Orange"] },
  { name: "New Zealand",    flag: "🇳🇿", cities: ["Auckland","Wellington","Christchurch","Hamilton","Tauranga","Napier-Hastings","Dunedin","Palmerston North","Nelson","Rotorua","New Plymouth","Whangarei","Wanganui","Gisborne","Invercargill","Timaru","Blenheim","Masterton","Levin","Upper Hutt","Lower Hutt","Waiuku","Kaitaia","Kerikeri","Taupo","Whakatane","Oamaru","Ashburton","Timaru","Blenheim","Masterton","Levin","Upper Hutt","Lower Hutt","Waiuku","Kaitaia","Kerikeri","Taupo","Whakatane","Oamaru","Ashburton"] },
  { name: "Papua New Guinea", flag: "🇵🇬", cities: ["Port Moresby","Lae","Mount Hagen","Madang","Wewak","Goroka","Kokopo","Kimbe","Popondetta","Daru","Aitape","Samarai","Lae","Mount Hagen","Madang","Wewak","Goroka","Kokopo","Kimbe","Popondetta","Daru"] },
  { name: "Fiji",           flag: "🇫🇯", cities: ["Suva","Nadi","Lautoka","Labasa","Ba","Tavua","Rakiraki","Levuka","Nausori","Seaqaqa"] },
  { name: "Solomon Islands", flag: "🇸🇧", cities: ["Honiara","Gizo","Auki","Tulagi","Norfolk","Buala","Kirakira","Taro","Munda","Lata"] },
  { name: "Vanuatu",        flag: "🇻🇺", cities: ["Port Vila","Luganville","Sola","Isangel","Lenakel","Lakatoro","Sola","Isangel","Lenakel","Lakatoro"] },
  { name: "Samoa",          flag: "🇼🇸", cities: ["Apia","Asau","Salelologa","Mulifanua","Faleolo","Lalomanu","Falealupo","Siumu","Leulumoega","Vailoa"] },
  { name: "Kiribati",       flag: "🇰🇮", cities: ["Tarawa","Kiritimati","Abaiang","Tabiteuea","Maiana","Nonouti","Marakei","Abemama","Butaritari","Tabuaeran"] },
  { name: "Tonga",          flag: "🇹🇴", cities: ["Nuku'alofa","Neiafu","Haveluloto","Vaini","Pangai","Ohonua","Kolovai","Pea","Nukunuku","Lapaha"] },
  { name: "Tuvalu",         flag: "🇹🇻", cities: ["Funafuti","Vaitupu","Nukufetau","Nukulaelae","Nanumea","Niulakita","Niutao","Nui","Funafuti","Vaitupu"] },
  { name: "Marshall Islands", flag: "🇲🇭", cities: ["Majuro","Ebeye","Arno","Jaluit","Wotje","Enewetak","Ujelang","Bikini","Rongelap","Ailinglaplap"] },
  { name: "Micronesia",     flag: "🇫🇲", cities: ["Palikir","Weno","Kolonia","Tonoas","Pohnpei","Chuuk","Yap","Kosrae","Pohnpei","Chuuk"] },
  { name: "Nauru",          flag: "🇳🇷", cities: ["Yaren","Anibare","Aiwo","Meneng","Boe","Anabar","Baiti","Denigomodu","Ewa","Ijuw"] },
  { name: "Palau",          flag: "🇵🇼", cities: ["Ngerulmud","Koror","Airai","Peleliu","Angaur","Kayangel","Sonsorol","Hatohebei","Tobi","Hatohobei"] },
  { name: "Cook Islands",   flag: "🇨🇰", cities: ["Avarua","Matavera","Ngatangiia","Aitutaki","Atiu","Mitiaro","Mauke","Rarotonga","Mangaia","Manihiki"] },
  { name: "Niue",           flag: "🇳🇺", cities: ["Alofi","Hakupu","Lakepa","Likou","Makefu","Mutalau","Namukulu","Tamakautoga","Tuapa","Vaiea"] },
  { name: "American Samoa", flag: "🇦🇸", cities: ["Pago Pago","Fagatogo","Leone","Tafuna","Vaitogi","Mapusagafou","Amanave","Aasu","Afono","Amouli"] },
  { name: "French Polynesia", flag: "🇵🇫", cities: ["Papeete","Faaa","Punaauia","Pirae","Mahina","Papara","Arue","Paea","Papenoo","Vairao"] },
  { name: "New Caledonia",  flag: "🇳🇨", cities: ["Nouméa","Mont-Dore","Dumbéa","Païta","Bourail","La Foa","Thio","Koumac","Poindimié","Koné"] },
  { name: "Wallis and Futuna", flag: "🇼🇫", cities: ["Mata-Utu","Alo","Sigave","Vaitupu","Futuna","Wallis","Alofi","Kolia","Utufua","Nukufetau"] },
  { name: "Tokelau",        flag: "🇹🇰", cities: ["Atafu","Nukunonu","Fakaofo","Fale","Fagatogo","Vaitupu","Nukufetau","Nukulaelae","Nanumea","Niulakita"] },
  { name: "Guam",           flag: "🇬🇺", cities: ["Hagåtña","Dededo","Yigo","Tamuning","Mangilao","Barrigada","Santa Rita","Agat","Mongmong-Toto-Maite","Talofofo"] },
  { name: "Northern Mariana Islands", flag: "🇲🇵", cities: ["Saipan","Garapan","Tanapag","Chalan Kanoa","San Roque","Capitol Hill","Kagman","Oleai","San Jose","Susupe"] },
  { name: "Pitcairn Islands", flag: "🇵🇳", cities: ["Adamstown","Bounty Bay","Christian's Cave","Gudgeonville","St. Paul's Pool","Tedside","Down Rope","Indian Valley","Hill of Difficulty","Big Mango"] },
  
  // Antarctica
  { name: "Antarctica",     flag: "🇦🇶", cities: ["McMurdo Station","Amundsen-Scott South Pole Station","Palmer Station","Rothera Research Station","Vostok Station","Concordia Station","Mirny Station","Novolazarevskaya Station","Progress Station","Bellingshausen Station"] }
];

const COUNTRY_MAP = Object.fromEntries(COUNTRIES.map(c => [c.name, c]));

// ─── Sidebar Config ───────────────────────────────────────────────────────────
const SIDEBAR_SECTIONS: Record<string, SidebarItem[]> = {
  "YOUR ACCOUNT": [
    { label: "Profile",       icon: <UserRoundPen size={15} /> },
    { label: "Preferences",   icon: <Settings2 size={15} /> },
    { label: "Notifications", icon: <BellDot size={15} /> },
    { label: "Referrals",     icon: <Gift size={15} /> },
    { label: "Last Trip",     icon: <TentTree size={15} /> },
  ],
  "WORKSPACE": [
    { label: "General",      icon: <Settings size={15} /> },
    { label: "Integrations", icon: <Link size={15} /> },
  ],
};

const SECTION_SUBTITLES: Record<string, string> = {
  Profile:       "Personalize your profile settings and account preferences.",
  Preferences:   "Tailor your digital sanctuary to fit your lifestyle and accessibility needs.",
  Notifications: "Manage how and when GuriGate notifies you.",
  Referrals:     "Share GuriGate and earn rewards for every friend you bring.",
  "Last Trip":   "Review details and memories from your most recent stay.",
  General:       "Workspace-level settings for your account.",
  Integrations:  "Connect third-party tools and services to your account.",
};

// ─── Reusable: Toggle ─────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1 ${
        checked ? "bg-red-600" : "bg-gray-200"
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`} />
    </button>
  );
}

// ─── Reusable: Password Input ─────────────────────────────────────────────────
function PasswordInput({ value, onChange, placeholder, label }: {
  value: string; onChange: (v: string) => void; placeholder: string; label: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Lock size={14} />
        </div>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-10 py-2.5 outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-400"
        />
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );
}

// ─── Country Dropdown ─────────────────────────────────────────────────────────
function CountryDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref                 = useRef<HTMLDivElement>(null);

  const filtered  = COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const selected  = COUNTRY_MAP[value];

  const handleOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  };
  // register once
  useRef((() => {
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }) as unknown as null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setSearch(""); }}
        className={`w-full flex items-center gap-2.5 text-sm bg-gray-50 border rounded-xl px-4 py-2.5 outline-none text-left transition-colors ${open ? "border-red-600 bg-white" : "border-gray-100 hover:border-gray-200"}`}
      >
        <span className="text-lg leading-none">{selected?.flag ?? "🌍"}</span>
        <span className="flex-1 text-gray-800">{selected?.name ?? "Select country"}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden" style={{animation:"ddOpen .15s ease both"}}>
          <style>{`@keyframes ddOpen{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full text-xs px-3 py-2 bg-gray-50 rounded-lg outline-none focus:bg-white border border-transparent focus:border-red-600 transition-colors placeholder:text-gray-400"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0
              ? <p className="text-xs text-gray-400 text-center py-4">No countries found</p>
              : filtered.map(c => (
                <button
                  key={c.name}
                  onClick={() => { onChange(c.name); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors text-left ${value === c.name ? "bg-red-50 text-red-600 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  {value === c.name && <Check size={13} className="text-red-600 flex-shrink-0" />}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── City Dropdown ────────────────────────────────────────────────────────────
function CityDropdown({ value, onChange, cities }: { value: string; onChange: (v: string) => void; cities: string[] }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref                 = useRef<HTMLDivElement>(null);

  const filtered = cities.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  const handleOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  };
  useRef((() => {
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }) as unknown as null);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { if (cities.length) { setOpen(v => !v); setSearch(""); } }}
        disabled={cities.length === 0}
        className={`w-full flex items-center gap-2.5 text-sm bg-gray-50 border rounded-xl px-4 py-2.5 outline-none text-left transition-colors ${cities.length === 0 ? "opacity-50 cursor-not-allowed border-gray-100" : open ? "border-red-600 bg-white" : "border-gray-100 hover:border-gray-200"}`}
      >
        <span className={`flex-1 ${value ? "text-gray-800" : "text-gray-400"}`}>
          {value || (cities.length === 0 ? "Select a country first" : "Select city")}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden" style={{animation:"ddOpen .15s ease both"}}>
          <div className="p-2 border-b border-gray-100">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search city..."
              className="w-full text-xs px-3 py-2 bg-gray-50 rounded-lg outline-none focus:bg-white border border-transparent focus:border-red-600 transition-colors placeholder:text-gray-400"
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1">
            {filtered.length === 0
              ? <p className="text-xs text-gray-400 text-center py-4">No cities found</p>
              : filtered.map(city => (
                <button
                  key={city}
                  onClick={() => { onChange(city); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left ${value === city ? "bg-red-50 text-red-600 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  {city}
                  {value === city && <Check size={13} className="text-red-600" />}
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Section ──────────────────────────────────────────────────────────
function ProfileSection({ onCancel }: { onCancel: () => void }) {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const [form, setForm] = useState<ProfileForm>({ 
    firstName: "", 
    lastName: "", 
    country: "Somalia", 
    city: "", 
    email: "",
    language: "English (US)",
    timeZone: "(GMT+03:00) Africa",
    phone: "+252 61 234 5678",
    occupation: ""
  });

  // Email
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail]         = useState("");
  const [emailSaved, setEmailSaved]     = useState(false);
  const [emailError, setEmailError]     = useState("");

  // Password
  const [showPassword, setShowPassword]     = useState(false);
  const [passwords, setPasswords]           = useState<PasswordForm>({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError]   = useState("");
  const [passwordSaved, setPasswordSaved]   = useState(false);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  
  // Load profile data on mount
  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url, country, city, language, time_zone, phone, occupation')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (profile) {
          setForm({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            country: profile.country || 'Somalia',
            city: profile.city || '',
            email: user.email || '',
            language: profile.language || 'English (US)',
            timeZone: profile.time_zone || '(GMT+03:00) Africa',
            phone: profile.phone || '+252 61 234 5678',
            occupation: profile.occupation || ''
          });
          setAvatarUrl(profile.avatar_url);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [user, supabase]);
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File must be an image');
      return;
    }
    
    setUploadingAvatar(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const selectedCountry = COUNTRY_MAP[form.country];
  const cities          = selectedCountry?.cities ?? [];

  const handleCountryChange = (name: string) => setForm(f => ({ ...f, country: name, city: "" }));

  const handleSaveEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    if (!user) return;
    
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      setEmailSaved(true);
      setEmailError("");
      setTimeout(() => {
        setForm(f => ({ ...f, email: newEmail }));
        setEmailSaved(false); setEditingEmail(false); setNewEmail("");
      }, 2000);
    } catch (error: any) {
      console.error('Error updating email:', error);
      setEmailError(error.message || 'Failed to update email');
    }
  };

  const handleSavePassword = async () => {
    setPasswordError("");
    if (!passwords.oldPassword)                       { setPasswordError("Please enter your current password."); return; }
    if (passwords.newPassword.length < 8)             { setPasswordError("New password must be at least 8 characters."); return; }
    if (passwords.newPassword !== passwords.confirmPassword) { setPasswordError("Passwords do not match."); return; }
    
    if (!user) return;
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.newPassword
      });
      
      if (error) throw error;
      
      setPasswordSaved(true);
      setTimeout(() => {
        setPasswordSaved(false); setShowPassword(false);
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      }, 2000);
    } catch (error: any) {
      console.error('Error updating password:', error);
      setPasswordError(error.message || 'Failed to update password');
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveSuccess(false);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: form.firstName,
          last_name: form.lastName,
          country: form.country,
          city: form.city,
          language: form.language,
          time_zone: form.timeZone,
          phone: form.phone,
          occupation: form.occupation,
          full_name: `${form.firstName} ${form.lastName}`.trim()
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const passwordStrength = (() => {
    const l = passwords.newPassword.length;
    if (l === 0) return 0;
    if (l < 6)  return 1;
    if (l < 8)  return 2;
    if (l < 12) return 3;
    return 4;
  })();
  const strengthLabel = ["","Weak","Fair","Good","Strong"][passwordStrength];
  const strengthColor = ["","bg-red-400","bg-orange-400","bg-yellow-400","bg-green-500"][passwordStrength];

  return (
    <>
      {/* ── Avatar Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center border-2 border-gray-200">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="38" r="18" fill="#b0bec5" /><ellipse cx="50" cy="82" rx="28" ry="20" fill="#b0bec5" />
              <circle cx="50" cy="38" r="16" fill="#cfd8dc" /><rect x="34" y="52" width="32" height="24" rx="4" fill="#37474f" />
              <circle cx="50" cy="36" r="12" fill="#ffccbc" /><path d="M38 36 Q50 28 62 36" fill="#5d4037" />
            </svg>
          )}
        </div>
        <div>
          <p className="text-base font-bold text-gray-900 mb-3">Profile Picture</p>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploadingAvatar} />
            <button 
              onClick={() => fileRef.current?.click()} 
              disabled={uploadingAvatar}
              className="flex items-center gap-2 bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={14} /> {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
            </button>
            {avatarUrl && (
              <button 
                onClick={async () => {
                  if (!user) return;
                  try {
                    await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id);
                    setAvatarUrl(null);
                  } catch (error) {
                    console.error('Error removing avatar:', error);
                    alert('Failed to remove avatar');
                  }
                }}
                className="text-sm font-semibold px-4 py-2 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500 font-['Manrope'] mt-2">PNG, JPG up to 5MB</p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          {/* First Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">First Name</label>
            <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First Name"
              className="w-full text-sm bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-400" />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Last Name</label>
            <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last Name"
              className="w-full text-sm bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-400" />
          </div>

          {/* Country with flag */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Country</label>
            <CountryDropdown value={form.country} onChange={handleCountryChange} />
          </div>

          {/* City dropdown */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">City</label>
            <CityDropdown value={form.city} onChange={city => setForm(f => ({ ...f, city }))} cities={cities} />
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="text-sm font-medium text-gray-700 block mb-1.5">Language</label>
            <select 
              id="language"
              value={form.language} 
              onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
              title="Select your language"
              className="w-full text-sm bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 focus:bg-white transition-colors"
            >
              <option value="English (US)">English (US)</option>
              <option value="English (UK)">English (UK)</option>
              <option value="Arabic">Arabic</option>
              <option value="French">French</option>
              <option value="Spanish">Spanish</option>
            </select>
          </div>

          {/* Time Zone */}
          <div>
            <label htmlFor="timezone" className="text-sm font-medium text-gray-700 block mb-1.5">Time Zone</label>
            <select 
              id="timezone"
              value={form.timeZone} 
              onChange={e => setForm(f => ({ ...f, timeZone: e.target.value }))}
              title="Select your time zone"
              className="w-full text-sm bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 focus:bg-white transition-colors"
            >
              <option value="(GMT+03:00) Africa">(GMT+03:00) Africa</option>
              <option value="(GMT+00:00) UTC">(GMT+00:00) UTC</option>
              <option value="(GMT+01:00) Europe">(GMT+01:00) Europe</option>
              <option value="(GMT-05:00) Eastern">(GMT-05:00) Eastern</option>
              <option value="(GMT-08:00) Pacific">(GMT-08:00) Pacific</option>
            </select>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone</label>
            <input 
              value={form.phone} 
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
              placeholder="+252 61 234 5678"
              className="w-full text-sm bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-400" 
            />
          </div>

          {/* Occupation */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Occupation</label>
            <input 
              value={form.occupation} 
              onChange={e => setForm(f => ({ ...f, occupation: e.target.value }))} 
              placeholder="Property Manager"
              className="w-full text-sm bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-red-600 focus:bg-white transition-colors placeholder:text-gray-400" 
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-1.5">Email</label>
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><Mail size={14} /></div>
            <input value={form.email} readOnly
              className="w-full text-sm bg-gray-50 border border-gray-100 rounded-xl pl-9 pr-28 py-2.5 outline-none text-gray-500" />
            {!editingEmail && (
              <button onClick={() => { setEditingEmail(true); setNewEmail(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                Edit Email
              </button>
            )}
          </div>

          {/* Inline email edit */}
          {editingEmail && (
            <div className="mt-3 bg-red-50 border border-red-100 rounded-xl p-4" style={{animation:"expandDown .2s ease both"}}>
              <style>{`@keyframes expandDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <p className="text-xs font-semibold text-red-600 mb-3 flex items-center gap-1.5">
                <Mail size={12} /> Enter your new email address
              </p>
              <input type="email" value={newEmail} onChange={e => { setNewEmail(e.target.value); setEmailError(''); }}
                placeholder="newemail@example.com" autoFocus
                className="w-full text-sm bg-white border border-red-200 rounded-xl px-4 py-2.5 outline-none focus:border-red-400 transition-colors placeholder:text-gray-400 mb-3" />
              {emailError && <p className="text-xs text-red-500 mb-3">{emailError}</p>}
              <div className="flex gap-2">
                <button onClick={handleSaveEmail}
                  className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full transition-colors ${emailSaved ? "bg-green-500 text-white" : "bg-red-600 text-white hover:bg-red-700"}`}>
                  {emailSaved ? <><Check size={13} /> Saved!</> : "Update Email"}
                </button>
                <button onClick={() => { setEditingEmail(false); setNewEmail(""); setEmailError(''); }}
                  className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  <X size={13} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Password Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-5 overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">Password login</p>
            <p className="text-xs text-gray-400 mt-0.5">Last changed 3 months ago. We recommend updating your password periodically for security.</p>
          </div>
          <button
            onClick={() => { setShowPassword(v => !v); setPasswordError(""); setPasswordSaved(false); setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" }); }}
            className={`text-sm font-semibold px-5 py-2 rounded-full border transition-all whitespace-nowrap ml-4 ${showPassword ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 bg-white text-gray-800 hover:bg-gray-50"}`}>
            {showPassword ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPassword && (
          <div className="px-5 pb-5 border-t border-gray-100 pt-5" style={{animation:"expandDown .2s ease both"}}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <PasswordInput label="Current Password"    placeholder="Enter current password" value={passwords.oldPassword}     onChange={v => setPasswords(p => ({ ...p, oldPassword: v }))} />
              <PasswordInput label="New Password"        placeholder="Min. 8 characters"      value={passwords.newPassword}     onChange={v => setPasswords(p => ({ ...p, newPassword: v }))} />
              <PasswordInput label="Confirm New Password" placeholder="Repeat new password"   value={passwords.confirmPassword} onChange={v => setPasswords(p => ({ ...p, confirmPassword: v }))} />
            </div>

            {/* Strength bar */}
            {passwords.newPassword.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor : "bg-gray-200"}`} />
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">{strengthLabel} password</p>
              </div>
            )}

            {passwordError && (
              <p className="text-xs text-red-500 mb-3 flex items-center gap-1.5"><X size={12} /> {passwordError}</p>
            )}

            <button onClick={handleSavePassword}
              className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-full transition-colors ${passwordSaved ? "bg-green-500 text-white" : "bg-red-600 text-white hover:bg-red-700"}`}>
              {passwordSaved ? <><Check size={13} /> Password Updated!</> : <><Lock size={13} /> Update Password</>}
            </button>
          </div>
        )}
      </div>

      {/* ── Two-Factor Authentication Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-8 overflow-hidden">
        <div className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-900">Two-Factor Authentication</p>
            <p className="text-xs text-gray-400 mt-0.5">Status: Disabled</p>
            <p className="text-xs text-gray-400 mt-1">Add an extra layer of security to your account</p>
          </div>
          <button
            className="text-sm font-semibold px-5 py-2 rounded-full border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 transition-all whitespace-nowrap ml-4"
          >
            Enable 2FA
          </button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button onClick={onCancel} className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-5 py-2.5 transition-colors">Cancel</button>
        <button 
          onClick={handleSaveProfile}
          disabled={saving || loading}
          className={`text-sm font-bold px-7 py-2.5 rounded-full transition-colors shadow-sm ${
            saveSuccess 
              ? 'bg-green-500 text-white' 
              : 'bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {saveSuccess ? 'Saved!' : saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </>
  );
}

// ─── Preferences Section ──────────────────────────────────────────────────────
function PreferencesSection() {
  const [language, setLanguage]           = useState("English (US)");
  const [currency, setCurrency]           = useState("USD ($)");
  const [timezone, setTimezone]           = useState("(GMT+03:00) Africa");
  const [theme, setTheme]                 = useState("Light");
  const [highContrast, setHighContrast]   = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);

  const SF = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} className="w-full text-sm bg-white border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-red-600 appearance-none pr-8 text-gray-800 cursor-pointer">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><ChevronDown size={13}/></span>
    </div>
  );

  const themeOptions = [
    { id:"Light", icon:<Sun size={13} className="text-amber-400"/>, preview:(
      <div className="w-full h-24 rounded-xl overflow-hidden bg-white border border-gray-100 relative">
        <div className="p-2.5 space-y-1.5"><div className="h-2 w-16 bg-gray-200 rounded"/><div className="h-2 w-24 bg-gray-100 rounded"/><div className="h-2 w-12 bg-gray-100 rounded"/></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-red-400"/>
      </div>)},
    { id:"Dark", icon:<Moon size={13} className="text-indigo-400"/>, preview:(
      <div className="w-full h-24 rounded-xl overflow-hidden relative" style={{background:"#0f172a"}}>
        <div className="p-2.5 space-y-1.5"><div className="h-2 w-16 rounded" style={{background:"#334155"}}/><div className="h-2 w-24 rounded" style={{background:"#1e293b"}}/><div className="h-2 w-12 rounded" style={{background:"#1e293b"}}/></div>
        <div className="absolute bottom-2 right-2 w-3 h-3 rounded-full bg-red-600"/>
      </div>)},
    { id:"System", icon:<Monitor size={13} className="text-gray-400"/>, preview:(
      <div className="w-full h-24 rounded-xl overflow-hidden flex">
        <div className="w-1/2 bg-white p-2.5 space-y-1.5"><div className="h-1.5 w-8 bg-gray-200 rounded"/><div className="h-1.5 w-12 bg-gray-100 rounded"/></div>
        <div className="w-1/2 p-2.5 space-y-1.5" style={{background:"#0f172a"}}><div className="h-1.5 w-8 rounded" style={{background:"#334155"}}/><div className="h-1.5 w-12 rounded" style={{background:"#1e293b"}}/></div>
      </div>)},
  ];

  return (
    <>
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-4"><div className="h-px w-6 bg-red-600"/><span className="text-[11px] font-bold text-red-600 tracking-widest uppercase">Global Preferences</span></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4"><p className="text-sm font-medium text-gray-700 mb-2">Language</p><SF value={language} onChange={setLanguage} options={["English (US)","English (UK)","Somali","Swahili","French","German","Arabic"]}/></div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4"><p className="text-sm font-medium text-gray-700 mb-2">Currency</p><SF value={currency} onChange={setCurrency} options={["USD ($)","EUR (€)","GBP (£)","SOS (Sh)","KES (KSh)","ETB (Br)"]}/></div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4"><p className="text-sm font-medium text-gray-700 mb-2">Time Zone</p><SF value={timezone} onChange={setTimezone} options={["(GMT+03:00) Africa","(GMT+00:00) UTC","(GMT+01:00) London","(GMT+02:00) Cairo","(GMT-05:00) New York","(GMT-08:00) Los Angeles"]}/></div>
        </div>
      </div>
      <div className="mb-7">
        <div className="flex items-center gap-3 mb-4"><div className="h-px w-6 bg-red-600"/><span className="text-[11px] font-bold text-red-600 tracking-widest uppercase">Interface Appearance</span></div>
        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map(({ id, icon, preview }) => (
            <button key={id} onClick={() => setTheme(id)} className={`rounded-2xl border-2 p-3 text-left transition-all ${theme===id?"border-red-600 bg-white shadow-sm":"border-gray-100 bg-white hover:border-gray-200"}`}>
              {preview}
              <p className={`text-sm font-semibold mt-2.5 flex items-center gap-1.5 ${theme===id?"text-gray-900":"text-gray-500"}`}>{icon} {id}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4"><div className="h-px w-6 bg-red-600"/><span className="text-[11px] font-bold text-red-600 tracking-widest uppercase">Accessibility</span></div>
        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-6">
            <div><p className="text-sm font-bold text-gray-900">High Contrast Mode</p><p className="text-xs text-gray-400 mt-0.5">Increase the contrast of text and interface elements for better visibility.</p></div>
            <Toggle checked={highContrast} onChange={setHighContrast}/>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between gap-6">
            <div><p className="text-sm font-bold text-gray-900">Reduced Motion</p><p className="text-xs text-gray-400 mt-0.5">Minimize animations and transitions throughout the interface.</p></div>
            <Toggle checked={reducedMotion} onChange={setReducedMotion}/>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pb-8">
        <button className="text-sm font-semibold text-gray-500 hover:text-gray-700 px-5 py-2.5 transition-colors">Discard Changes</button>
        <button className="text-sm font-bold bg-red-600 text-white px-7 py-2.5 rounded-full hover:bg-red-700 transition-colors shadow-sm">Save Changes</button>
      </div>
    </>
  );
}

// ─── Coming Soon ──────────────────────────────────────────────────────────────
function ComingSoon({ section }: { section: string }) {
  const item = Object.values(SIDEBAR_SECTIONS).flat().find(i => i.label === section);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">{item?.icon}</div>
      <p className="text-sm font-semibold text-gray-400">{section} settings coming soon</p>
    </div>
  );
}

// ─── Account Sidebar ──────────────────────────────────────────────────────────
function AccountSidebar({ activeSection, onSelect }: { activeSection: string; onSelect: (s: string) => void }) {
  return (
    <aside className="w-56 flex-shrink-0 bg-white rounded-2xl border border-gray-100 p-5 self-start sticky top-24">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">Account</h2>
        <p className="text-xs text-gray-400 mt-0.5">Manage your editorial presence</p>
      </div>
      {Object.entries(SIDEBAR_SECTIONS).map(([section, items]) => (
        <div key={section} className="mb-4">
          <p className="text-[10px] font-bold text-red-600 tracking-widest uppercase mb-2">{section}</p>
          {items.map(({ label, icon }) => (
            <button key={label} onClick={() => onSelect(label)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm mb-0.5 transition-colors text-left ${activeSection === label ? "bg-red-50 text-red-600 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
              <span className={activeSection === label ? "text-red-600" : "text-gray-400"}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

// ─── Profile Page (exported) ──────────────────────────────────────────────────
export function ProfilePage({ onNavigateHome }: { onNavigateHome?: () => void }) {
  const { section } = useParams<{ section?: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("Profile");

  useEffect(() => {
    if (section && ["Profile", "Preferences", "Notifications", "Integrations"].includes(section)) {
      setActiveSection(section);
    }
  }, [section]);

  const handleSectionChange = (newSection: string) => {
    setActiveSection(newSection);
    navigate(`/settings/${newSection.toLowerCase()}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex max-w-7xl mx-auto w-full px-4 py-8 gap-6">
        <AccountSidebar activeSection={activeSection} onSelect={handleSectionChange} />
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{activeSection}</h1>
            <p className="text-sm text-gray-400 mt-1">{SECTION_SUBTITLES[activeSection]}</p>
          </div>
          <div key={activeSection} style={{animation:"profileFadeIn .15s ease both"}}>
            <style>{`@keyframes profileFadeIn{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}`}</style>
            {activeSection === "Profile"       && <ProfileSection onCancel={onNavigateHome ?? (() => {})} />}
            {activeSection === "Preferences"   && <PreferencesSection />}
            {activeSection === "Notifications" && <NotificationsContent />}
            {activeSection === "Integrations"  && <IntegrationsContent />}
            {!["Profile","Preferences","Notifications","Integrations"].includes(activeSection) && <ComingSoon section={activeSection} />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProfilePage;
