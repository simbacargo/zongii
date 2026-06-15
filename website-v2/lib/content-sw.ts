// Swahili overlay for catalog data. English lives in content.ts (canonical).
// Long-form news bodies are intentionally English-only for now.

export const SW = {
  categories: {
    "Building Materials": "Vifaa vya Ujenzi",
    "Building Tools": "Zana za Ujenzi",
    Engineering: "Uhandisi",
    General: "Jumla",
    Mining: "Madini",
    PVC: "PVC",
  } as Record<string, string>,

  products: {
    "water-sinks": {
      name: "Sinki za Maji",
      description: "Sinki bora kwa matumizi ya nyumbani na biashara.",
    },
    "water-pumps": {
      name: "Pampu za Maji",
      description:
        "Suluhisho la kuaminika la kusukuma maji kwa mfumo wa kila ukubwa.",
    },
    "plumbing-accessories": {
      name: "Vifaa na Viunganishi vya Madini",
      description: "Aina kamili ya viunganishi, vali na vipasua.",
    },
    "ceramic-wares": {
      name: "Bidhaa za Kauri",
      description: "Beseni, vyoo na vifaa vya bafu vya kauri vya hadhi ya juu.",
    },
    "hot-water-systems": {
      name: "Mifumo ya Maji ya Moto",
      description:
        "Mifumo ya maji ya moto ya jua na umeme kwa kila aina ya jengo.",
    },
    "poly-footwear": {
      name: "Viatu vya Poly",
      description:
        "Viatu imara vya kinga vya polyethilini kwa matumizi ya eneo la kazi.",
    },
    "pvc-fittings": {
      name: "Viunganishi vya PVC",
      description:
        "Uteuzi kamili wa viwiko, T, vipunguza na viunganishi vya PVC.",
    },
    "polyethylene-tanks": {
      name: "Matangi ya Polyethilini",
      description:
        "Matangi ya kuhifadhi maji yaliyozuiliwa na UV ya ukubwa mbalimbali.",
    },
    "pvc-pipes": {
      name: "Mabomba ya PVC",
      description:
        "Mabomba ya PVC yenye uwezo wa shinikizo kwa usambazaji wa maji na mifereji.",
    },
  } as Record<string, { name: string; description: string }>,

  industries: {
    commercial: {
      label: "Biashara",
      description: "Maeneo ya ofisi, vituo vya rejareja na maendeleo ya kibiashara.",
    },
    residential: {
      label: "Nyumba za Makazi",
      description: "Ujenzi mpya na ukarabati kwa wamiliki wa nyumba.",
    },
    estate: {
      label: "Mawakala wa Mali na Pango",
      description: "Usambazaji wa wingi kwa kampuni za usimamizi wa mali.",
    },
    landlords: {
      label: "Wamiliki wa Nyumba za Pango",
      description: "Vifaa vya matengenezo na uboreshaji kwa nyumba za pango.",
    },
    developers: {
      label: "Wajenzi / Wawekezaji",
      description: "Ununuzi wa kiwango kikubwa kwa bei nzuri.",
    },
    industrial: {
      label: "Viwanda",
      description: "Suluhisho imara la mabomba kwa viwanda na mitambo.",
    },
    hospitality: {
      label: "Ukarimu",
      description: "Hoteli, nyumba za wageni na migahawa kote Tanzania.",
    },
    fitness: {
      label: "Mazoezi",
      description: "Mifumo ya maji na huduma kwa jimu na vituo vya michezo.",
    },
    construction: {
      label: "Ujenzi",
      description: "Usambazaji wa eneo la kazi kwa wakandarasi na miradi ya ujenzi.",
    },
    mining: {
      label: "Mabomba na Vifaa vya Madini",
      description: "Mifumo imara iliyokadiriwa kwa mazingira magumu ya migodi.",
    },
  } as Record<string, { label: string; description: string }>,

  // VALUES are keyed by their English title
  values: {
    "Guaranteed Quality": {
      title: "Ubora wa Uhakika",
      description:
        "Kila bidhaa inakidhi viwango vya kimataifa vya udumu na utendaji katika mazingira ya Afrika Mashariki.",
    },
    "Reliable Delivery": {
      title: "Usambazaji wa Kuaminika",
      description:
        "Utoaji wa haraka na wa kutegemewa kote Mwanza, Dar es Salaam na mikoa ya Tanzania.",
    },
    "Expert Guidance": {
      title: "Ushauri wa Kitaalamu",
      description:
        "Maarifa ya kiufundi ya zaidi ya miaka 22 kukusaidia kuchagua suluhisho sahihi mara ya kwanza.",
    },
    "Complete Range": {
      title: "Aina Kamili",
      description:
        "Kutoka mabomba ya PVC hadi mifumo ya maji ya moto — kila unachohitaji kutoka msambazaji mmoja wa kuaminika.",
    },
  } as Record<string, { title: string; description: string }>,

  // STATS keyed by English label
  stats: {
    "Years of Experience": "Miaka ya Uzoefu",
    "Product Lines": "Aina za Bidhaa",
    "Industries Served": "Sekta Zinazohudumiwa",
    "Projects Completed": "Miradi Iliyokamilika",
  } as Record<string, string>,

  news: {
    "pvc-range-expansion-2025": {
      title:
        "Aina Iliyoongezwa ya Mabomba na Viunganishi vya PVC Sasa Inapatikana",
      excerpt:
        "Tumeongeza kwa kiasi kikubwa aina yetu ya bidhaa za PVC kujumuisha viwango vipya vya shinikizo, vipenyo na viunganishi maalum kukidhi mahitaji ya miradi mikubwa ya ujenzi kote Tanzania.",
    },
    "zongii-22-years-2024": {
      title: "Tunasherehekea Miaka 22 ya Kuihudumia Tanzania",
      excerpt:
        "Tarehe 5 Aprili 2025, Zongii Mining Co. Limited inatimiza miaka 22 tangu kuanzishwa kwake. Tunatafakari miongo miwili ya ukuaji, uaminifu na kujitolea kwa sekta ya ujenzi Tanzania.",
    },
    "water-conservation-dry-season": {
      title: "Uhifadhi wa Maji: Vidokezo vya Kivitendo kwa Msimu wa Kiangazi",
      excerpt:
        "Kadri msimu wa kiangazi unavyokaribia Kanda ya Ziwa, Zongii inashiriki ushauri wa kivitendo kuhusu uhifadhi wa maji, mifumo bora ya mabomba na bidhaa sahihi za kupunguza matumizi.",
    },
    "quality-standards-building-materials": {
      title: "Kwa Nini Ubora wa Vifaa ni Muhimu katika Ujenzi wa Afrika Mashariki",
      excerpt:
        "Vifaa duni vya ujenzi vinaendelea kuwa changamoto kote Afrika Mashariki. Zongii inaeleza cha kuangalia, kwa nini uthibitisho ni muhimu na jinsi tunavyohakikisha ubora wa kila bidhaa tunayouza.",
    },
    "ceramic-sanitaryware-new-stock": {
      title: "Mkusanyiko Mpya wa Bidhaa za Kauri za Bafuni Unapatikana",
      excerpt:
        "Mkusanyiko wetu mpya wa beseni, vyoo na vifaa vya bafu vya kauri umewasili — ukiwa na miundo ya kisasa inayofaa kwa mapambo ya ndani ya nyumba na biashara.",
    },
    "hot-water-solar-systems-guide": {
      title: "Maji ya Moto ya Jua dhidi ya Umeme: Yapi Yanafaa Jengo Lako?",
      excerpt:
        "Kwa gharama za umeme zinazoongezeka na teknolojia bora ya jua, wamiliki wengi wa mali Tanzania wanahamia mifumo ya maji ya moto ya jua. Tunachambua tofauti kuu, gharama na mambo ya kuzingatia.",
    },
  } as Record<string, { title: string; excerpt: string }>,
};
