/**
 * ╔═══════════════════════════════════════════════════════════════╗
 * ║  🍄 MYCOVITA OS - CONFIG                                      ║
 * ║  Tüm ayarlar ve sabitler                                      ║
 * ╚═══════════════════════════════════════════════════════════════╝
 */

const CONFIG = {
  PROJECT_ID: 'gen-lang-client-0147031523',
  LOCATION: 'us-central1',
  MODEL_ID: 'gemini-2.0-flash-001',
  ROOT_ID: '1UV05t1UA4_eNB-ZhEgvQZp80ILmeKdsy',
  INBOX_ID: '1Myaz3s5C3gXN23N2but-2JT05twhD7M1',
  GMAIL_LABEL: 'SIPARISLER',
  PROCESSED_LABEL: 'MYCO-ISLENDI',
  ORDER_EMAIL: 'siparis@mycovita.com.tr',
  DASHBOARD_SHEET_ID: '1AcTsmsfEs1t1vpSTUfEMmYuuS0mI820gR6rGYBhSKs4',
  SKU_SHEET_ID: '13vJ5SA7qoEjXvMsojay7eaidvb-ktHwzQPgDmqa2Fuw',
  OPENWEATHER_API_KEY: '8e5b6dc52e041df2be858aa2d82ed616',
  WEATHER_LOCATIONS: [
    { name: 'Ordu', lat: 40.9839, lon: 37.8764 },
    { name: 'Ulubey', lat: 40.8667, lon: 37.7500 },
    { name: 'İstanbul', lat: 41.0082, lon: 28.9784 }
  ],
  MARKETPLACES: ['TRENDYOL', 'HEPSIBURADA', 'AMAZON_TR', 'MYCOVITA'],
  BATCH_SIZE_GMAIL: 10,
  BATCH_SIZE_DRIVE: 15,
  SLEEP_MS: 200,
  MAX_FILE_SIZE_MB: 10,
  TERMINAL_MAX_LINES: 50
};

const FOLDER_MAP = {
  "EQUIPMENT_UNIT_A": { folderId: "1_HArZfmRP9JHPumgW9qeqH9hr02j-CpD", description: "UNIT A EQUIPMENT." },
  "EQUIPMENT_UNIT_B": { folderId: "1HtJU-HUA0eWHGySFYVQqbFS0flqriAA3", description: "UNIT B EQUIPMENT." },
  "EQUIPMENT_UNIT_C": { folderId: "1roNuD7mWPAZn-xdulCimeG3GQKCVNs82", description: "UNIT C EQUIPMENT." },
  "EQUIPMENT_UNIT_D": { folderId: "1gJmenu59NRB8KXgySZyUDkkQMg7Iw22q", description: "UNIT D EQUIPMENT." },
  "EQUIPMENT_COMMON": { folderId: "1PNY_t7dJwwFVciORYibi9XI_e3aaeOc5", description: "COMMON AREA EQUIPMENT." },
  "EQUIPMENT_GENERAL": { folderId: "1ZAoH2jBdjoFVb0aWrnPOkFAlbcXTVlP7", description: "GENERAL EQUIPMENT." },
  "IT_CODE": { folderId: "1tzaePCyo-6618H9YNTFgzhdOqjlqd1Pk", description: "SOFTWARE CODE." },
  "CONSTRUCTION": { folderId: "1JyTq10fttoNtXRlwYOQEhp9IVLLl02Hg", description: "CONSTRUCTION." },
  "INVOICE_INCOME": { folderId: "1IklCsQvSWxYmbCoNfxqux9nALvSZg3oQ", description: "INCOME INVOICE." },
  "INVOICE_EXPENSE": { folderId: "1Em4-RfTGFJpyrv-DklZCF3VnHiT4USeg", description: "EXPENSE INVOICE." },
  "SALES_ORDER": { folderId: "1bYzkDzQR8agA119H2mn3vfjaydnDpbIC", description: "CUSTOMER ORDERS." },
  "ECOMMERCE": { folderId: "1oDU654p0PidXC0YG1usNQ_SbHSpMXSP1", description: "ECOMMERCE REPORTS." },
  "SOCIAL_MEDIA": { folderId: "1d5V5uF3maiEE1OXV3P6fSCndymS6O-A6", description: "SOCIAL MEDIA." },
  "BLOG_CONTENT": { folderId: "1VvQYVQ0lqbH5I1Ky8OdoUMWCGehsaU1k", description: "BLOG DRAFTS." },
  "SEO_REPORT": { folderId: "1Rha_37iazDjhbScoqwZygzt-iTzkcS7v", description: "SEO ANALYTICS." },
  "MARKETING_ASSET": { folderId: "14pJLRKyn2GZNk0ndCKJaUZIu_NfxHOm-", description: "VISUAL ASSETS." },
  "BRANDING": { folderId: "1UY4QGXoNWT6BuiRqjtr60s6eq-nSZJFL", description: "BRAND IDENTITY." },
  "IOT_UNIT_A": { folderId: "1gA17-jWqLuZhfvA9z0UCvbZmR9lYTd5v", description: "IOT SENSORS UNIT A." },
  "IOT_UNIT_B": { folderId: "1wwbdE1I8LCTBrw5PB3MPKzXByTxCOIkF", description: "IOT SENSORS UNIT B." },
  "IOT_UNIT_C": { folderId: "14qmEEs9JCqjEiOzVweNGbVqqN9h2G5f-", description: "IOT SENSORS UNIT C." },
  "IOT_UNIT_D": { folderId: "1HimhfZIyuy-LckEN8a4mxSDujr1gc5Jf", description: "IOT SENSORS UNIT D." },
  "IOT_GENERAL": { folderId: "1oOSe-n3Ry7CVC4yphpK1titN4DBSdYOp", description: "GENERAL IOT DATA." },
  "WASTE_LOG": { folderId: "1nAuEGI1qsYPL9hu5jsdK0hBUjl4ncmfe", description: "WASTE MANAGEMENT." },
  "STERILIZATION": { folderId: "1sQbd5-MpqvfdSzc8skcOzUju69DZ5Z7P", description: "STERILIZATION LOGS." },
  "PRODUCTION_BATCH": { folderId: "1IF_Hwy-c7KKlieIKKH8MeBzMKEZLsizI", description: "BATCH LOGS." },
  "RAW_MATERIAL": { folderId: "1vbRlgKIjFM4r-xFsyDSH7GjWT1veRtuw", description: "RAW MATERIALS." },
  "STOCK_STATUS": { folderId: "1ebg8WTrFZZJ2DcW0j-gjBkWvW8IIBfB7", description: "STOCK LEVELS." },
  "PACKAGING": { folderId: "1kL9-VHCpFmjgvqAxBpGgo-Wz4HLb-_KD", description: "PACKAGING." },
  "PRODUCT_SPECS": { folderId: "1m8eRFIh4zpAOhpGoxCXOyTd0Jom4msrH", description: "SKU SPECS." },
  "ACADEMIC_LIBRARY": { folderId: "1cVs8rBoLpC0kcjT-zU2_sc6hfels_96h", description: "ACADEMIC PAPERS." },
  "LAB_REPORT": { folderId: "1qSBU7BqnAuckwbvTeMnb1o3JiaKxlQGr", description: "LAB RESULTS." },
  "TEST_PROTOCOL": { folderId: "1bSYLZpegA3sOYLbVIqJHk2ETN-c4qPaY", description: "TEST PROTOCOLS." },
  "STRAIN_LIBRARY": { folderId: "1cTzcBnNCsF7KXoPHpayEXnh81-T9HtFc", description: "STRAIN LIBRARY." },
  "CONTRACT": { folderId: "1oMLZCFUf4ZGFyjj3WTcFGY-1BL9RGktc", description: "CONTRACTS." },
  "HR_DOC": { folderId: "1uTce6VhDno8HCsQlXL1jwF0qL34orZOp", description: "HR." },
  "CERTIFICATES": { folderId: "1woj6qCQVMVV_HUrxcPy7K64jywsK6fAr", description: "CERTIFICATES." },
  "OFFICIAL_DOC": { folderId: "1wgx_XECDz8al3C7I1LJz2PDN153vqaqc", description: "GOVERNMENT DOCS." },
  "SYSTEM_LOGS": { folderId: "1YKTEXHSTuNk9UpMu8vM48SiSYdeZ3dJF", description: "SYSTEM LOGS." },
  "UNKNOWN": { folderId: "1MkL9L7b58_bXempCpHc7oszehwrOF-3M", description: "UNKNOWN files." }
};
