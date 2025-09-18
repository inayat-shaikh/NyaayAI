"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr' | 'gu' | 'kn' | 'ml' | 'pa' | 'ur'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const translations = {
  en: {
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.upload': 'Upload',
    'common.download': 'Download',
    
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    
    // Auth
    'auth.signin': 'Sign In',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.rememberMe': 'Remember Me',
    
    // Legal
    'legal.complaint': 'Complaint',
    'legal.fir': 'FIR',
    'legal.case': 'Case',
    'legal.hearing': 'Hearing',
    'legal.judgment': 'Judgment',
    'legal.evidence': 'Evidence',
    'legal.document': 'Document',
    
    // Status
    'status.pending': 'Pending',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.completed': 'Completed',
    'status.failed': 'Failed',
    'status.processing': 'Processing'
  },
  hi: {
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.search': 'खोजें',
    'common.filter': 'फ़िल्टर',
    'common.upload': 'अपलोड',
    'common.download': 'डाउनलोड',
    
    // Navigation
    'nav.home': 'होम',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.logout': 'लॉग आउट',
    
    // Auth
    'auth.signin': 'साइन इन',
    'auth.signup': 'साइन अप',
    'auth.email': 'ईमेल',
    'auth.password': 'पासवर्ड',
    'auth.forgotPassword': 'पासवर्ड भूल गए?',
    'auth.rememberMe': 'मुझे याद रखें',
    
    // Legal
    'legal.complaint': 'शिकायत',
    'legal.fir': 'एफआईआर',
    'legal.case': 'केस',
    'legal.hearing': 'सुनवाई',
    'legal.judgment': 'निर्णय',
    'legal.evidence': 'सबूत',
    'legal.document': 'दस्तावेज़',
    
    // Status
    'status.pending': 'लंबित',
    'status.approved': 'स्वीकृत',
    'status.rejected': 'अस्वीकृत',
    'status.completed': 'पूर्ण',
    'status.failed': 'विफल',
    'status.processing': 'प्रसंस्करण'
  },
  bn: {
    // Bengali translations
    'common.loading': 'লোড হচ্ছে...',
    'common.save': 'সংরক্ষণ করুন',
    'common.cancel': 'বাতিল করুন',
    'common.delete': 'মুছে ফেলুন',
    'common.edit': 'সম্পাদনা করুন',
    'common.view': 'দেখুন',
    'common.search': 'অনুসন্ধান করুন',
    'common.filter': 'ফিল্টার',
    'common.upload': 'আপলোড',
    'common.download': 'ডাউনলোড',
    
    // Navigation
    'nav.home': 'হোম',
    'nav.dashboard': 'ড্যাশবোর্ড',
    'nav.profile': 'প্রোফাইল',
    'nav.settings': 'সেটিংস',
    'nav.logout': 'লগআউট',
    
    // Auth
    'auth.signin': 'সাইন ইন',
    'auth.signup': 'সাইন আপ',
    'auth.email': 'ইমেল',
    'auth.password': 'পাসওয়ার্ড',
    'auth.forgotPassword': 'পাসওয়ার্ড ভুলে গেছেন?',
    'auth.rememberMe': 'আমাকে মনে রাখুন',
    
    // Legal
    'legal.complaint': 'অভিযোগ',
    'legal.fir': 'এফআইআর',
    'legal.case': 'মামলা',
    'legal.hearing': 'শুনানি',
    'legal.judgment': 'রায়',
    'legal.evidence': 'প্রমাণ',
    'legal.document': 'নথি',
    
    // Status
    'status.pending': 'মুলতুবি',
    'status.approved': 'অনুমোদিত',
    'status.rejected': 'প্রত্যাখ্যাত',
    'status.completed': 'সম্পন্ন',
    'status.failed': 'ব্যর্থ',
    'status.processing': 'প্রক্রিয়াধীন'
  },
  ta: {
    // Tamil translations
    'common.loading': 'ஏற்றுகிறது...',
    'common.save': 'சேமி',
    'common.cancel': 'ரத்துசெய்',
    'common.delete': 'நீக்கு',
    'common.edit': 'திருத்து',
    'common.view': 'பார்',
    'common.search': 'தேடு',
    'common.filter': 'வடிகட்டி',
    'common.upload': 'பதிவேற்று',
    'common.download': 'பதிவிறக்கு',
    
    // Navigation
    'nav.home': 'முகப்பு',
    'nav.dashboard': 'டாஷ்போர்டு',
    'nav.profile': 'சுயவிவரம்',
    'nav.settings': 'அமைப்புகள்',
    'nav.logout': 'வெளியேறு',
    
    // Auth
    'auth.signin': 'உள்நுழைக',
    'auth.signup': 'பதிவுசெய்',
    'auth.email': 'மின்னஞ்சல்',
    'auth.password': 'கடவுச்சொல்',
    'auth.forgotPassword': 'கடவுச்சொல்லை மறந்துவிட்டீர்களா?',
    'auth.rememberMe': 'என்னை நினைவில் கொள்ளுங்கள்',
    
    // Legal
    'legal.complaint': 'புகார்',
    'legal.fir': 'எஃப்ஐஆர்',
    'legal.case': 'வழக்கு',
    'legal.hearing': 'விசாரணை',
    'legal.judgment': 'தீர்ப்பு',
    'legal.evidence': 'ஆதாரம்',
    'legal.document': 'ஆவணம்',
    
    // Status
    'status.pending': 'நிலுவையில்',
    'status.approved': 'அங்கீகரிக்கப்பட்டது',
    'status.rejected': 'நிராகரிக்கப்பட்டது',
    'status.completed': 'முடிந்தது',
    'status.failed': 'தோல்வியுற்றது',
    'status.processing': 'செயலாக்குகிறது'
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  const t = (key: string): string => {
    return translations[language]?.[key as keyof typeof translations['en']] || key
  }

  const isRTL = language === 'ur'

  const value = {
    language,
    setLanguage,
    t,
    isRTL
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}