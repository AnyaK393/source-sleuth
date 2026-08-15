// ============================================================
// SOURCE SLEUTH - COMPLETE APPLICATION
// Voice Input + Multi-Language + Analysis + Visualization
// UNESCO Media & Information Literacy Hackathon
// ============================================================


// ============================================================
// STATE
// ============================================================

let currentData = null;
let secondData = null;
let currentFilter = "all";

let analysisHistory = JSON.parse(
    localStorage.getItem("sourceSleuthHistory") || "[]"
);

let currentLanguage =
    localStorage.getItem("sourceSleuthLang") || "en";

let activeRecognition = null;
let isListening = false;


// ============================================================
// DOM HELPER
// ============================================================

function $(id) {
    return document.getElementById(id);
}


function debugLog(message, data) {

    const timestamp =
        new Date().toLocaleTimeString();

    let log =
        `[${timestamp}] ${message}`;

    if (data !== undefined) {

        try {

            log +=
                "\n" +
                JSON.stringify(
                    data,
                    null,
                    2
                ).substring(0, 500);

        } catch (e) {

            log +=
                "\n" +
                String(data);
        }
    }

    const debugEl =
        $("debugOutput");

    if (debugEl) {

        debugEl.textContent =
            log +
            "\n\n" +
            debugEl.textContent;
    }

    console.log(message, data !== undefined ? data : "");
}


// ============================================================
// TRANSLATIONS
// ============================================================

const translations = {

    en: {

        heroTitle:
            "Don't tell me what to believe.",

        heroSubtitle:
            "Show me the evidence.",

        heroDescription:
            "Analyze information, verify claims, and understand what you can trust.",

        analyze:
            "Analyze",

        analyzing:
            "Analyzing content...",

        urlTab:
            "URL",

        textTab:
            "Paste Text",

        urlPlaceholder:
            "https://example.com/article",

        textPlaceholder:
            "Paste the full article text here...",

        compare:
            "Compare with Another Article",

        tweet:
            "Tweet",

        linkedin:
            "LinkedIn",

        downloadPNG:
            "Download PNG",

        exportPDF:
            "Export PDF",

        history:
            "Recent Analyses",

        clearAll:
            "Clear All",

        verified:
            "Verified",

        weak:
            "Weak",

        unsourced:
            "Unsourced",

        all:
            "All",

        showSources:
            "📖 Show Sources",

        hideSources:
            "📖 Hide Sources",

        articleAnalysis:
            "Article Analysis",

        analysisComplete:
            "Analysis complete",

        trustScore:
            "Trust Score",

        confidence:
            "confidence",

        noClaims:
            "No claims found.",

        noVisualizationClaims:
            "No claims found",

        suggestedSources:
            "📚 Suggested Sources:",

        factChecked:
            "Fact-Checked",

        publisher:
            "Publisher:",

        rating:
            "Rating:",

        viewSource:
            "View Source",

        firstMoreCredible:
            "First article is more credible",

        secondMoreCredible:
            "Second article is more credible",

        similarCredibility:
            "Both articles have similar credibility",

        significantDifference:
            "⚠️ Significant difference detected!",

        voiceListening:
            "Listening...",

        voiceReady:
            "Voice input",

        voiceSuccess:
            "Voice captured",

        voicePermission:
            "Microphone access was blocked. Please allow microphone access in your browser settings.",

        voiceNoSpeech:
            "No speech detected. Please try again.",

        voiceNoMicrophone:
            "No microphone was detected. Please check your microphone.",

        voiceNetwork:
            "Speech recognition needs an internet connection in this browser.",

        voiceUnsupported:
            "Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.",

        invalidUrl:
            "Please paste a valid URL.",

        invalidText:
            "Please paste at least 20 characters of article text.",

        backendError:
            "Error: Make sure the backend is running on port 5000.",

        noDataExport:
            "No data to export. Analyze an article first!",

        noVisualization:
            "No visualization to download. Analyze an article first!",

        compareUrl:
            "Please paste a second article URL.",

        compareError:
            "Error comparing articles."
    },


    es: {

        heroTitle:
            "No me digas qué creer.",

        heroSubtitle:
            "Muéstrame la evidencia.",

        heroDescription:
            "Analiza información, verifica afirmaciones y descubre en qué puedes confiar.",

        analyze:
            "Analizar",

        analyzing:
            "Analizando contenido...",

        urlTab:
            "URL",

        textTab:
            "Pegar Texto",

        urlPlaceholder:
            "https://ejemplo.com/articulo",

        textPlaceholder:
            "Pega el texto completo del artículo aquí...",

        compare:
            "Comparar con Otro Artículo",

        tweet:
            "Tuitear",

        linkedin:
            "LinkedIn",

        downloadPNG:
            "Descargar PNG",

        exportPDF:
            "Exportar PDF",

        history:
            "Análisis Recientes",

        clearAll:
            "Borrar Todo",

        verified:
            "Verificado",

        weak:
            "Débil",

        unsourced:
            "Sin Fuente",

        all:
            "Todas",

        showSources:
            "📖 Mostrar Fuentes",

        hideSources:
            "📖 Ocultar Fuentes",

        articleAnalysis:
            "Análisis del Artículo",

        analysisComplete:
            "Análisis completo",

        trustScore:
            "Puntuación de Confianza",

        confidence:
            "confianza",

        noClaims:
            "No se encontraron afirmaciones.",

        noVisualizationClaims:
            "No se encontraron afirmaciones",

        suggestedSources:
            "📚 Fuentes Sugeridas:",

        factChecked:
            "Verificado",

        publisher:
            "Editor:",

        rating:
            "Calificación:",

        viewSource:
            "Ver Fuente",

        firstMoreCredible:
            "El primer artículo es más creíble",

        secondMoreCredible:
            "El segundo artículo es más creíble",

        similarCredibility:
            "Ambos artículos tienen una credibilidad similar",

        significantDifference:
            "⚠️ ¡Se detectó una diferencia significativa!",

        voiceListening:
            "Escuchando...",

        voiceReady:
            "Entrada de voz",

        voiceSuccess:
            "Voz capturada",

        voicePermission:
            "El acceso al micrófono fue bloqueado. Permite el acceso al micrófono en la configuración del navegador.",

        voiceNoSpeech:
            "No se detectó voz. Inténtalo de nuevo.",

        voiceNoMicrophone:
            "No se detectó ningún micrófono. Comprueba tu micrófono.",

        voiceNetwork:
            "El reconocimiento de voz necesita conexión a Internet en este navegador.",

        voiceUnsupported:
            "La entrada de voz no es compatible con este navegador. Usa Google Chrome o Microsoft Edge.",

        invalidUrl:
            "Introduce una URL válida.",

        invalidText:
            "Pega al menos 20 caracteres de texto.",

        backendError:
            "Error: Asegúrate de que el backend esté ejecutándose en el puerto 5000.",

        noDataExport:
            "No hay datos para exportar. Analiza un artículo primero.",

        noVisualization:
            "No hay visualización para descargar. Analiza un artículo primero.",

        compareUrl:
            "Introduce la URL de un segundo artículo.",

        compareError:
            "Error al comparar artículos."
    },


    hi: {

        heroTitle:
            "मुझे मत बताओ कि क्या विश्वास करना है।",

        heroSubtitle:
            "मुझे सबूत दिखाओ।",

        heroDescription:
            "जानकारी का विश्लेषण करें, दावों की पुष्टि करें और समझें कि किस पर भरोसा किया जा सकता है।",

        analyze:
            "विश्लेषण करें",

        analyzing:
            "सामग्री का विश्लेषण हो रहा है...",

        urlTab:
            "यूआरएल",

        textTab:
            "पाठ चिपकाएं",

        urlPlaceholder:
            "https://example.com/article",

        textPlaceholder:
            "लेख का पूरा पाठ यहां चिपकाएं...",

        compare:
            "दूसरे लेख से तुलना करें",

        tweet:
            "ट्वीट करें",

        linkedin:
            "लिंक्डइन",

        downloadPNG:
            "PNG डाउनलोड करें",

        exportPDF:
            "PDF निर्यात करें",

        history:
            "हाल के विश्लेषण",

        clearAll:
            "सभी हटाएं",

        verified:
            "सत्यापित",

        weak:
            "कमजोर",

        unsourced:
            "बिना स्रोत",

        all:
            "सभी",

        showSources:
            "📖 स्रोत दिखाएं",

        hideSources:
            "📖 स्रोत छिपाएं",

        articleAnalysis:
            "लेख विश्लेषण",

        analysisComplete:
            "विश्लेषण पूरा हुआ",

        trustScore:
            "विश्वसनीयता स्कोर",

        confidence:
            "विश्वास",

        noClaims:
            "कोई दावा नहीं मिला।",

        noVisualizationClaims:
            "कोई दावा नहीं मिला",

        suggestedSources:
            "📚 सुझाए गए स्रोत:",

        factChecked:
            "तथ्य-जांच की गई",

        publisher:
            "प्रकाशक:",

        rating:
            "रेटिंग:",

        viewSource:
            "स्रोत देखें",

        firstMoreCredible:
            "पहला लेख अधिक विश्वसनीय है",

        secondMoreCredible:
            "दूसरा लेख अधिक विश्वसनीय है",

        similarCredibility:
            "दोनों लेखों की विश्वसनीयता समान है",

        significantDifference:
            "⚠️ महत्वपूर्ण अंतर पाया गया!",

        voiceListening:
            "सुन रहा है...",

        voiceReady:
            "वॉइस इनपुट",

        voiceSuccess:
            "आवाज़ प्राप्त हुई",

        voicePermission:
            "माइक्रोफ़ोन की अनुमति ब्लॉक है। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन की अनुमति दें।",

        voiceNoSpeech:
            "कोई आवाज़ नहीं मिली। कृपया फिर कोशिश करें।",

        voiceNoMicrophone:
            "कोई माइक्रोफ़ोन नहीं मिला। कृपया अपना माइक्रोफ़ोन जांचें।",

        voiceNetwork:
            "इस ब्राउज़र में स्पीच रिकग्निशन के लिए इंटरनेट कनेक्शन आवश्यक है।",

        voiceUnsupported:
            "इस ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। Google Chrome या Microsoft Edge का उपयोग करें।",

        invalidUrl:
            "कृपया एक मान्य URL डालें।",

        invalidText:
            "कृपया कम से कम 20 अक्षरों का टेक्स्ट डालें।",

        backendError:
            "त्रुटि: सुनिश्चित करें कि बैकएंड पोर्ट 5000 पर चल रहा है।",

        noDataExport:
            "निर्यात करने के लिए कोई डेटा नहीं है। पहले किसी लेख का विश्लेषण करें।",

        noVisualization:
            "डाउनलोड करने के लिए कोई विज़ुअलाइज़ेशन नहीं है। पहले किसी लेख का विश्लेषण करें।",

        compareUrl:
            "कृपया दूसरे लेख का URL डालें।",

        compareError:
            "लेखों की तुलना करते समय त्रुटि हुई।"
    },


    fr: {

        heroTitle:
            "Ne me dis pas quoi croire.",

        heroSubtitle:
            "Montre-moi les preuves.",

        heroDescription:
            "Analysez les informations, vérifiez les affirmations et comprenez ce qui est fiable.",

        analyze:
            "Analyser",

        analyzing:
            "Analyse du contenu...",

        urlTab:
            "URL",

        textTab:
            "Coller le Texte",

        urlPlaceholder:
            "https://exemple.com/article",

        textPlaceholder:
            "Collez le texte complet de l'article ici...",

        compare:
            "Comparer avec un Autre Article",

        tweet:
            "Tweeter",

        linkedin:
            "LinkedIn",

        downloadPNG:
            "Télécharger PNG",

        exportPDF:
            "Exporter PDF",

        history:
            "Analyses Récentes",

        clearAll:
            "Tout Effacer",

        verified:
            "Vérifié",

        weak:
            "Faible",

        unsourced:
            "Sans Source",

        all:
            "Toutes",

        showSources:
            "📖 Afficher les Sources",

        hideSources:
            "📖 Masquer les Sources",

        articleAnalysis:
            "Analyse de l'Article",

        analysisComplete:
            "Analyse terminée",

        trustScore:
            "Score de Confiance",

        confidence:
            "confiance",

        noClaims:
            "Aucune affirmation trouvée.",

        noVisualizationClaims:
            "Aucune affirmation trouvée",

        suggestedSources:
            "📚 Sources Suggérées:",

        factChecked:
            "Vérifié",

        publisher:
            "Éditeur:",

        rating:
            "Évaluation:",

        viewSource:
            "Voir la Source",

        firstMoreCredible:
            "Le premier article est plus crédible",

        secondMoreCredible:
            "Le deuxième article est plus crédible",

        similarCredibility:
            "Les deux articles ont une crédibilité similaire",

        significantDifference:
            "⚠️ Différence significative détectée !",

        voiceListening:
            "Écoute...",

        voiceReady:
            "Entrée vocale",

        voiceSuccess:
            "Voix capturée",

        voicePermission:
            "L'accès au microphone a été bloqué. Autorisez le microphone dans les paramètres du navigateur.",

        voiceNoSpeech:
            "Aucune voix détectée. Veuillez réessayer.",

        voiceNoMicrophone:
            "Aucun microphone détecté. Vérifiez votre microphone.",

        voiceNetwork:
            "La reconnaissance vocale nécessite une connexion Internet dans ce navigateur.",

        voiceUnsupported:
            "La saisie vocale n'est pas prise en charge dans ce navigateur. Utilisez Google Chrome ou Microsoft Edge.",

        invalidUrl:
            "Veuillez saisir une URL valide.",

        invalidText:
            "Veuillez saisir au moins 20 caractères.",

        backendError:
            "Erreur : assurez-vous que le backend fonctionne sur le port 5000.",

        noDataExport:
            "Aucune donnée à exporter. Analysez d'abord un article.",

        noVisualization:
            "Aucune visualisation à télécharger. Analysez d'abord un article.",

        compareUrl:
            "Veuillez saisir l'URL d'un deuxième article.",

        compareError:
            "Erreur lors de la comparaison des articles."
    },


    ar: {

        heroTitle:
            "لا تخبرني بما أؤمن به.",

        heroSubtitle:
            "أرني الدليل.",

        heroDescription:
            "حلل المعلومات، وتحقق من الادعاءات، وافهم ما يمكنك الوثوق به.",

        analyze:
            "تحليل",

        analyzing:
            "جارٍ تحليل المحتوى...",

        urlTab:
            "رابط",

        textTab:
            "لصق النص",

        urlPlaceholder:
            "https://example.com/article",

        textPlaceholder:
            "الصق النص الكامل للمقال هنا...",

        compare:
            "مقارنة مع مقال آخر",

        tweet:
            "تغريد",

        linkedin:
            "لينكدإن",

        downloadPNG:
            "تحميل PNG",

        exportPDF:
            "تصدير PDF",

        history:
            "التحليلات الأخيرة",

        clearAll:
            "مسح الكل",

        verified:
            "موثق",

        weak:
            "ضعيف",

        unsourced:
            "بدون مصدر",

        all:
            "الكل",

        showSources:
            "📖 إظهار المصادر",

        hideSources:
            "📖 إخفاء المصادر",

        articleAnalysis:
            "تحليل المقال",

        analysisComplete:
            "اكتمل التحليل",

        trustScore:
            "درجة الموثوقية",

        confidence:
            "الثقة",

        noClaims:
            "لم يتم العثور على ادعاءات.",

        noVisualizationClaims:
            "لم يتم العثور على ادعاءات",

        suggestedSources:
            "📚 المصادر المقترحة:",

        factChecked:
            "تم التحقق",

        publisher:
            "الناشر:",

        rating:
            "التقييم:",

        viewSource:
            "عرض المصدر",

        firstMoreCredible:
            "المقال الأول أكثر موثوقية",

        secondMoreCredible:
            "المقال الثاني أكثر موثوقية",

        similarCredibility:
            "المقالان لهما مستوى موثوقية متشابه",

        significantDifference:
            "⚠️ تم اكتشاف فرق كبير!",

        voiceListening:
            "جارٍ الاستماع...",

        voiceReady:
            "الإدخال الصوتي",

        voiceSuccess:
            "تم التقاط الصوت",

        voicePermission:
            "تم حظر الوصول إلى الميكروفون. يرجى السماح بالوصول إلى الميكروفون في إعدادات المتصفح.",

        voiceNoSpeech:
            "لم يتم اكتشاف أي كلام. حاول مرة أخرى.",

        voiceNoMicrophone:
            "لم يتم العثور على ميكروفون. تحقق من الميكروفون.",

        voiceNetwork:
            "يحتاج التعرف على الكلام إلى اتصال بالإنترنت في هذا المتصفح.",

        voiceUnsupported:
            "الإدخال الصوتي غير مدعوم في هذا المتصفح. استخدم Google Chrome أو Microsoft Edge.",

        invalidUrl:
            "يرجى إدخال رابط صالح.",

        invalidText:
            "يرجى إدخال نص لا يقل عن 20 حرفًا.",

        backendError:
            "خطأ: تأكد من تشغيل الخادم الخلفي على المنفذ 5000.",

        noDataExport:
            "لا توجد بيانات للتصدير. قم بتحليل مقال أولاً.",

        noVisualization:
            "لا يوجد تصور لتنزيله. قم بتحليل مقال أولاً.",

        compareUrl:
            "يرجى إدخال رابط المقال الثاني.",

        compareError:
            "حدث خطأ أثناء مقارنة المقالات."
    }
};


// ============================================================
// SPEECH LANGUAGE MAP
// ============================================================

const speechLanguages = {

    en:
        "en-US",

    es:
        "es-ES",

    hi:
        "hi-IN",

    fr:
        "fr-FR",

    ar:
        "ar-SA"
};


// ============================================================
// LANGUAGE HELPERS
// ============================================================

function getTranslation() {

    return (
        translations[currentLanguage] ||
        translations.en
    );
}


function setLanguage(lang) {

    if (!translations[lang]) {

        lang = "en";
    }

    currentLanguage =
        lang;

    localStorage.setItem(
        "sourceSleuthLang",
        lang
    );

    document.documentElement.lang =
        lang;

    document.documentElement.dir =
        lang === "ar"
            ? "rtl"
            : "ltr";

    const select =
        $("languageSelect");

    if (select) {

        select.value =
            lang;
    }

    applyTranslations(lang);

    /*
     * If voice recognition is currently running,
     * restart it using the new language.
     */

    if (isListening && activeRecognition) {

        try {

            activeRecognition.stop();

        } catch (e) {

            console.warn(
                "Could not stop recognition while changing language."
            );
        }
    }

    debugLog(
        `🌍 Language changed to ${lang}`
    );
}


// ============================================================
// APPLY TRANSLATIONS
// ============================================================

function applyTranslations(lang) {

    const t =
        translations[lang] ||
        translations.en;


    // --------------------------------------------------------
    // HERO
    // --------------------------------------------------------

    const heroTitle =
        document.querySelector(
            ".hero h1"
        );

    const heroSubtitle =
        document.querySelector(
            ".hero h2"
        );

    const heroDesc =
        document.querySelector(
            ".hero p"
        );


    if (heroTitle) {

        heroTitle.textContent =
            t.heroTitle;
    }

    if (heroSubtitle) {

        heroSubtitle.textContent =
            t.heroSubtitle;
    }

    if (heroDesc) {

        heroDesc.textContent =
            t.heroDescription;
    }


    // --------------------------------------------------------
    // ANALYZE BUTTON
    // --------------------------------------------------------

    const analyzeBtn =
        document.querySelector(
            ".btn-primary"
        );

    if (analyzeBtn) {

        analyzeBtn.innerHTML =
            `<i class="fas fa-search"></i> ${t.analyze}`;
    }


    // --------------------------------------------------------
    // INPUT TABS
    // --------------------------------------------------------

    document
        .querySelectorAll(".input-tab")
        .forEach(tab => {

            const type =
                tab.dataset.tab;

            if (type === "url") {

                tab.innerHTML =
                    `<i class="fas fa-link"></i> ${t.urlTab}`;

            } else if (type === "text") {

                tab.innerHTML =
                    `<i class="fas fa-file-alt"></i> ${t.textTab}`;
            }
        });


    // --------------------------------------------------------
    // PLACEHOLDERS
    // --------------------------------------------------------

    const urlInput =
        $("urlInput");

    const textInput =
        $("textInput");


    if (urlInput) {

        urlInput.placeholder =
            t.urlPlaceholder;
    }

    if (textInput) {

        textInput.placeholder =
            t.textPlaceholder;
    }


    // --------------------------------------------------------
    // COMPARE
    // --------------------------------------------------------

    const compareBtn =
        document.querySelector(
            ".compare-btn"
        );

    if (compareBtn) {

        compareBtn.innerHTML =
            `<i class="fas fa-code-branch"></i> ${t.compare}`;
    }


    // --------------------------------------------------------
    // SHARE BUTTONS
    // --------------------------------------------------------

    document
        .querySelectorAll(".share-btn")
        .forEach(btn => {

            if (
                btn.classList.contains(
                    "twitter"
                )
            ) {

                btn.innerHTML =
                    `<i class="fab fa-twitter"></i> ${t.tweet}`;
            }

            if (
                btn.classList.contains(
                    "linkedin"
                )
            ) {

                btn.innerHTML =
                    `<i class="fab fa-linkedin"></i> ${t.linkedin}`;
            }

            if (
                btn.classList.contains(
                    "download"
                )
            ) {

                btn.innerHTML =
                    `<i class="fas fa-image"></i> ${t.downloadPNG}`;
            }

            if (
                btn.classList.contains(
                    "pdf"
                )
            ) {

                btn.innerHTML =
                    `<i class="fas fa-file-pdf"></i> ${t.exportPDF}`;
            }
        });


    // --------------------------------------------------------
    // HISTORY
    // --------------------------------------------------------

    const historyTitle =
        document.querySelector(
            ".history-header h3"
        );

    if (historyTitle) {

        historyTitle.innerHTML =
            `<i class="fas fa-history"></i> ${t.history}`;
    }


    const clearBtn =
        document.querySelector(
            ".clear-history"
        );

    if (clearBtn) {

        clearBtn.textContent =
            t.clearAll;
    }


    // --------------------------------------------------------
    // FILTER BUTTONS
    // --------------------------------------------------------

    document
        .querySelectorAll(".filter-btn")
        .forEach(btn => {

            const status =
                btn.dataset.status;

            if (status === "all") {

                btn.textContent =
                    t.all;

            } else if (status === "green") {

                btn.textContent =
                    `✅ ${t.verified}`;

            } else if (status === "yellow") {

                btn.textContent =
                    `⚠️ ${t.weak}`;

            } else if (status === "red") {

                btn.textContent =
                    `❌ ${t.unsourced}`;
            }
        });


    // --------------------------------------------------------
    // VOICE BUTTON
    // --------------------------------------------------------

    updateVoiceButton();


    // --------------------------------------------------------
    // DYNAMIC CONTENT
    // --------------------------------------------------------

    updateDynamicTranslations();


    // --------------------------------------------------------
    // REBUILD CLAIMS IF RESULTS EXIST
    // --------------------------------------------------------

    if (currentData) {

        generateClaimsList(
            currentData
        );

        generateVisualization(
            currentData
        );
    }


    debugLog(
        `✅ Translations applied: ${lang}`
    );
}


// ============================================================
// DYNAMIC TRANSLATIONS
// ============================================================

function updateDynamicTranslations() {

    const t =
        getTranslation();


    const loadingText =
        $("loadingText");

    if (loadingText) {

        if (
            loadingText.textContent
                .toLowerCase()
                .includes("analy")
        ) {

            loadingText.textContent =
                t.analyzing;
        }
    }


    const confidenceText =
        $("confidenceText");

    if (confidenceText) {

        const match =
            confidenceText.textContent
                .match(/\d+/);

        if (match) {

            confidenceText.textContent =
                `${match[0]}% ${t.confidence}`;
        }
    }
}


// ============================================================
// THEME
// ============================================================

function toggleTheme() {

    const html =
        document.documentElement;

    const icon =
        $("themeIcon");

    const current =
        html.getAttribute(
            "data-theme"
        );


    if (current === "dark") {

        html.removeAttribute(
            "data-theme"
        );

        if (icon) {

            icon.className =
                "fas fa-moon";
        }

        localStorage.setItem(
            "theme",
            "light"
        );

    } else {

        html.setAttribute(
            "data-theme",
            "dark"
        );

        if (icon) {

            icon.className =
                "fas fa-sun";
        }

        localStorage.setItem(
            "theme",
            "dark"
        );
    }
}


function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "theme"
        );

    const icon =
        $("themeIcon");


    if (savedTheme === "dark") {

        document.documentElement
            .setAttribute(
                "data-theme",
                "dark"
            );

        if (icon) {

            icon.className =
                "fas fa-sun";
        }

    } else {

        document.documentElement
            .removeAttribute(
                "data-theme"
            );

        if (icon) {

            icon.className =
                "fas fa-moon";
        }
    }
}


// ============================================================
// TABS
// ============================================================

function switchTab(tab) {

    document
        .querySelectorAll(".input-tab")
        .forEach(t => {

            t.classList.toggle(
                "active",
                t.dataset.tab === tab
            );
        });


    const urlContainer =
        $("urlInputContainer");

    const textContainer =
        $("textInputContainer");


    if (urlContainer) {

        urlContainer.style.display =
            tab === "url"
                ? "block"
                : "none";
    }


    if (textContainer) {

        textContainer.style.display =
            tab === "text"
                ? "block"
                : "none";
    }
}


// ============================================================
// ANALYZE URL
// ============================================================

async function analyzeArticle() {

    const input =
        $("urlInput");

    if (!input)
        return;


    const url =
        input.value.trim();


    if (!url) {

        alert(
            getTranslation().invalidUrl
        );

        return;
    }


    debugLog(
        `🔍 Analyzing URL: "${url}"`
    );


    await performAnalysis({
        url: url
    });
}


// ============================================================
// ANALYZE TEXT
// ============================================================

async function analyzeText() {

    const input =
        $("textInput");

    if (!input)
        return;


    const text =
        input.value.trim();


    if (
        !text ||
        text.length < 20
    ) {

        alert(
            getTranslation().invalidText
        );

        return;
    }


    debugLog(
        `📝 Analyzing text (${text.length} chars)`
    );


    await performAnalysis({

        text: text,

        url: "text-input"
    });
}


// ============================================================
// PERFORM ANALYSIS
// ============================================================

async function performAnalysis(payload) {

    const loading =
        $("loading");

    const results =
        $("results");


    if (loading) {

        loading.style.display =
            "block";
    }


    if (results) {

        results.style.display =
            "none";
    }


    const loadingText =
        $("loadingText");

    if (loadingText) {

        loadingText.textContent =
            getTranslation().analyzing;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/analyze",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const result =
            await response.json();


        debugLog(
            "📦 Response:",
            result
        );


        if (result.success) {

            currentData =
                result.data;

            currentData._analyzedAt =
                new Date().toISOString();


            displayResults(
                currentData
            );


            addToHistory(
                currentData
            );

        } else {

            alert(
                "Error: " +
                (
                    result.error ||
                    "Could not analyze content."
                )
            );
        }


    } catch (error) {

        debugLog(
            `❌ Error: ${error.message}`
        );


        alert(
            getTranslation().backendError
        );

    } finally {

        if (loading) {

            loading.style.display =
                "none";
        }
    }
}


// ============================================================
// DISPLAY RESULTS
// ============================================================

function displayResults(data) {

    debugLog(
        `🎨 Displaying: "${data.title || "Untitled"}"`
    );


    const results =
        $("results");

    if (results) {

        results.style.display =
            "block";
    }


    const score =
        Number(
            data.trust_score || 0
        );


    animateNumber(
        "scoreNumber",
        0,
        score
    );


    const resultTitle =
        $("resultTitle");

    if (resultTitle) {

        resultTitle.textContent =
            data.title ||
            getTranslation().articleAnalysis;
    }


    const trustDescription =
        $("trustDescription");

    if (trustDescription) {

        trustDescription.textContent =
            data.trust_score_description ||
            getTranslation().analysisComplete;
    }


    const confidence =
        Number(
            data._confidence || 85
        );


    const confidenceText =
        $("confidenceText");

    if (confidenceText) {

        confidenceText.textContent =
            `${confidence}% ${getTranslation().confidence}`;
    }


    const confidenceDisplay =
        $("confidenceDisplay");

    if (confidenceDisplay) {

        confidenceDisplay.style.display =
            "inline-block";
    }


    const circle =
        document.querySelector(
            ".score-circle"
        );


    if (circle) {

        if (score < 30) {

            circle.style.background =
                "linear-gradient(135deg, #fd79a8, #e17055)";

        } else if (score < 60) {

            circle.style.background =
                "linear-gradient(135deg, #fdcb6e, #f39c12)";

        } else {

            circle.style.background =
                "linear-gradient(135deg, #00b894, #00cec9)";
        }
    }


    const claims =
        Array.isArray(data.claims)
            ? data.claims
            : [];


    const verified =
        claims.filter(
            c =>
                c.source_status ===
                "green"
        ).length;


    const weak =
        claims.filter(
            c =>
                c.source_status ===
                "yellow"
        ).length;


    const unsourced =
        claims.filter(
            c =>
                c.source_status ===
                "red"
        ).length;


    if ($("detailVerified")) {

        $("detailVerified").textContent =
            verified;
    }


    if ($("detailWeak")) {

        $("detailWeak").textContent =
            weak;
    }


    if ($("detailUnsourced")) {

        $("detailUnsourced").textContent =
            unsourced;
    }


    if ($("detailTotal")) {

        $("detailTotal").textContent =
            claims.length;
    }


    generateVisualization(
        data
    );


    generateClaimsList(
        data
    );


    debugLog(
        `✅ Display complete: ${claims.length} claims`
    );
}


// ============================================================
// ANIMATE SCORE
// ============================================================

function animateNumber(
    elementId,
    start,
    end
) {

    const el =
        $(elementId);

    if (!el)
        return;


    let current =
        start;

    const steps =
        25;

    const step =
        (end - start) /
        steps;

    let count =
        0;


    const timer =
        setInterval(
            () => {

                count++;

                current +=
                    step;


                if (
                    count >=
                    steps
                ) {

                    current =
                        end;

                    clearInterval(
                        timer
                    );
                }


                el.textContent =
                    Math.round(
                        current
                    );

            },
            25
        );
}


// ============================================================
// D3 VISUALIZATION
// ============================================================

function generateVisualization(data) {

    const container =
        $("visualization");

    if (!container)
        return;


    container.innerHTML =
        "";


    const claims =
        Array.isArray(data.claims)
            ? data.claims
            : [];


    if (claims.length === 0) {

        container.innerHTML = `

            <div class="viz-placeholder">

                <div>

                    <i class="fas fa-exclamation-triangle"></i>

                    <span>
                        ${
                            getTranslation()
                                .noVisualizationClaims
                        }
                    </span>

                </div>

            </div>
        `;

        return;
    }


    if (
        typeof d3 ===
        "undefined"
    ) {

        container.innerHTML = `

            <div class="viz-placeholder">

                <div>

                    <i class="fas fa-exclamation-circle"></i>

                    <span>
                        D3.js could not be loaded.
                    </span>

                </div>

            </div>
        `;

        return;
    }


    try {

        const nodes = [

            {
                id: 0,

                label:
                    data.title ||
                    "Article",

                type:
                    "article",

                radius:
                    38
            }
        ];


        const links = [];


        claims.forEach(
            (claim, i) => {

                const idx =
                    i + 1;


                nodes.push({

                    id:
                        idx,

                    label:
                        (
                            claim.text ||
                            ""
                        ).substring(
                            0,
                            50
                        ) +
                        (
                            (
                                claim.text ||
                                ""
                            ).length >
                            50
                                ? "..."
                                : ""
                        ),

                    type:
                        "claim",

                    status:
                        claim.source_status ||
                        "yellow",

                    radius:
                        24,

                    explanation:
                        claim.explanation ||
                        "",

                    sources:
                        claim.suggested_sources ||
                        []
                });


                links.push({

                    source:
                        0,

                    target:
                        idx
                });
            }
        );


        const width =
            container.clientWidth ||
            900;

        const height =
            480;


        const svg =
            d3.select(
                "#visualization"
            )
            .append("svg")
            .attr(
                "width",
                width
            )
            .attr(
                "height",
                height
            )
            .style(
                "background",
                "transparent"
            );


        const sim =
            d3.forceSimulation(
                nodes
            )
            .force(
                "link",
                d3.forceLink(
                    links
                )
                .id(
                    d => d.id
                )
                .distance(
                    150
                )
                .strength(
                    0.4
                )
            )
            .force(
                "charge",
                d3.forceManyBody()
                    .strength(
                        -300
                    )
            )
            .force(
                "center",
                d3.forceCenter(
                    width / 2,
                    height / 2
                )
            );


        const link =
            svg.append("g")
                .selectAll("line")
                .data(links)
                .enter()
                .append("line")
                .style(
                    "stroke",
                    "var(--border-color)"
                )
                .style(
                    "stroke-width",
                    2
                )
                .style(
                    "stroke-opacity",
                    0.4
                );


        const nodeGroup =
            svg.append("g")
                .selectAll("g")
                .data(nodes)
                .enter()
                .append("g")
                .call(

                    d3.drag()

                        .on(
                            "start",
                            (e, d) => {

                                if (
                                    !e.active
                                ) {

                                    sim
                                        .alphaTarget(
                                            0.3
                                        )
                                        .restart();
                                }

                                d.fx =
                                    d.x;

                                d.fy =
                                    d.y;
                            }
                        )

                        .on(
                            "drag",
                            (e, d) => {

                                d.fx =
                                    e.x;

                                d.fy =
                                    e.y;
                            }
                        )

                        .on(
                            "end",
                            (e, d) => {

                                if (
                                    !e.active
                                ) {

                                    sim
                                        .alphaTarget(
                                            0
                                        );
                                }

                                d.fx =
                                    null;

                                d.fy =
                                    null;
                            }
                        )
                );


        nodeGroup
            .append("circle")

            .attr(
                "r",
                d => d.radius
            )

            .style(
                "fill",
                d => {

                    if (
                        d.type ===
                        "article"
                    ) {

                        return "#667eea";
                    }

                    if (
                        d.status ===
                        "green"
                    ) {

                        return "#00b894";
                    }

                    if (
                        d.status ===
                        "yellow"
                    ) {

                        return "#fdcb6e";
                    }

                    if (
                        d.status ===
                        "red"
                    ) {

                        return "#e17055";
                    }

                    return "#6a6a82";
                }
            )

            .style(
                "stroke",
                "var(--bg-card)"
            )

            .style(
                "stroke-width",
                3
            )

            .style(
                "cursor",
                "pointer"
            )

            .on(
                "click",
                (e, d) => {

                    if (
                        d.type ===
                        "claim"
                    ) {

                        alert(

                            `📌 ${d.label}\n\n` +

                            `Status: ${
                                (
                                    d.status ||
                                    "unknown"
                                ).toUpperCase()
                            }\n\n` +

                            `${
                                d.explanation ||
                                "No explanation"
                            }`
                        );
                    }
                }
            );


        nodeGroup
            .append("text")

            .text(
                d =>
                    d.label
            )

            .style(
                "font-size",
                "9px"
            )

            .style(
                "font-weight",
                "600"
            )

            .style(
                "text-anchor",
                "middle"
            )

            .style(
                "dy",
                d =>
                    d.radius + 14
            )

            .style(
                "fill",
                "var(--text-primary)"
            )

            .style(
                "pointer-events",
                "none"
            )

            .style(
                "font-family",
                "'Inter', sans-serif"
            )

            .style(
                "opacity",
                "0.8"
            );


        sim.on(
            "tick",
            () => {

                link

                    .attr(
                        "x1",
                        d =>
                            d.source.x
                    )

                    .attr(
                        "y1",
                        d =>
                            d.source.y
                    )

                    .attr(
                        "x2",
                        d =>
                            d.target.x
                    )

                    .attr(
                        "y2",
                        d =>
                            d.target.y
                    );


                nodeGroup.attr(
                    "transform",
                    d =>
                        `translate(${d.x},${d.y})`
                );
            }
        );


        debugLog(
            `✅ D3: ${nodes.length} nodes, ${links.length} links`
        );


    } catch (error) {

        debugLog(
            `❌ D3 error: ${error.message}`
        );


        container.innerHTML = `

            <div class="viz-placeholder">

                <div>

                    <i class="fas fa-exclamation-circle"></i>

                    <span>
                        Error: ${
                            escapeHtml(
                                error.message
                            )
                        }
                    </span>

                </div>

            </div>
        `;
    }
}


// ============================================================
// CLAIMS LIST
// ============================================================

function generateClaimsList(data) {

    const container =
        $("claimsList");

    if (!container)
        return;


    container.innerHTML =
        "";


    const claims =
        Array.isArray(data.claims)
            ? data.claims
            : [];


    if (
        claims.length ===
        0
    ) {

        container.innerHTML = `

            <p
                style="
                    color:var(--text-muted);
                    text-align:center;
                    padding:20px;
                "
            >
                ${
                    getTranslation()
                        .noClaims
                }
            </p>
        `;

        return;
    }


    const t =
        getTranslation();


    claims.forEach(
        (claim, index) => {

            const statusMap = {

                green:
                    `✅ ${t.verified}`,

                yellow:
                    `⚠️ ${t.weak}`,

                red:
                    `❌ ${t.unsourced}`
            };


            const statusClass =
                claim.source_status ||
                "yellow";


            const statusText =
                statusMap[
                    statusClass
                ] ||
                statusClass;


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                `claim-item ${statusClass}`;


            div.dataset.status =
                statusClass;


            let sourcesHtml =
                "";


            if (
                Array.isArray(
                    claim.suggested_sources
                ) &&
                claim.suggested_sources.length >
                    0
            ) {

                sourcesHtml = `

                    <div
                        class="claim-sources"
                        id="sources_${index}"
                    >

                        <strong>
                            ${t.suggestedSources}
                        </strong>

                        ${
                            claim.suggested_sources
                                .map(
                                    source => `

                                        <a
                                            href="${escapeHtml(source)}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            ${escapeHtml(source)}
                                        </a>
                                    `
                                )
                                .join("")
                        }

                    </div>
                `;
            }


            let factCheckHtml =
                "";


            if (
                claim.fact_checked &&
                Array.isArray(
                    claim.fact_check_results
                ) &&
                claim.fact_check_results.length >
                    0
            ) {

                factCheckHtml = `

                    <div
                        style="
                            margin-top:10px;
                            padding:10px 14px;
                            background:rgba(102,126,234,0.08);
                            border-radius:8px;
                            border-left:3px solid #667eea;
                        "
                    >

                        <div
                            style="
                                font-size:0.7rem;
                                font-weight:600;
                                color:var(--text-secondary);
                                margin-bottom:6px;
                            "
                        >

                            <i
                                class="fas fa-check-circle"
                                style="color:#00b894;"
                            ></i>

                            ${t.factChecked}

                            (${
                                claim
                                    .fact_check_results
                                    .length
                            } sources found)

                        </div>


                        ${
                            claim.fact_check_results
                                .map(
                                    (
                                        result,
                                        idx
                                    ) => `

                                        <div
                                            style="
                                                font-size:0.75rem;
                                                color:var(--text-secondary);
                                                padding:6px 0;
                                                ${
                                                    idx > 0
                                                        ? "border-top:1px solid var(--border-color);margin-top:4px;"
                                                        : ""
                                                }
                                            "
                                        >

                                            <div
                                                style="
                                                    color:var(--text-primary);
                                                    font-weight:500;
                                                    font-size:0.7rem;
                                                "
                                            >

                                                <i
                                                    class="fas fa-quote-left"
                                                    style="
                                                        color:var(--text-muted);
                                                        font-size:0.6rem;
                                                    "
                                                ></i>

                                                ${
                                                    escapeHtml(
                                                        result.text ||
                                                        "No text available"
                                                    )
                                                }

                                            </div>


                                            <div
                                                style="
                                                    margin-top:2px;
                                                    display:flex;
                                                    flex-wrap:wrap;
                                                    gap:4px 12px;
                                                    font-size:0.65rem;
                                                    color:var(--text-muted);
                                                "
                                            >

                                                <span>

                                                    <strong>
                                                        ${t.publisher}
                                                    </strong>

                                                    ${
                                                        escapeHtml(
                                                            result.publisher ||
                                                            "Unknown"
                                                        )
                                                    }

                                                </span>


                                                <span>

                                                    <strong>
                                                        ${t.rating}
                                                    </strong>

                                                    ${
                                                        escapeHtml(
                                                            result.review_text ||
                                                            "No rating"
                                                        )
                                                    }

                                                </span>


                                                ${
                                                    result.review_url
                                                        ? `

                                                            <a
                                                                href="${escapeHtml(
                                                                    result.review_url
                                                                )}"
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style="
                                                                    color:#667eea;
                                                                    text-decoration:none;
                                                                "
                                                            >

                                                                <i class="fas fa-external-link-alt"></i>

                                                                ${t.viewSource}

                                                            </a>
                                                        `
                                                        : ""
                                                }

                                            </div>

                                        </div>
                                    `
                                )
                                .join("")
                        }

                    </div>
                `;
            }


            div.innerHTML = `

                <div class="claim-text">

                    ${escapeHtml(
                        claim.text ||
                        ""
                    )}

                </div>


                <div class="claim-meta">

                    <span
                        class="badge ${statusClass}"
                    >
                        ${statusText}
                    </span>


                    <span>

                        ${escapeHtml(
                            claim.explanation ||
                            ""
                        )}

                    </span>


                    ${
                        claim.fact_checked
                            ? `

                                <span
                                    style="
                                        font-size:0.65rem;
                                        color:#00b894;
                                        background:rgba(0,184,148,0.1);
                                        padding:2px 10px;
                                        border-radius:10px;
                                    "
                                >
                                    🔍 ${t.factChecked}
                                </span>

                            `
                            : ""
                    }

                </div>


                ${sourcesHtml}


                ${factCheckHtml}


                ${
                    Array.isArray(
                        claim.suggested_sources
                    ) &&
                    claim.suggested_sources.length >
                        0
                        ? `

                            <button
                                class="expand-btn"
                                onclick="toggleSources(${index})"
                            >
                                ${t.showSources}
                            </button>

                        `
                        : ""
                }

            `;


            container.appendChild(
                div
            );
        }
    );


    filterClaims(
        currentFilter
    );


    debugLog(
        `📋 Generated ${claims.length} claims`
    );
}


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHtml(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// FILTER CLAIMS
// ============================================================

function filterClaims(status) {

    currentFilter =
        status;


    document
        .querySelectorAll(
            ".filter-btn"
        )
        .forEach(btn => {

            btn.classList.toggle(
                "active",
                btn.dataset.status ===
                    status
            );
        });


    document
        .querySelectorAll(
            ".claim-item"
        )
        .forEach(item => {

            item.style.display =
                status === "all" ||
                item.dataset.status ===
                    status
                    ? "block"
                    : "none";
        });
}


// ============================================================
// TOGGLE SOURCES
// ============================================================

function toggleSources(index) {

    const el =
        $(`sources_${index}`);

    if (!el)
        return;


    el.classList.toggle(
        "show"
    );


    const btn =
        el.parentElement
            .querySelector(
                ".expand-btn"
            );


    if (btn) {

        const t =
            getTranslation();


        btn.textContent =
            el.classList.contains(
                "show"
            )
                ? t.hideSources
                : t.showSources;
    }
}


// ============================================================
// HISTORY
// ============================================================

function addToHistory(data) {

    const entry = {

        title:
            data.title ||
            "Untitled Article",

        trust_score:
            Number(
                data.trust_score || 0
            ),

        timestamp:
            new Date().toISOString(),

        id:
            Date.now()
    };


    analysisHistory.unshift(
        entry
    );


    if (
        analysisHistory.length >
        20
    ) {

        analysisHistory.pop();
    }


    localStorage.setItem(
        "sourceSleuthHistory",
        JSON.stringify(
            analysisHistory
        )
    );


    renderHistory();
}


function renderHistory() {

    const container =
        $("historyContainer");

    const list =
        $("historyList");


    if (
        !container ||
        !list
    )
        return;


    if (
        analysisHistory.length ===
        0
    ) {

        container.style.display =
            "none";

        return;
    }


    container.style.display =
        "block";


    list.innerHTML =
        analysisHistory
            .map(
                item => `

                    <span
                        class="history-item"
                        onclick="loadHistoryItem(${item.id})"
                    >

                        ${
                            escapeHtml(
                                (
                                    item.title ||
                                    "Untitled"
                                ).substring(
                                    0,
                                    30
                                )
                            )
                        }

                        ${
                            (
                                item.title ||
                                ""
                            ).length > 30
                                ? "..."
                                : ""
                        }

                        (${
                            item.trust_score
                        }/100)

                    </span>
                `
            )
            .join("");
}


function loadHistoryItem(id) {

    const item =
        analysisHistory.find(
            h =>
                h.id === id
        );


    if (item) {

        alert(

            `📊 ${item.title}\n` +

            `Trust Score: ${
                item.trust_score
            }/100\n` +

            `Analyzed: ${
                new Date(
                    item.timestamp
                ).toLocaleString()
            }`
        );
    }
}


function clearHistory() {

    analysisHistory =
        [];


    localStorage.removeItem(
        "sourceSleuthHistory"
    );


    renderHistory();


    debugLog(
        "🧹 History cleared"
    );
}


// ============================================================
// COMPARE ARTICLES
// ============================================================

async function compareArticles() {

    const input =
        $("compareUrlInput");

    if (!input)
        return;


    const url =
        input.value.trim();


    if (!url) {

        alert(
            getTranslation().compareUrl
        );

        return;
    }


    try {

        const response =
            await fetch(
                "http://localhost:5000/api/analyze",
                {
                    method:
                        "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            url:
                                url
                        })
                }
            );


        if (!response.ok) {

            throw new Error(
                `Server returned ${response.status}`
            );
        }


        const result =
            await response.json();


        if (
            result.success &&
            currentData
        ) {

            secondData =
                result.data;


            const container =
                $("compareResults");

            if (!container)
                return;


            const s1 =
                Number(
                    currentData.trust_score ||
                    0
                );


            const s2 =
                Number(
                    result.data.trust_score ||
                    0
                );


            let winner =
                getTranslation()
                    .similarCredibility;


            if (s1 > s2) {

                winner =
                    getTranslation()
                        .firstMoreCredible;

            } else if (
                s2 > s1
            ) {

                winner =
                    getTranslation()
                        .secondMoreCredible;
            }


            container.innerHTML = `

                <div class="compare-grid">

                    <div class="compare-card">

                        <h4>
                            ${escapeHtml(
                                currentData.title ||
                                "Article 1"
                            )}
                        </h4>

                        <div
                            class="compare-score"
                            style="
                                color:${
                                    s1 < 30
                                        ? "#e17055"
                                        : s1 < 60
                                            ? "#fdcb6e"
                                            : "#00b894"
                                }
                            "
                        >
                            ${s1}
                        </div>

                        <p
                            style="
                                color:var(--text-muted);
                                font-size:0.8rem;
                            "
                        >
                            ${
                                getTranslation()
                                    .trustScore
                            }
                        </p>

                        <p
                            style="
                                font-size:0.7rem;
                                color:var(--text-muted);
                            "
                        >
                            ${
                                Array.isArray(
                                    currentData.claims
                                )
                                    ? currentData.claims.length
                                    : 0
                            }
                            claims
                        </p>

                    </div>


                    <div class="compare-vs">
                        VS
                    </div>


                    <div class="compare-card">

                        <h4>
                            ${escapeHtml(
                                result.data.title ||
                                "Article 2"
                            )}
                        </h4>

                        <div
                            class="compare-score"
                            style="
                                color:${
                                    s2 < 30
                                        ? "#e17055"
                                        : s2 < 60
                                            ? "#fdcb6e"
                                            : "#00b894"
                                }
                            "
                        >
                            ${s2}
                        </div>

                        <p
                            style="
                                color:var(--text-muted);
                                font-size:0.8rem;
                            "
                        >
                            ${
                                getTranslation()
                                    .trustScore
                            }
                        </p>

                        <p
                            style="
                                font-size:0.7rem;
                                color:var(--text-muted);
                            "
                        >
                            ${
                                Array.isArray(
                                    result.data.claims
                                )
                                    ? result.data.claims.length
                                    : 0
                            }
                            claims
                        </p>

                    </div>

                </div>


                <div class="compare-winner">

                    🏆

                    <strong>
                        ${winner}
                    </strong>

                    ${
                        Math.abs(
                            s1 - s2
                        ) > 20

                            ? `

                                <br>

                                ${
                                    getTranslation()
                                        .significantDifference
                                }

                            `

                            : ""
                    }

                </div>
            `;
        }


    } catch (error) {

        console.error(
            "Compare error:",
            error
        );


        alert(
            getTranslation()
                .compareError
        );
    }
}


// ============================================================
// TOGGLE COMPARE
// ============================================================

function toggleCompare() {

    const section =
        $("compareSection");


    if (!section)
        return;


    section.style.display =
        section.style.display ===
        "none"
            ? "block"
            : "none";
}


// ============================================================
// SHARE TWITTER
// ============================================================

function shareTwitter() {

    const text =

        `🔍 Just analyzed an article with Source Sleuth! ` +

        `Check out the credibility score: ` +

        `${
            currentData
                ? currentData.trust_score +
                  "/100"
                : "N/A"
        }. ` +

        `#MIL #UNESCO #SourceSleuth`;


    window.open(

        `https://twitter.com/intent/tweet?text=${
            encodeURIComponent(
                text
            )
        }`,

        "_blank"
    );
}


// ============================================================
// SHARE LINKEDIN
// ============================================================

function shareLinkedIn() {

    const url =
        window.location.href;


    window.open(

        `https://www.linkedin.com/sharing/share-offsite/?url=${
            encodeURIComponent(
                url
            )
        }`,

        "_blank"
    );
}


// ============================================================
// DOWNLOAD PNG
// ============================================================

function downloadPNG() {

    const viz =
        $("visualization");


    if (!viz)
        return;


    const svg =
        viz.querySelector(
            "svg"
        );


    if (!svg) {

        alert(
            getTranslation()
                .noVisualization
        );

        return;
    }


    const canvas =
        document.createElement(
            "canvas"
        );


    const ctx =
        canvas.getContext(
            "2d"
        );


    const svgData =
        new XMLSerializer()
            .serializeToString(
                svg
            );


    const img =
        new Image();


    const svgBlob =
        new Blob(
            [svgData],
            {
                type:
                    "image/svg+xml;charset=utf-8"
            }
        );


    const url =
        URL.createObjectURL(
            svgBlob
        );


    img.onload =
        function() {

            canvas.width =
                img.width ||
                900;

            canvas.height =
                img.height ||
                480;


            ctx.fillStyle =
                "#0a0a0f";


            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            ctx.drawImage(
                img,
                0,
                0
            );


            const link =
                document.createElement(
                    "a"
                );


            link.download =
                "source-sleuth-visualization.png";


            link.href =
                canvas.toDataURL(
                    "image/png"
                );


            link.click();


            URL.revokeObjectURL(
                url
            );
        };


    img.onerror =
        function() {

            URL.revokeObjectURL(
                url
            );

            alert(
                "Could not generate PNG."
            );
        };


    img.src =
        url;
}


// ============================================================
// EXPORT REPORT
// ============================================================

function exportPDF() {

    if (!currentData) {

        alert(
            getTranslation()
                .noDataExport
        );

        return;
    }


    const claims =
        Array.isArray(
            currentData.claims
        )
            ? currentData.claims
            : [];


    const claimsText =
        claims
            .map(
                (c, i) =>

                    `${i + 1}. ${
                        c.text || ""
                    }\n` +

                    `   Status: ${
                        (
                            c.source_status ||
                            "unknown"
                        ).toUpperCase()
                    }\n` +

                    `   ${
                        c.explanation ||
                        ""
                    }\n`
            )
            .join("\n");


    const report = `

========================================
SOURCE SLEUTH - ANALYSIS REPORT
========================================

Title:
${
    currentData.title ||
    "Untitled"
}

Source:
${
    currentData.source ||
    "Unknown"
}

Analyzed:
${new Date().toLocaleString()}

----------------------------------------
TRUST SCORE:
${
    currentData.trust_score ||
    0
}/100

${
    currentData.trust_score_description ||
    ""
}

----------------------------------------

CLAIMS BREAKDOWN:

Total:
${claims.length}

Verified:
${
    claims.filter(
        c =>
            c.source_status ===
            "green"
    ).length
}

Weak Sources:
${
    claims.filter(
        c =>
            c.source_status ===
            "yellow"
    ).length
}

Unsourced:
${
    claims.filter(
        c =>
            c.source_status ===
            "red"
    ).length
}

----------------------------------------
DETAILED CLAIMS:
----------------------------------------

${claimsText}

----------------------------------------
Generated by Source Sleuth
UNESCO Youth Hackathon 2026
========================================

`;


    const blob =
        new Blob(
            [report],
            {
                type:
                    "text/plain"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.download =
        `source-sleuth-report-${Date.now()}.txt`;


    link.href =
        url;


    link.click();


    URL.revokeObjectURL(
        url
    );


    debugLog(
        "📄 Report exported"
    );
}


// ============================================================
// VOICE INPUT
// ============================================================

function getSpeechRecognition() {

    return (
        window.SpeechRecognition ||
        window.webkitSpeechRecognition ||
        null
    );
}


function updateVoiceButton() {

    const btn =
        document.querySelector(
            ".btn-voice"
        );


    if (!btn)
        return;


    const t =
        getTranslation();


    /*
     * Do not destroy the listening/success state
     * while recognition is active.
     */

    if (
        isListening &&
        activeRecognition
    ) {

        btn.classList.add(
            "listening"
        );

        btn.classList.remove(
            "voice-success"
        );

        btn.innerHTML =
            `<i class="fas fa-circle"></i> ${t.voiceListening}`;

        return;
    }


    if (
        btn.classList.contains(
            "voice-success"
        )
    ) {

        btn.innerHTML =
            `<i class="fas fa-check"></i> ${t.voiceSuccess}`;

        return;
    }


    btn.classList.remove(
        "listening"
    );

    btn.innerHTML =
        `<i class="fas fa-microphone"></i>`;
}


function stopVoiceInput() {

    if (!activeRecognition) {

        isListening =
            false;

        updateVoiceButton();

        return;
    }


    try {

        activeRecognition.stop();

    } catch (error) {

        console.warn(
            "Voice stop error:",
            error
        );

        activeRecognition =
            null;

        isListening =
            false;

        updateVoiceButton();
    }
}


function startVoiceInput() {

    debugLog(
        "🎤 Voice button clicked"
    );


    const SpeechRecognition =
        getSpeechRecognition();


    if (!SpeechRecognition) {

        alert(
            getTranslation()
                .voiceUnsupported
        );

        return;
    }


    /*
     * If already listening, clicking the button
     * stops recognition.
     */

    if (
        isListening &&
        activeRecognition
    ) {

        stopVoiceInput();

        return;
    }


    const btn =
        document.querySelector(
            ".btn-voice"
        );


    if (!btn) {

        console.error(
            "❌ .btn-voice not found"
        );

        return;
    }


    /*
     * Make sure any previous recognition object
     * is completely cleared.
     */

    if (activeRecognition) {

        try {

            activeRecognition.abort();

        } catch (e) {}

        activeRecognition =
            null;
    }


    const recognition =
        new SpeechRecognition();


    activeRecognition =
        recognition;


    /*
     * CRITICAL:
     * Use the currently selected application language.
     */

    recognition.lang =
        speechLanguages[
            currentLanguage
        ] ||
        "en-US";


    recognition.continuous =
        false;


    recognition.interimResults =
        true;


    recognition.maxAlternatives =
        1;


    isListening =
        true;


    btn.classList.add(
        "listening"
    );


    btn.classList.remove(
        "voice-success"
    );


    btn.innerHTML =
        `<i class="fas fa-circle"></i> ${
            getTranslation()
                .voiceListening
        }`;


    debugLog(
        `🎤 Recognition language: ${recognition.lang}`
    );


    // --------------------------------------------------------
    // START
    // --------------------------------------------------------

    recognition.onstart =
        function() {

            isListening =
                true;

            debugLog(
                `🎤 Listening in ${recognition.lang}`
            );

            updateVoiceButton();
        };


    // --------------------------------------------------------
    // RESULT
    // --------------------------------------------------------

    recognition.onresult =
        function(event) {

            let transcript =
                "";


            /*
             * Combine all final/interim results.
             */

            for (
                let i =
                    event.resultIndex;

                i <
                event.results.length;

                i++
            ) {

                transcript +=
                    event.results[i][0]
                        .transcript;
            }


            transcript =
                transcript.trim();


            debugLog(
                "🎤 Transcript:",
                transcript
            );


            if (!transcript)
                return;


            /*
             * Determine which tab is active.
             */

            const activeTab =
                document.querySelector(
                    ".input-tab.active"
                );


            const activeTabType =
                activeTab
                    ? activeTab.dataset.tab
                    : "url";


            /*
             * Put speech into the active input.
             */

            if (
                activeTabType ===
                "text"
            ) {

                const textInput =
                    $("textInput");


                if (textInput) {

                    textInput.value =
                        transcript;

                    /*
                     * Trigger input event so any
                     * listeners/character counters
                     * also update.
                     */

                    textInput.dispatchEvent(
                        new Event(
                            "input",
                            {
                                bubbles:
                                    true
                            }
                        )
                    );

                    textInput.focus();
                }

            } else {

                const urlInput =
                    $("urlInput");


                if (urlInput) {

                    urlInput.value =
                        transcript;

                    urlInput.dispatchEvent(
                        new Event(
                            "input",
                            {
                                bubbles:
                                    true
                            }
                        )
                    );

                    urlInput.focus();
                }
            }


            /*
             * Show success state.
             */

            btn.classList.remove(
                "listening"
            );


            btn.classList.add(
                "voice-success"
            );


            btn.innerHTML =
                `<i class="fas fa-check"></i> ${
                    getTranslation()
                        .voiceSuccess
                }`;


            /*
             * We have received the result,
             * so mark recognition as no longer active.
             */

            isListening =
                false;


            setTimeout(
                function() {

                    /*
                     * Only reset if another recognition
                     * session hasn't started.
                     */

                    if (
                        !isListening
                    ) {

                        btn.classList.remove(
                            "voice-success"
                        );

                        btn.innerHTML =
                            '<i class="fas fa-microphone"></i>';
                    }

                },
                1500
            );
        };


    // --------------------------------------------------------
    // ERROR
    // --------------------------------------------------------

    recognition.onerror =
        function(event) {

            debugLog(
                `🎤 Voice error: ${event.error}`
            );


            isListening =
                false;


            activeRecognition =
                null;


            btn.classList.remove(
                "listening"
            );


            btn.classList.remove(
                "voice-success"
            );


            btn.innerHTML =
                '<i class="fas fa-microphone"></i>';


            switch (
                event.error
            ) {

                case "not-allowed":

                case "service-not-allowed":

                    alert(
                        getTranslation()
                            .voicePermission
                    );

                    break;


                case "no-speech":

                    alert(
                        getTranslation()
                            .voiceNoSpeech
                    );

                    break;


                case "audio-capture":

                    alert(
                        getTranslation()
                            .voiceNoMicrophone
                    );

                    break;


                case "network":

                    alert(
                        getTranslation()
                            .voiceNetwork
                    );

                    break;


                case "aborted":

                    /*
                     * User intentionally stopped it.
                     * Don't show an error.
                     */

                    break;


                default:

                    alert(
                        `Voice recognition error: ${event.error}`
                    );
            }
        };


    // --------------------------------------------------------
    // END
    // --------------------------------------------------------

    recognition.onend =
        function() {

            debugLog(
                "🎤 Voice recognition ended"
            );


            isListening =
                false;


            /*
             * Only clear this recognition object
             * if it is still the active one.
             */

            if (
                activeRecognition ===
                recognition
            ) {

                activeRecognition =
                    null;
            }


            btn.classList.remove(
                "listening"
            );


            /*
             * Don't overwrite success state immediately.
             */

            if (
                !btn.classList.contains(
                    "voice-success"
                )
            ) {

                btn.innerHTML =
                    '<i class="fas fa-microphone"></i>';
            }
        };


    // --------------------------------------------------------
    // START RECOGNITION
    // --------------------------------------------------------

    try {

        recognition.start();

    } catch (error) {

        debugLog(
            "❌ Could not start recognition:",
            error.message
        );


        isListening =
            false;


        activeRecognition =
            null;


        btn.classList.remove(
            "listening"
        );


        btn.classList.remove(
            "voice-success"
        );


        btn.innerHTML =
            '<i class="fas fa-microphone"></i>';


        /*
         * "InvalidStateError" usually means the browser
         * thinks another recognition session is active.
         */

        if (
            error.name !==
            "InvalidStateError"
        ) {

            alert(
                "Could not start voice recognition. Please try again."
            );
        }
    }
}


// ============================================================
// KEYBOARD SHORTCUT
// ============================================================

document.addEventListener(
    "keydown",
    function(e) {

        if (
            (
                e.ctrlKey ||
                e.metaKey
            ) &&
            e.key === "Enter"
        ) {

            e.preventDefault();


            const activeTab =
                document.querySelector(
                    ".input-tab.active"
                );


            if (
                activeTab &&
                activeTab.dataset.tab ===
                    "url"
            ) {

                analyzeArticle();

            } else {

                analyzeText();
            }
        }
    }
);


// ============================================================
// INITIALIZATION
// ============================================================

function initializeApp() {

    debugLog(
        "🚀 Initializing Source Sleuth..."
    );


    // --------------------------------------------------------
    // Theme
    // --------------------------------------------------------

    loadTheme();


    // --------------------------------------------------------
    // Language
    // --------------------------------------------------------

    const savedLang =
        localStorage.getItem(
            "sourceSleuthLang"
        );


    if (
        savedLang &&
        translations[savedLang]
    ) {

        currentLanguage =
            savedLang;

    } else {

        currentLanguage =
            "en";
    }


    // --------------------------------------------------------
    // Language dropdown
    // --------------------------------------------------------

    const languageSelect =
        $("languageSelect");


    if (languageSelect) {

        languageSelect.value =
            currentLanguage;


        /*
         * IMPORTANT:
         * Remove old listener if initialization
         * somehow runs more than once.
         */

        languageSelect.onchange =
            function() {

                setLanguage(
                    this.value
                );
            };


        debugLog(
            "✅ Language dropdown connected"
        );

    } else {

        debugLog(
            "⚠️ languageSelect not found"
        );
    }


    // --------------------------------------------------------
    // Apply initial language
    // --------------------------------------------------------

    setLanguage(
        currentLanguage
    );


    // --------------------------------------------------------
    // Voice button
    // --------------------------------------------------------

    const voiceBtn =
        document.querySelector(
            ".btn-voice"
        );


    if (voiceBtn) {

        /*
         * IMPORTANT:
         *
         * Use .onclick instead of addEventListener.
         *
         * This prevents duplicate recognition sessions
         * if the HTML already has an onclick attribute
         * or initialization runs more than once.
         */

        voiceBtn.onclick =
            function(e) {

                if (e) {

                    e.preventDefault();

                    e.stopPropagation();
                }

                startVoiceInput();
            };


        /*
         * Make sure it behaves like a button.
         */

        voiceBtn.type =
            "button";


        debugLog(
            "✅ Voice button connected"
        );

    } else {

        debugLog(
            "⚠️ .btn-voice not found"
        );
    }


    // --------------------------------------------------------
    // History
    // --------------------------------------------------------

    renderHistory();


    // --------------------------------------------------------
    // Debug
    // --------------------------------------------------------

    debugLog(
        "🔍 Source Sleuth loaded successfully!"
    );


    debugLog(
        "💡 Enter a URL or paste text, then press Ctrl/Cmd + Enter"
    );


    debugLog(
        "🎤 Voice input ready"
    );


    debugLog(
        "🌍 Multi-language support ready"
    );


    debugLog(
        `🗣️ Current language: ${currentLanguage}`
    );


    debugLog(
        `🎤 Speech language: ${
            speechLanguages[currentLanguage]
        }`
    );


    debugLog(
        "📡 Backend: http://localhost:5000"
    );


    debugLog(
        "📚 History: " +
        analysisHistory.length +
        " saved analyses"
    );
}


// ============================================================
// START APPLICATION
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp,
        {
            once:
                true
        }
    );

} else {

    initializeApp();
}


console.log(
    "✅ Source Sleuth app.js loaded!"
);