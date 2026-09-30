import type { Language } from './languageContext'

const predictionPhrases: Record<string, [string, string]> = {
  animal: ['पशु', 'जनावर'],
  cat: ['बिल्ली', 'मांजर'],
  cow: ['गाय', 'गाय'],
  dog: ['कुत्ता', 'कुत्रा'],
  goat: ['बकरी', 'शेळी'],
  horse: ['घोड़ा', 'घोडा'],
  pig: ['सूअर', 'डुक्कर'],
  rabbit: ['खरगोश', 'ससा'],
  sheep: ['भेड़', 'मेंढी'],
  'appetite loss': ['भूख में कमी', 'भूक कमी होणे'],
  'loss of appetite': ['भूख में कमी', 'भूक कमी होणे'],
  'reduced appetite': ['भूख में कमी', 'भूक कमी होणे'],
  coughing: ['खांसी', 'खोकला'],
  'decreased milk yield': ['दूध उत्पादन में कमी', 'दूध उत्पादनात घट'],
  dehydration: ['निर्जलीकरण', 'निर्जलीकरण'],
  diarrhea: ['दस्त', 'जुलाब'],
  'eye discharge': ['आंखों से स्राव', 'डोळ्यांतून स्राव'],
  fever: ['बुखार', 'ताप'],
  'labored breathing': ['सांस लेने में कठिनाई', 'श्वास घेण्यास त्रास'],
  lameness: ['लंगड़ापन', 'लंगडणे'],
  lethargy: ['सुस्ती', 'सुस्ती'],
  'nasal discharge': ['नाक से स्राव', 'नाकेतून स्राव'],
  'reduced milk production': ['दूध उत्पादन में कमी', 'दूध उत्पादनात घट'],
  'reduced mobility': ['चलने-फिरने में कमी', 'हालचालीत घट'],
  'reduced wool growth': ['ऊन की वृद्धि में कमी', 'लोकर वाढीत घट'],
  'reduced wool production': ['ऊन उत्पादन में कमी', 'लोकर उत्पादनात घट'],
  'skin lesions': ['त्वचा के घाव', 'त्वचेवरील जखमा'],
  sneezing: ['छींक', 'शिंक'],
  swelling: ['सूजन', 'सूज'],
  'swollen joints': ['जोड़ों में सूजन', 'सांध्यांना सूज'],
  'swollen legs': ['पैरों में सूजन', 'पायांना सूज'],
  vomiting: ['उल्टी', 'उलटी'],
  'weight loss': ['वजन घटना', 'वजन कमी होणे'],
  'blue tongue': ['ब्लूटंग रोग', 'ब्लूटंग रोग'],
  'foot-and-mouth': ['खुरपका-मुंहपका', 'लाळ्या-खुरकुत'],
  'foot and mouth': ['खुरपका-मुंहपका', 'लाळ्या-खुरकुत'],
  'could not load the available animals and symptoms. please try again.': ['उपलब्ध पशुओं और लक्षणों की सूची लोड नहीं हो सकी। कृपया फिर कोशिश करें।', 'उपलब्ध जनावरे आणि लक्षणांची यादी लोड झाली नाही. कृपया पुन्हा प्रयत्न करा.'],
  'prediction could not be completed. please try again.': ['अनुमान पूरा नहीं हो सका। कृपया फिर कोशिश करें।', 'अंदाज पूर्ण करता आला नाही. कृपया पुन्हा प्रयत्न करा.'],
  'choose a supported animal and at least one symptom.': ['सूची में से पशु चुनें और कम से कम एक लक्षण चुनें।', 'समर्थित जनावर आणि किमान एक लक्षण निवडा.'],
  'choose the animal and signs you have observed to see the closest matches in our reference dataset.': ['संदर्भ डेटासेट में निकटतम मिलान देखने के लिए पशु और उसके देखे गए लक्षण चुनें।', 'संदर्भ डेटासेटमधील जवळची जुळणी पाहण्यासाठी जनावर आणि दिसलेली लक्षणे निवडा.'],
}

const diseaseTerms: Record<string, [string, string]> = {
  actinobacillus: ['एक्टिनोबैसिलस', 'अॅक्टिनोबॅसिलस'],
  african: ['अफ्रीकी', 'आफ्रिकन'],
  allergic: ['एलर्जी संबंधी', 'अॅलर्जीशी संबंधित'],
  anemia: ['रक्ताल्पता', 'अशक्तपणा'],
  arthritis: ['गठिया', 'संधिवात'],
  asthma: ['अस्थमा', 'दमा'],
  bovine: ['गोवंशीय', 'गोवंशीय'],
  bluetongue: ['ब्लूटंग', 'ब्लूटंग'],
  bowel: ['आंत', 'आतडे'],
  bordetella: ['बोर्डेटेला', 'बोर्डेटेला'],
  bronchitis: ['श्वसनीशोथ', 'श्वसनीदाह'],
  calicivirus: ['कैलिसीवायरस', 'कॅलिसिव्हायरस'],
  canine: ['कुत्तों का', 'कुत्र्यांचा'],
  caprine: ['बकरियों का', 'शेळ्यांचा'],
  caseous: ['केसियस', 'केसियस'],
  chlamydia: ['क्लैमाइडिया', 'क्लॅमिडिया'],
  chlamydiosis: ['क्लैमाइडियोसिस', 'क्लॅमिडियोसिस'],
  chronic: ['दीर्घकालिक', 'दीर्घकालीन'],
  circovirus: ['सर्कोवायरस', 'सर्कोव्हायरस'],
  coccidiosis: ['कॉक्सिडियोसिस', 'कॉक्सिडिओसिस'],
  complex: ['समूह', 'समूह'],
  conjunctivitis: ['नेत्रशोथ', 'नेत्रदाह'],
  contagious: ['संक्रामक', 'संसर्गजन्य'],
  abortion: ['गर्भपात', 'गर्भपात'],
  cryptosporidiosis: ['क्रिप्टोस्पोरिडियोसिस', 'क्रिप्टोस्पोरिडिओसिस'],
  coronavirus: ['कोरोनावायरस', 'कोरोनाव्हायरस'],
  'cushing\'s': ['कुशिंग का', 'कुशिंगचा'],
  degenerative: ['अपक्षयी', 'अपक्षयी'],
  disease: ['रोग', 'रोग'],
  distemper: ['डिस्टेंपर', 'डिस्टेंपर'],
  dysentery: ['पेचिश', 'आव'],
  ecthyma: ['एक्थाइमा', 'एक्थायमा'],
  encephalitis: ['मस्तिष्क शोथ', 'मेंदूज्वर'],
  encephalomyelitis: ['मस्तिष्क-मेरुरज्जु शोथ', 'मेंदू-मज्जारज्जू दाह'],
  enteritis: ['आंत्रशोथ', 'आंत्रदाह'],
  equine: ['घोड़ों का', 'घोड्यांचा'],
  erysipelas: ['एरिसिपेलस', 'एरिसिपेलस'],
  epidemic: ['महामारी संबंधी', 'साथीचा'],
  feline: ['बिल्लियों का', 'मांजरांचा'],
  fever: ['बुखार', 'ताप'],
  flu: ['फ्लू', 'फ्लू'],
  footrot: ['पैर सड़न रोग', 'पाय कुज रोग'],
  fungal: ['फंगल', 'बुरशीजन्य'],
  gastroenteritis: ['आंत्र-पेट शोथ', 'जठरांत्रदाह'],
  gastrointestinal: ['जठरांत्र संबंधी', 'जठरांत्राशी संबंधित'],
  giardiasis: ['जिआर्डियासिस', 'जिआर्डियासिस'],
  goat: ['बकरी', 'शेळी'],
  hemorrhagic: ['रक्तस्रावी', 'रक्तस्रावी'],
  heartworm: ['हार्टवर्म', 'हार्टवर्म'],
  cough: ['खांसी', 'खोकला'],
  hepatitis: ['यकृत शोथ', 'यकृतदाह'],
  herpesvirus: ['हर्पीसवायरस', 'हर्पिसव्हायरस'],
  hyperthyroidism: ['अतिसक्रिय थायरॉइड', 'अतिक्रियाशील थायरॉइड'],
  immunodeficiency: ['प्रतिरक्षा-अल्पता', 'प्रतिकारशक्तीची कमतरता'],
  infection: ['संक्रमण', 'संसर्ग'],
  infectious: ['संक्रामक', 'संसर्गजन्य'],
  influenza: ['इन्फ्लुएंजा', 'इन्फ्लुएंझा'],
  inflammatory: ['सूजन संबंधी', 'दाहाशी संबंधित'],
  intestinal: ['आंतों का', 'आतड्यांचा'],
  johne: ['जॉन्स', 'जॉन्स'],
  kennel: ['केनेल', 'केनेल'],
  joint: ['जोड़', 'सांधा'],
  laminitis: ['लैमिनाइटिस', 'लॅमिनायटिस'],
  leukemia: ['ल्यूकेमिया', 'ल्युकेमिया'],
  leptospirosis: ['लेप्टोस्पायरोसिस', 'लेप्टोस्पायरोसिस'],
  lymphadenitis: ['लसीका ग्रंथि शोथ', 'लसिका ग्रंथींचा दाह'],
  lyme: ['लाइम', 'लाइम'],
  maedi: ['मैदी', 'मैदी'],
  mastitis: ['थनैला', 'स्तनदाह'],
  metabolic: ['चयापचय संबंधी', 'चयापचयाशी संबंधित'],
  myeloencephalitis: ['मेरुरज्जु-मस्तिष्क शोथ', 'मज्जारज्जू-मेंदू दाह'],
  myxomatosis: ['मिक्सोमैटोसिस', 'मिक्सोमॅटोसिस'],
  nile: ['नाइल', 'नाईल'],
  pancreate: ['अग्न्याशय', 'स्वादुपिंड'],
  pancreatitis: ['अग्न्याशय शोथ', 'स्वादुपिंडदाह'],
  panleukopenia: ['पैनल्यूकोपेनिया', 'पॅनल्युकोपेनिया'],
  parainfluenza: ['पैराइन्फ्लुएंजा', 'पॅराइन्फ्लुएंझा'],
  parasites: ['परजीवी', 'परजीवी'],
  parvovirus: ['पार्वोवायरस', 'पार्वोव्हायरस'],
  pasteurellosis: ['पाश्चुरेलोसिस', 'पाश्चुरेलोसिस'],
  peritonitis: ['पेरिटोनाइटिस', 'पेरिटोनायटिस'],
  piroplasmosis: ['पाइरोप्लाज्मोसिस', 'पायरोप्लाझ्मोसिस'],
  pleuropneumonia: ['फुफ्फुसावरण शोथ', 'फुफ्फुसावरणदाह'],
  pneumonia: ['निमोनिया', 'न्यूमोनिया'],
  porcine: ['सूअरों का', 'डुकरांचा'],
  protozoal: ['प्रोटोजोआ संबंधी', 'प्रोटोझोआशी संबंधित'],
  rabbit: ['खरगोश', 'ससा'],
  renal: ['गुर्दे संबंधी', 'मूत्रपिंडाशी संबंधित'],
  reproductive: ['प्रजनन संबंधी', 'प्रजननाशी संबंधित'],
  respiratory: ['श्वसन संबंधी', 'श्वसनाशी संबंधित'],
  rhinitis: ['नासाशोथ', 'नासादाह'],
  rhinotracheitis: ['राइनोट्रेकाइटिस', 'रायनोट्रॅकायटिस'],
  rhinopneumonitis: ['राइनोप्न्यूमोनाइटिस', 'रायनोप्न्यूमोनायटिस'],
  salmonellosis: ['साल्मोनेलोसिस', 'साल्मोनेलोसिस'],
  scrapie: ['स्क्रेपी', 'स्क्रेपी'],
  sheep: ['भेड़ों का', 'मेंढ्यांचा'],
  stasis: ['गतिरोध', 'स्थिरता'],
  strangles: ['स्ट्रेंगल्स', 'स्ट्रँगल्स'],
  suis: ['सुइस', 'सुइस'],
  swine: ['सूअर', 'डुक्कर'],
  syphilis: ['सिफलिस', 'सिफिलिस'],
  syncytial: ['सिंशिटियल', 'सिन्सिशियल'],
  tuberculosis: ['क्षय रोग', 'क्षयरोग'],
  'tick-borne': ['टिक से फैलने वाला', 'गोचीडांमुळे पसरणारा'],
  upper: ['ऊपरी', 'वरच्या'],
  pox: ['चेचक', 'देवी'],
  ringworm: ['दाद', 'नायटा'],
  snuffles: ['सूंघनी रोग', 'स्नफल्स रोग'],
  visna: ['विस्ना', 'विस्ना'],
  viral: ['वायरल', 'विषाणूजन्य'],
  virus: ['विषाणु', 'विषाणू'],
  west: ['वेस्ट', 'वेस्ट'],
  westnile: ['वेस्ट नाइल', 'वेस्ट नाईल'],
  wool: ['ऊन', 'लोकर'],
}

function languageIndex(language: Language) {
  return language === 'hi' ? 0 : 1
}

function translateDiseaseName(name: string, language: Language) {
  const localizedBlueTongue = language === 'hi' ? 'ब्लूटंग' : 'ब्लूटंग'
  const localizedFootAndMouth = language === 'hi' ? 'खुरपका-मुंहपका' : 'लाळ्या-खुरकुत'
  const withCompoundNames = name
    .replace(/blue\s*tongue/gi, localizedBlueTongue)
    .replace(/foot[- ]and[- ]mouth/gi, localizedFootAndMouth)

  return withCompoundNames.replace(/[A-Za-z]+(?:['-][A-Za-z]+)*/g, (term) => {
    const localized = diseaseTerms[term.toLowerCase()]
    return localized ? localized[languageIndex(language)] : term
  })
}

const diseasePrefixes = new Set([
  'actinobacillus', 'african', 'allergic', 'arthritis', 'blue', 'bluetongue', 'bordetella', 'bovine',
  'canine', 'caprine', 'caseous', 'chlamydia', 'chronic', 'coccidiosis', 'conjunctivitis', 'contagious',
  'cryptosporidiosis', 'degenerative', 'distemper', 'enteritis', 'equine', 'feline', 'foot', 'footrot',
  'fungal', 'gastroenteritis', 'gastrointestinal', 'giardiasis', 'goat', 'heartworm', 'hyperthyroidism',
  'inflammatory', 'intestinal', 'johne', 'kennel', 'laminitis', 'leptospirosis', 'lyme', 'maedi', 'mastitis',
  'myxomatosis', 'pancreatitis', 'panleukopenia', 'parvovirus', 'pasteurellosis', 'pneumonia', 'porcine',
  'rabbit', 'respiratory', 'ringworm', 'salmonellosis', 'scrapie', 'snuffles', 'strangles', 'swine', 'tick',
  'tuberculosis', 'upper', 'viral', 'west',
])

export function translatePredictionText(text: string, language: Language): string | undefined {
  if (language === 'en') return undefined

  const exact = predictionPhrases[text.toLowerCase()]
  if (exact) return exact[languageIndex(language)]

  const selectedSymptoms = text.match(/^Observed symptoms \((\d+) selected\)$/)
  if (selectedSymptoms) {
    return language === 'hi'
      ? `देखे गए लक्षण (${selectedSymptoms[1]} चुने गए)`
      : `दिसलेली लक्षणे (${selectedSymptoms[1]} निवडली)`
  }

  const matchingExamples = text.match(/^(\d+) similar dataset records?$/)
  if (matchingExamples) {
    return language === 'hi'
      ? `${matchingExamples[1]} मिलते-जुलते डेटासेट रिकॉर्ड`
      : `${matchingExamples[1]} समान डेटासेट नोंदी`
  }

  const matchScore = text.match(/^(\d+)% match$/)
  if (matchScore) {
    return language === 'hi' ? `${matchScore[1]}% मिलान` : `${matchScore[1]}% जुळणी`
  }

  const diseasePrefix = text.match(/^[A-Za-z]+/)?.[0].toLowerCase()
  if (diseasePrefix && diseasePrefixes.has(diseasePrefix)) {
    return translateDiseaseName(text, language)
  }

  return undefined
}

export function formatSelectedSymptoms(count: number, language: Language) {
  if (language === 'en') return `Observed symptoms (${count} selected)`
  return language === 'hi'
    ? `देखे गए लक्षण (${count} चुने गए)`
    : `दिसलेली लक्षणे (${count} निवडली)`
}

export function formatMatchingExamples(count: number, language: Language) {
  if (language === 'en') return `${count} similar dataset record${count === 1 ? '' : 's'}`
  return language === 'hi'
    ? `${count} मिलते-जुलते डेटासेट रिकॉर्ड`
    : `${count} समान डेटासेट नोंदी`
}

export function formatMatchScore(confidence: number, language: Language) {
  if (language === 'en') return `${confidence}% match`
  return language === 'hi' ? `${confidence}% मिलान` : `${confidence}% जुळणी`
}
