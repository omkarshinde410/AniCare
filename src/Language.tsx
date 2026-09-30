import { Children, cloneElement, isValidElement, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { translatePredictionText } from './predictionTranslations'
import { LanguageContext, useLanguage, type Language } from './languageContext'

const phraseTranslations: Record<string, [string, string]> = {
  'Language': ['भाषा', 'भाषा'],
  'Home': ['होम', 'मुख्यपृष्ठ'],
  'Doctors': ['डॉक्टर', 'डॉक्टर'],
  'Appointments': ['अपॉइंटमेंट', 'भेटी'],
  'Alerts': ['चेतावनी', 'सूचना'],
  'Predict': ['अनुमान', 'अंदाज'],
  'Documents': ['दस्तावेज़', 'कागदपत्रे'],
  'Notifications': ['सूचनाएं', 'सूचना'],
  'Profile': ['प्रोफ़ाइल', 'प्रोफाइल'],
  'Sign out': ['साइन आउट', 'बाहेर पडा'],
  'Admin Dashboard': ['एडमिन डैशबोर्ड', 'प्रशासक डॅशबोर्ड'],
  'Login': ['लॉग इन', 'लॉग इन'],
  'Register': ['पंजीकरण', 'नोंदणी'],
  'Create account': ['खाता बनाएं', 'खाते तयार करा'],
  'Farmer': ['किसान', 'शेतकरी'],
  'Doctor': ['डॉक्टर', 'डॉक्टर'],
  'Admin': ['प्रशासक', 'प्रशासक'],
  'Farmer home': ['किसान होम', 'शेतकरी मुख्यपृष्ठ'],
  'Find a veterinarian': ['पशु चिकित्सक खोजें', 'पशुवैद्य शोधा'],
  'View appointments': ['अपॉइंटमेंट देखें', 'भेटी पहा'],
  'Find trusted veterinary care near you.': ['अपने पास भरोसेमंद पशु चिकित्सा सेवा खोजें।', 'तुमच्या जवळ विश्वासार्ह पशुवैद्यकीय सेवा शोधा.'],
  'Veterinary care for every farmer': ['हर किसान के लिए पशु चिकित्सा सेवा', 'प्रत्येक शेतकऱ्यासाठी पशुवैद्यकीय सेवा'],
  'Good care starts nearby.': ['अच्छी देखभाल आपके पास से शुरू होती है।', 'चांगली काळजी जवळून सुरू होते.'],
  'Find a verified veterinarian, keep track of visits, and stay ahead of local health alerts.': ['सत्यापित पशु चिकित्सक खोजें, मुलाकातों पर नज़र रखें और स्थानीय स्वास्थ्य सूचनाएं जानें।', 'सत्यापित पशुवैद्य शोधा, भेटींची नोंद ठेवा आणि स्थानिक आरोग्य सूचनांबद्दल जाणून घ्या.'],
  'Active appointments': ['सक्रिय अपॉइंटमेंट', 'सक्रिय भेटी'],
  'Nearby alerts': ['पास की चेतावनियां', 'जवळच्या सूचना'],
  'Unread updates': ['अपठित अपडेट', 'न वाचलेल्या सूचना'],
  'See schedule': ['समय-सारणी देखें', 'वेळापत्रक पहा'],
  'Review alerts': ['चेतावनियां देखें', 'सूचना तपासा'],
  'Open inbox': ['इनबॉक्स खोलें', 'इनबॉक्स उघडा'],
  'YOUR SCHEDULE': ['आपकी समय-सारणी', 'तुमचे वेळापत्रक'],
  'Next appointment': ['अगली अपॉइंटमेंट', 'पुढील भेट'],
  'All appointments': ['सभी अपॉइंटमेंट', 'सर्व भेटी'],
  'No upcoming visits': ['आगामी मुलाकातें नहीं हैं', 'आगामी भेटी नाहीत'],
  'When you book a vet, appointment details will show here.': ['पशु चिकित्सक की बुकिंग के बाद अपॉइंटमेंट की जानकारी यहां दिखेगी।', 'पशुवैद्याची भेट निश्चित केल्यावर तपशील येथे दिसतील.'],
  'Find a vet →': ['पशु चिकित्सक खोजें →', 'पशुवैद्य शोधा →'],
  'Browse verified local care': ['सत्यापित स्थानीय सेवा देखें', 'सत्यापित स्थानिक सेवा पहा'],
  'Local health alerts': ['स्थानीय स्वास्थ्य चेतावनियां', 'स्थानिक आरोग्य सूचना'],
  'Check reports in your area': ['अपने क्षेत्र की रिपोर्ट देखें', 'तुमच्या परिसरातील अहवाल तपासा'],
  'Medical documents': ['चिकित्सा दस्तावेज़', 'वैद्यकीय कागदपत्रे'],
  'Prescriptions and care notes': ['नुस्खे और देखभाल नोट्स', 'औषधपत्रे आणि काळजीच्या नोंदी'],
  'FARMER SPACE': ['किसान क्षेत्र', 'शेतकरी विभाग'],
  'ACCOUNT': ['खाता', 'खाते'],
  'Your profile': ['आपकी प्रोफ़ाइल', 'तुमचे प्रोफाइल'],
  'Account details and sign-in controls.': ['खाते का विवरण और साइन-इन नियंत्रण।', 'खात्याचा तपशील आणि साइन-इन नियंत्रणे.'],
  'PERSONAL DETAILS': ['व्यक्तिगत विवरण', 'वैयक्तिक तपशील'],
  'Account information': ['खाते की जानकारी', 'खात्याची माहिती'],
  'Full name': ['पूरा नाम', 'पूर्ण नाव'],
  'Email address': ['ईमेल पता', 'ईमेल पत्ता'],
  'Contact number': ['संपर्क नंबर', 'संपर्क क्रमांक'],
  'Role': ['भूमिका', 'भूमिका'],
  'Not provided': ['उपलब्ध नहीं', 'दिलेली नाही'],
  'Review appointment and care updates': ['अपॉइंटमेंट और देखभाल अपडेट देखें', 'भेटी आणि काळजीच्या सूचना तपासा'],
  'End this session on this device': ['इस डिवाइस पर सत्र समाप्त करें', 'या उपकरणावरील सत्र समाप्त करा'],
  'Find the right vet.': ['सही पशु चिकित्सक खोजें।', 'योग्य पशुवैद्य शोधा.'],
  'Nearby approved doctors appear automatically. Search is optional.': ['पास के स्वीकृत डॉक्टर अपने आप दिखेंगे। खोज वैकल्पिक है।', 'जवळचे मंजूर डॉक्टर आपोआप दिसतील. शोध ऐच्छिक आहे.'],
  'Filter by doctor name or specialty': ['डॉक्टर के नाम या विशेषज्ञता से खोजें', 'डॉक्टरचे नाव किंवा विशेषतेनुसार शोधा'],
  'OPTIONAL': ['वैकल्पिक', 'ऐच्छिक'],
  'VERIFIED NEARBY': ['पास के सत्यापित डॉक्टर', 'जवळचे सत्यापित डॉक्टर'],
  'Veterinarians': ['पशु चिकित्सक', 'पशुवैद्य'],
  'Finding nearby veterinary doctors...': ['पास के पशु चिकित्सक खोजे जा रहे हैं...', 'जवळचे पशुवैद्य शोधत आहोत...'],
  'No nearby veterinary doctors found.': ['पास में कोई पशु चिकित्सक नहीं मिला।', 'जवळपास पशुवैद्य आढळले नाहीत.'],
  'Verified': ['सत्यापित', 'सत्यापित'],
  'View Profile': ['प्रोफ़ाइल देखें', 'प्रोफाइल पहा'],
  'APPOINTMENT REQUEST': ['अपॉइंटमेंट अनुरोध', 'भेटीची विनंती'],
  'Tell us what your animal needs.': ['बताएं कि आपके पशु को क्या समस्या है।', 'तुमच्या जनावराला काय त्रास आहे ते सांगा.'],
  'Choose a time and share a few details. Your request goes to the veterinarian for confirmation.': ['समय चुनें और कुछ जानकारी दें। पुष्टि के लिए अनुरोध पशु चिकित्सक को भेजा जाएगा।', 'वेळ निवडा आणि काही तपशील द्या. पुष्टीसाठी विनंती पशुवैद्याकडे पाठवली जाईल.'],
  'Visit time': ['मुलाकात का समय', 'भेटीची वेळ'],
  'Select a convenient date and time.': ['सुविधाजनक तारीख और समय चुनें।', 'सोयीची तारीख आणि वेळ निवडा.'],
  'Date': ['तारीख', 'तारीख'],
  'Starts at': ['शुरू होने का समय', 'सुरू होण्याची वेळ'],
  'Ends at': ['समाप्ति का समय', 'समाप्तीची वेळ'],
  'Animal details': ['पशु का विवरण', 'जनावराचा तपशील'],
  'Help the vet prepare for the visit.': ['पशु चिकित्सक को मुलाकात की तैयारी में मदद करें।', 'पशुवैद्याला भेटीसाठी तयारी करण्यात मदत करा.'],
  'Animal type': ['पशु का प्रकार', 'जनावराचा प्रकार'],
  'Cow': ['गाय', 'गाय'],
  'Buffalo': ['भैंस', 'म्हैस'],
  'Goat': ['बकरी', 'शेळी'],
  'Sheep': ['भेड़', 'मेंढी'],
  'Chicken': ['मुर्गी', 'कोंबडी'],
  'Other': ['अन्य', 'इतर'],
  'Name or identifier': ['नाम या पहचान', 'नाव किंवा ओळख'],
  'Optional': ['वैकल्पिक', 'ऐच्छिक'],
  'Gender': ['लिंग', 'लिंग'],
  'Male': ['नर', 'नर'],
  'Female': ['मादा', 'मादी'],
  'Unknown': ['अज्ञात', 'माहित नाही'],
  'What is happening?': ['क्या समस्या है?', 'काय समस्या आहे?'],
  'Describe the concern so the vet has context.': ['समस्या बताएं ताकि पशु चिकित्सक समझ सकें।', 'समस्या सांगा, जेणेकरून पशुवैद्याला संदर्भ समजेल.'],
  'Reason for visit': ['मुलाकात का कारण', 'भेटीचे कारण'],
  'What do you need help with?': ['आपको किस बात में मदद चाहिए?', 'तुम्हाला कशासाठी मदत हवी आहे?'],
  'Symptoms': ['लक्षण', 'लक्षणे'],
  'When did it start? What have you noticed?': ['यह कब शुरू हुआ? आपने क्या देखा?', 'हे कधी सुरू झाले? तुम्ही काय पाहिले?'],
  'Additional notes': ['अतिरिक्त नोट्स', 'अतिरिक्त नोंदी'],
  'Anything else the veterinarian should know?': ['क्या पशु चिकित्सक को और कुछ जानना चाहिए?', 'पशुवैद्याला आणखी काही माहिती हवी आहे का?'],
  'REQUESTING WITH': ['इनके साथ अनुरोध', 'यांच्यासोबत विनंती'],
  'What happens next?': ['आगे क्या होगा?', 'पुढे काय होईल?'],
  'Your request stays pending until the veterinarian approves it. You’ll get an update in your notifications.': ['पशु चिकित्सक की मंज़ूरी तक आपका अनुरोध लंबित रहेगा। आपको सूचना मिलेगी।', 'पशुवैद्य मंजुरी देईपर्यंत विनंती प्रलंबित राहील. तुम्हाला सूचना मिळेल.'],
  'Send appointment request': ['अपॉइंटमेंट अनुरोध भेजें', 'भेटीची विनंती पाठवा'],
  'Sending request…': ['अनुरोध भेजा जा रहा है…', 'विनंती पाठवत आहोत…'],
  'Disease symptom checker': ['रोग लक्षण जांच', 'रोग लक्षण तपासणी'],
  'Animal health': ['पशु स्वास्थ्य', 'जनावरांचे आरोग्य'],
  'Observed symptoms': ['दिखे हुए लक्षण', 'दिसलेली लक्षणे'],
  'Loading symptom list...': ['लक्षणों की सूची लोड हो रही है...', 'लक्षणांची यादी लोड होत आहे...'],
  'No symptoms are available right now.': ['अभी कोई लक्षण उपलब्ध नहीं हैं।', 'सध्या कोणतीही लक्षणे उपलब्ध नाहीत.'],
  'Check likely matches': ['संभावित मिलान देखें', 'संभाव्य जुळणारे रोग पहा'],
  'Checking matches...': ['मिलान जांचे जा रहे हैं...', 'जुळणी तपासत आहोत...'],
  'Closest dataset matches': ['डेटासेट से निकटतम मिलान', 'डेटासेटमधील जवळची जुळणी'],
  'No close matches were found. A veterinarian can assess symptoms not covered by this dataset.': ['कोई नज़दीकी मिलान नहीं मिला। इस डेटासेट से बाहर के लक्षणों का आकलन पशु चिकित्सक कर सकते हैं।', 'जवळची जुळणी सापडली नाही. या डेटासेटमधील नसलेल्या लक्षणांचे मूल्यांकन पशुवैद्य करू शकतात.'],
  'Inbox': ['इनबॉक्स', 'इनबॉक्स'],
  'Appointment and care updates, all in one place.': ['अपॉइंटमेंट और देखभाल अपडेट एक ही जगह।', 'भेटी आणि काळजीच्या सूचना एकाच ठिकाणी.'],
  'unread': ['अपठित', 'न वाचलेले'],
  'All': ['सभी', 'सर्व'],
  'Unread': ['अपठित', 'न वाचलेले'],
  'Search notifications': ['सूचनाएं खोजें', 'सूचना शोधा'],
  'Loading inbox…': ['इनबॉक्स लोड हो रहा है…', 'इनबॉक्स लोड होत आहे…'],
  'Mark read': ['पढ़ा हुआ चिह्नित करें', 'वाचलेले म्हणून चिन्हांकित करा'],
  'Your inbox is clear': ['आपका इनबॉक्स खाली है', 'तुमचा इनबॉक्स रिकामा आहे'],
  'No matching updates': ['कोई मेल खाता अपडेट नहीं', 'जुळणाऱ्या सूचना नाहीत'],
  'Try another search or view all notifications.': ['दूसरी खोज करें या सभी सूचनाएं देखें।', 'दुसरा शोध वापरा किंवा सर्व सूचना पहा.'],
  'Video consultation': ['वीडियो परामर्श', 'व्हिडिओ सल्लामसलत'],
  'Video calling is available only during the scheduled appointment.': ['वीडियो कॉल केवल तय अपॉइंटमेंट के समय उपलब्ध है।', 'व्हिडिओ कॉल फक्त नियोजित भेटीच्या वेळी उपलब्ध आहे.'],
  'Join the private appointment call when both participants are ready.': ['दोनों प्रतिभागियों के तैयार होने पर निजी अपॉइंटमेंट कॉल में शामिल हों।', 'दोन्ही सहभागी तयार झाल्यावर खाजगी भेटीच्या कॉलमध्ये सामील व्हा.'],
  'Join video call': ['वीडियो कॉल में शामिल हों', 'व्हिडिओ कॉलमध्ये सामील व्हा'],
  'Waiting for remote video…': ['दूसरे पक्ष के वीडियो की प्रतीक्षा…', 'दुसऱ्या बाजूच्या व्हिडिओची प्रतीक्षा…'],
  'End call': ['कॉल समाप्त करें', 'कॉल समाप्त करा'],
  'Dismiss notification': ['सूचना हटाएं', 'सूचना बंद करा'],
  'Disease watch': ['रोग निगरानी', 'रोग निरीक्षण'],
  'Active reports shared by veterinarians in your area.': ['आपके क्षेत्र के पशु चिकित्सकों की सक्रिय रिपोर्ट।', 'तुमच्या परिसरातील पशुवैद्यांनी दिलेले सक्रिय अहवाल.'],
  'No active reports nearby': ['पास में कोई सक्रिय रिपोर्ट नहीं', 'जवळपास सक्रिय अहवाल नाहीत'],
  'No veterinarian alerts match your current location. Check again later.': ['आपकी जगह के लिए कोई पशु चिकित्सक चेतावनी नहीं। बाद में फिर देखें।', 'तुमच्या ठिकाणासाठी पशुवैद्यकीय सूचना नाहीत. नंतर पुन्हा तपासा.'],
  'Doctor Verification': ['डॉक्टर सत्यापन', 'डॉक्टर पडताळणी'],
  'No pending doctors.': ['कोई डॉक्टर लंबित नहीं है।', 'प्रलंबित डॉक्टर नाहीत.'],
  'Approve': ['मंज़ूर करें', 'मंजूर करा'],
  'Reject': ['अस्वीकार करें', 'नाकारा'],
  'Pending Doctor Verifications': ['डॉक्टर सत्यापन लंबित', 'डॉक्टर पडताळणी प्रलंबित'],
  'Pending Admin Approvals': ['एडमिन मंज़ूरी लंबित', 'प्रशासक मंजुरी प्रलंबित'],
  'Management': ['प्रबंधन', 'व्यवस्थापन'],
  'Review doctors': ['डॉक्टरों की समीक्षा करें', 'डॉक्टर तपासा'],
  'Clinical documents': ['चिकित्सकीय दस्तावेज़', 'वैद्यकीय कागदपत्रे'],
  'CARE RECORDS': ['देखभाल रिकॉर्ड', 'काळजीच्या नोंदी'],
  'No documents yet': ['अभी कोई दस्तावेज़ नहीं', 'अद्याप कागदपत्रे नाहीत'],
  'Download PDF': ['PDF डाउनलोड करें', 'PDF डाउनलोड करा'],
  'Your appointment request was sent': ['आपका अपॉइंटमेंट अनुरोध भेज दिया गया', 'तुमची भेटीची विनंती पाठवली'],
  'Video call started': ['वीडियो कॉल शुरू हुई', 'व्हिडिओ कॉल सुरू झाला'],
  'Finding doctors near your location...': ['आपके पास के डॉक्टर खोजे जा रहे हैं...', 'तुमच्या जवळचे डॉक्टर शोधत आहोत...'],
  'Location is unavailable. Showing doctors near the default map area.': ['स्थान उपलब्ध नहीं है। डिफ़ॉल्ट नक्शे के पास के डॉक्टर दिखाए जा रहे हैं।', 'स्थान उपलब्ध नाही. नकाशावरील मूळ ठिकाणाजवळचे डॉक्टर दाखवत आहोत.'],
  'Showing approved doctors near you.': ['आपके पास के स्वीकृत डॉक्टर दिखाए जा रहे हैं।', 'तुमच्या जवळचे मंजूर डॉक्टर दाखवत आहोत.'],
  'Location permission was not granted. Showing doctors near the default map area.': ['स्थान की अनुमति नहीं मिली। डिफ़ॉल्ट नक्शे के पास के डॉक्टर दिखाए जा रहे हैं।', 'स्थानाची परवानगी मिळाली नाही. नकाशावरील मूळ ठिकाणाजवळचे डॉक्टर दाखवत आहोत.'],
  'LOCAL VETERINARY CARE': ['स्थानीय पशु चिकित्सा सेवा', 'स्थानिक पशुवैद्यकीय सेवा'],
  'Finding reports near you…': ['आपके पास की रिपोर्ट खोजी जा रही हैं…', 'तुमच्या जवळचे अहवाल शोधत आहोत…'],
  'A veterinarian reported a local livestock or poultry health concern.': ['पशु चिकित्सक ने स्थानीय पशुधन या मुर्गीपालन स्वास्थ्य समस्या की रिपोर्ट की है।', 'पशुवैद्यांनी स्थानिक पशुधन किंवा कुक्कुट आरोग्य समस्येचा अहवाल दिला आहे.'],
  'Back to veterinarian': ['पशु चिकित्सक पर वापस जाएं', 'पशुवैद्याकडे परत जा'],
  'The appointment end time must be later than its start time.': ['अपॉइंटमेंट का समाप्ति समय शुरू होने के समय के बाद होना चाहिए।', 'भेटीची समाप्तीची वेळ सुरू होण्याच्या वेळेनंतर असावी.'],
  'Choose a future date and start time for the appointment.': ['अपॉइंटमेंट के लिए भविष्य की तारीख और समय चुनें।', 'भेटीसाठी भविष्यातील तारीख आणि वेळ निवडा.'],
  'Choose today or a future date for the appointment.': ['अपॉइंटमेंट के लिए आज या भविष्य की तारीख चुनें।', 'भेटीसाठी आजची किंवा भविष्यातील तारीख निवडा.'],
  'End time must be later than the start time.': ['समाप्ति का समय शुरू होने के समय के बाद होना चाहिए।', 'समाप्तीची वेळ सुरू होण्याच्या वेळेनंतर असावी.'],
  'Request sent. The veterinarian will review your appointment.': ['अनुरोध भेज दिया गया। पशु चिकित्सक आपकी अपॉइंटमेंट की समीक्षा करेंगे।', 'विनंती पाठवली. पशुवैद्य तुमच्या भेटीची तपासणी करतील.'],
  'Unable to request appointment.': ['अपॉइंटमेंट का अनुरोध नहीं किया जा सका।', 'भेटीची विनंती करता आली नाही.'],
  'Farmer ·': ['किसान ·', 'शेतकरी ·'],
  'Doctor ·': ['डॉक्टर ·', 'डॉक्टर ·'],
  'Good day, Dr.': ['नमस्कार, डॉ.', 'नमस्कार, डॉ.'],
  'VERIFIED': ['सत्यापित', 'सत्यापित'],
  'IN REVIEW': ['समीक्षाधीन', 'पुनरावलोकन सुरू'],
  'Review pending': ['समीक्षा लंबित', 'पुनरावलोकन प्रलंबित'],
  'Add your credentials and practice details for the administrator review.': ['प्रशासक की समीक्षा के लिए अपनी योग्यता और क्लिनिक का विवरण जोड़ें।', 'प्रशासकीय पुनरावलोकनासाठी तुमची पात्रता आणि दवाखान्याचे तपशील भरा.'],
  'Degree': ['डिग्री', 'पदवी'],
  'University': ['विश्वविद्यालय', 'विद्यापीठ'],
  'Specialization': ['विशेषज्ञता', 'विशेषज्ञता'],
  'License number': ['लाइसेंस नंबर', 'परवाना क्रमांक'],
  'Experience in years': ['अनुभव (वर्षों में)', 'अनुभव (वर्षांमध्ये)'],
  'City': ['शहर', 'शहर'],
  'Bio': ['परिचय', 'परिचय'],
  'Experience': ['अनुभव', 'अनुभव'],
  'License': ['लाइसेंस', 'परवाना'],
  'years': ['वर्ष', 'वर्षे'],
  'Rating:': ['रेटिंग:', 'रेटिंग:'],
  'Location available on profile': ['स्थान प्रोफ़ाइल में उपलब्ध है', 'स्थान प्रोफाइलमध्ये उपलब्ध आहे'],
  'Verified practice': ['सत्यापित क्लिनिक', 'सत्यापित दवाखाना'],
  'years away': ['वर्ष दूर', 'वर्षे दूर'],
  'Near you': ['आपके पास', 'तुमच्या जवळ'],
  'All records': ['सभी रिकॉर्ड', 'सर्व नोंदी'],
  'Newest first': ['नवीनतम पहले', 'नवीनतम प्रथम'],
  'document': ['दस्तावेज़', 'कागदपत्र'],
  'documents': ['दस्तावेज़', 'कागदपत्रे'],
  'medicines': ['दवाएं', 'औषधे'],
  'Treatment instructions prepared for this appointment.': ['इस अपॉइंटमेंट के लिए उपचार निर्देश तैयार किए गए।', 'या भेटीसाठी उपचाराच्या सूचना तयार केल्या आहेत.'],
  'New appointment request': ['नया अपॉइंटमेंट अनुरोध', 'नवीन भेटीची विनंती'],
  'Appointment approved': ['अपॉइंटमेंट मंज़ूर', 'भेट मंजूर'],
  'Appointment rejected': ['अपॉइंटमेंट अस्वीकृत', 'भेट नाकारली'],
  'Appointment cancelled': ['अपॉइंटमेंट रद्द', 'भेट रद्द केली'],
  'Payment requested': ['भुगतान का अनुरोध', 'देयकाची विनंती'],
  'Payment received': ['भुगतान प्राप्त हुआ', 'देयक प्राप्त झाले'],
  'New medicine document available': ['दवा का नया दस्तावेज़ उपलब्ध', 'औषधाचे नवीन कागदपत्र उपलब्ध'],
  'The other participant ended the call.': ['दूसरे प्रतिभागी ने कॉल समाप्त कर दी।', 'दुसऱ्या सहभागीने कॉल समाप्त केला.'],
  'The other participant left the call.': ['दूसरा प्रतिभागी कॉल से चला गया।', 'दुसरा सहभागी कॉलमधून बाहेर पडला.'],
  'Call ended': ['कॉल समाप्त', 'कॉल समाप्त झाला'],
  'Call connected': ['कॉल जुड़ गई', 'कॉल जोडला गेला'],
  'Waiting for the other participant...': ['दूसरे प्रतिभागी की प्रतीक्षा...', 'दुसऱ्या सहभागीची प्रतीक्षा...'],
  'Both participants joined. Establishing video...': ['दोनों प्रतिभागी जुड़ गए। वीडियो कनेक्शन बन रहा है...', 'दोन्ही सहभागी जोडले. व्हिडिओ जोडत आहोत...'],
  'Mute microphone': ['माइक्रोफ़ोन म्यूट करें', 'मायक्रोफोन म्यूट करा'],
  'Turn microphone on': ['माइक्रोफ़ोन चालू करें', 'मायक्रोफोन सुरू करा'],
  'Turn camera off': ['कैमरा बंद करें', 'कॅमेरा बंद करा'],
  'Turn camera on': ['कैमरा चालू करें', 'कॅमेरा सुरू करा'],
  'Mic on': ['माइक चालू', 'माइक सुरू'],
  'Mic off': ['माइक बंद', 'माइक बंद'],
  'Camera on': ['कैमरा चालू', 'कॅमेरा सुरू'],
  'Camera off': ['कैमरा बंद', 'कॅमेरा बंद'],
}

const supplementalTranslations: Record<string, [string, string]> = {
  'Pending Doctor Verifications': ['डॉक्टर सत्यापन लंबित', 'डॉक्टर पडताळणी प्रलंबित'],
  'Pending Admin Approvals': ['एडमिन मंज़ूरी लंबित', 'प्रशासक मंजुरी प्रलंबित'],
  'Management': ['प्रबंधन', 'व्यवस्थापन'],
  'Review doctors': ['डॉक्टरों की समीक्षा करें', 'डॉक्टर तपासा'],
  'Email': ['ईमेल', 'ईमेल'],
  'Password': ['पासवर्ड', 'पासवर्ड'],
  'Contact number': ['संपर्क नंबर', 'संपर्क क्रमांक'],
  'Role': ['भूमिका', 'भूमिका'],
  'Farmers helped': ['किसानों की मदद', 'शेतकऱ्यांना मदत'],
  'Approved vets': ['स्वीकृत पशु चिकित्सक', 'मंजूर पशुवैद्य'],
  'Alerts & support': ['चेतावनी और सहायता', 'सूचना आणि मदत'],
  'Find nearby vets': ['पास के पशु चिकित्सक खोजें', 'जवळचे पशुवैद्य शोधा'],
  'Approve appointments': ['अपॉइंटमेंट मंज़ूर करें', 'भेटी मंजूर करा'],
  'Use phone location and specialized filters to locate the right veterinary doctor.': ['सही पशु चिकित्सक खोजने के लिए फोन की लोकेशन और विशेष फ़िल्टर का उपयोग करें।', 'योग्य पशुवैद्य शोधण्यासाठी फोनचे स्थान आणि विशेष फिल्टर वापरा.'],
  'Farmers request visits, doctors approve or reject, and contact becomes available only after approval.': ['किसान मुलाकात का अनुरोध करते हैं, डॉक्टर मंज़ूर या अस्वीकार करते हैं; संपर्क मंज़ूरी के बाद उपलब्ध होता है।', 'शेतकरी भेटीची विनंती करतात, डॉक्टर मंजूर किंवा नाकारतात; मंजुरीनंतरच संपर्क उपलब्ध होतो.'],
  'Doctors generate authenticated treatment PDFs with medicines, dosage, and signature notes.': ['डॉक्टर दवाओं, खुराक और हस्ताक्षर विवरण सहित प्रमाणित उपचार PDF बनाते हैं।', 'डॉक्टर औषधे, मात्रा आणि स्वाक्षरी तपशीलासह प्रमाणित उपचार PDF तयार करतात.'],
  'New request': ['नया अनुरोध', 'नवीन विनंती'],
  'Past appointment': ['पिछली अपॉइंटमेंट', 'मागील भेट'],
  'Upcoming / today': ['आगामी / आज', 'आगामी / आज'],
  'Reason:': ['कारण:', 'कारण:'],
  'Farmer:': ['किसान:', 'शेतकरी:'],
  'Animal:': ['पशु:', 'जनावर:'],
  'Farmer contact:': ['किसान का संपर्क:', 'शेतकऱ्याचा संपर्क:'],
  'Doctor contact:': ['डॉक्टर का संपर्क:', 'डॉक्टरांचा संपर्क:'],
  'Fee and medicine document options are available only during the scheduled appointment.': ['शुल्क और दवा दस्तावेज़ के विकल्प केवल तय अपॉइंटमेंट के दौरान उपलब्ध हैं।', 'शुल्क आणि औषधाच्या कागदपत्रांचे पर्याय नियोजित भेटीदरम्यानच उपलब्ध आहेत.'],
  'Free payment demo is enabled. You can also contact the doctor using the number above.': ['मुफ़्त भुगतान डेमो चालू है। आप ऊपर दिए नंबर पर डॉक्टर से संपर्क भी कर सकते हैं।', 'मोफत देयक डेमो सुरू आहे. वर दिलेल्या क्रमांकावर डॉक्टरांशी संपर्कही करू शकता.'],
  'Nothing in this view': ['इस दृश्य में कुछ नहीं है', 'या दृश्यात काहीही नाही'],
  'Try another appointment filter.': ['कोई दूसरा अपॉइंटमेंट फ़िल्टर आज़माएं।', 'दुसरा भेट फिल्टर वापरून पहा.'],
  'ACTION NEEDED': ['कार्रवाई आवश्यक', 'कृती आवश्यक'],
  'Requests from farmers': ['किसानों के अनुरोध', 'शेतकऱ्यांच्या विनंत्या'],
  'Confirmed & past visits': ['पुष्ट और पिछली मुलाकातें', 'निश्चित आणि मागील भेटी'],
  'Age': ['उम्र', 'वय'],
  'e.g. 3 years': ['उदा. 3 वर्ष', 'उदा. 3 वर्षे'],
  'New appointment request': ['नया अपॉइंटमेंट अनुरोध', 'नवीन भेटीची विनंती'],
  'Appointment approved': ['अपॉइंटमेंट मंज़ूर', 'भेट मंजूर'],
  'Appointment rejected': ['अपॉइंटमेंट अस्वीकृत', 'भेट नाकारली'],
  'Appointment cancelled': ['अपॉइंटमेंट रद्द', 'भेट रद्द केली'],
  'Payment received': ['भुगतान प्राप्त हुआ', 'देयक प्राप्त झाले'],
  'Observed symptoms (': ['दिखे हुए लक्षण (', 'दिसलेली लक्षणे ('],
  ' selected)': [' चुने गए)', ' निवडलेली)'],
  'Scores compare your selected signs with similar animal records.': ['स्कोर आपके चुने हुए लक्षणों की मिलते-जुलते पशु रिकॉर्ड से तुलना करते हैं।', 'स्कोअर तुमच्या निवडलेल्या लक्षणांची समान जनावरांच्या नोंदींशी तुलना करतात.'],
  'This is an experimental dataset match, not a diagnosis or a validated probability. The reference data is limited; contact a veterinarian for assessment, especially if symptoms are severe or worsening.': ['यह प्रयोगात्मक डेटासेट मिलान है, निदान या प्रमाणित संभावना नहीं। संदर्भ डेटा सीमित है; लक्षण गंभीर हों या बढ़ें तो पशु चिकित्सक से संपर्क करें।', 'ही प्रायोगिक डेटासेट जुळणी आहे; निदान किंवा प्रमाणित संभाव्यता नाही. संदर्भ डेटा मर्यादित आहे; लक्षणे गंभीर किंवा वाढत असल्यास पशुवैद्यांशी संपर्क साधा.'],
  'A veterinarian reported a local livestock or poultry health concern.': ['पशु चिकित्सक ने स्थानीय पशुधन या मुर्गीपालन स्वास्थ्य समस्या की रिपोर्ट की है।', 'पशुवैद्यांनी स्थानिक पशुधन किंवा कुक्कुट आरोग्य समस्येचा अहवाल दिला आहे.'],
  'AUTHORIZED CARE NOTE': ['प्रमाणित देखभाल नोट', 'प्रमाणित काळजीची नोंद'],
  'Authorized care notes will appear here for you to review and download.': ['समीक्षा और डाउनलोड के लिए प्रमाणित देखभाल नोट यहां दिखेंगे।', 'तपासणी आणि डाउनलोडसाठी प्रमाणित काळजीच्या नोंदी येथे दिसतील.'],
  'Connect with verified vets, schedule appointments, view alerts, and manage medicine instructions from a mobile-first platform built for rural animal care.': ['सत्यापित पशु चिकित्सकों से जुड़ें, अपॉइंटमेंट तय करें, चेतावनियां देखें और ग्रामीण पशु देखभाल के लिए दवा निर्देश संभालें।', 'सत्यापित पशुवैद्यांशी संपर्क साधा, भेटी ठरवा, सूचना पहा आणि ग्रामीण पशु काळजीसाठी औषधांच्या सूचना व्यवस्थापित करा.'],
  'Login failed. Please try again.': ['लॉग इन विफल। कृपया फिर कोशिश करें।', 'लॉग इन अयशस्वी. कृपया पुन्हा प्रयत्न करा.'],
  'Registration failed.': ['पंजीकरण विफल।', 'नोंदणी अयशस्वी.'],
  'Unable to load notifications.': ['सूचनाएं लोड नहीं हो सकीं।', 'सूचना लोड करता आल्या नाहीत.'],
  'Unable to update this notification.': ['यह सूचना अपडेट नहीं हो सकी।', 'ही सूचना अद्ययावत करता आली नाही.'],
  'End this session on this device': ['इस डिवाइस पर सत्र समाप्त करें', 'या उपकरणावरील सत्र समाप्त करा'],
  'Call connected': ['कॉल जुड़ गई', 'कॉल जोडला गेला'],
  'Waiting for the other participant...': ['दूसरे प्रतिभागी की प्रतीक्षा...', 'दुसऱ्या सहभागीची प्रतीक्षा...'],
  'Both participants joined. Establishing video...': ['दोनों प्रतिभागी जुड़ गए। वीडियो कनेक्शन बन रहा है...', 'दोन्ही सहभागी जोडले. व्हिडिओ जोडत आहोत...'],
}

function translateText(text: string, language: Language) {
  if (language === 'en') return text
  const trimmed = text.trim()
  const translation = supplementalTranslations[trimmed]?.[language === 'hi' ? 0 : 1]
    ?? phraseTranslations[trimmed]?.[language === 'hi' ? 0 : 1]
    ?? translatePredictionText(trimmed, language)
  return translation ? text.replace(trimmed, translation) : text
}

function translateNode(node: ReactNode, language: Language): ReactNode {
  if (typeof node === 'string') return translateText(node, language)
  if (Array.isArray(node)) return Children.toArray(node).map((child) => translateNode(child, language))
  if (!isValidElement(node)) return node

  const props = node.props as Record<string, unknown>
  const changes: Record<string, unknown> = {}
  if (props.children !== undefined) changes.children = translateNode(props.children as ReactNode, language)
  for (const attribute of ['placeholder', 'title', 'aria-label', 'aria-description', 'alt']) {
    const value = props[attribute]
    if (typeof value === 'string') changes[attribute] = translateText(value, language)
  }
  return cloneElement(node, changes as Partial<typeof node.props>)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ani-care-language')
    return saved === 'hi' || saved === 'mr' ? saved : 'en'
  })

  const setLanguage = (nextLanguage: Language) => {
    localStorage.setItem('ani-care-language', nextLanguage)
    setLanguageState(nextLanguage)
  }

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function Localized({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  return <>{translateNode(children, language)}</>
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  return (
    <label className="language-switcher">
      <span>{translateText('Language', language)}</span>
      <select aria-label="Language" value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="mr">मराठी</option>
      </select>
    </label>
  )
}