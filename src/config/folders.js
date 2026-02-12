/**
 * 🍄 MYCOVITA OS v2.0 - FOLDER MAP
 * Drive klasör eşleştirmeleri
 * Folder ID'ler env'den gelir, açıklamalar burada kalır
 */

// Folder ID'ler .env'de FOLDER_xxx şeklinde tanımlanır
// Eğer env'de yoksa varsayılan ID kullanılır (geliştirme ortamı için)
function getFolderId(key, fallback) {
  return process.env[`FOLDER_${key}`] || fallback;
}

const folderMap = {
  EQUIPMENT_UNIT_A:   { folderId: getFolderId('EQUIPMENT_UNIT_A',   '1_HArZfmRP9JHPumgW9qeqH9hr02j-CpD'), description: 'UNIT A EQUIPMENT' },
  EQUIPMENT_UNIT_B:   { folderId: getFolderId('EQUIPMENT_UNIT_B',   '1HtJU-HUA0eWHGySFYVQqbFS0flqriAA3'), description: 'UNIT B EQUIPMENT' },
  EQUIPMENT_UNIT_C:   { folderId: getFolderId('EQUIPMENT_UNIT_C',   '1roNuD7mWPAZn-xdulCimeG3GQKCVNs82'), description: 'UNIT C EQUIPMENT' },
  EQUIPMENT_UNIT_D:   { folderId: getFolderId('EQUIPMENT_UNIT_D',   '1gJmenu59NRB8KXgySZyUDkkQMg7Iw22q'), description: 'UNIT D EQUIPMENT' },
  EQUIPMENT_COMMON:   { folderId: getFolderId('EQUIPMENT_COMMON',   '1PNY_t7dJwwFVciORYibi9XI_e3aaeOc5'), description: 'COMMON AREA EQUIPMENT' },
  EQUIPMENT_GENERAL:  { folderId: getFolderId('EQUIPMENT_GENERAL',  '1ZAoH2jBdjoFVb0aWrnPOkFAlbcXTVlP7'), description: 'GENERAL EQUIPMENT' },
  IT_CODE:            { folderId: getFolderId('IT_CODE',            '1tzaePCyo-6618H9YNTFgzhdOqjlqd1Pk'), description: 'SOFTWARE CODE' },
  CONSTRUCTION:       { folderId: getFolderId('CONSTRUCTION',       '1JyTq10fttoNtXRlwYOQEhp9IVLLl02Hg'), description: 'CONSTRUCTION' },
  INVOICE_INCOME:     { folderId: getFolderId('INVOICE_INCOME',     '1IklCsQvSWxYmbCoNfxqux9nALvSZg3oQ'), description: 'INCOME INVOICE' },
  INVOICE_EXPENSE:    { folderId: getFolderId('INVOICE_EXPENSE',    '1Em4-RfTGFJpyrv-DklZCF3VnHiT4USeg'), description: 'EXPENSE INVOICE' },
  SALES_ORDER:        { folderId: getFolderId('SALES_ORDER',        '1bYzkDzQR8agA119H2mn3vfjaydnDpbIC'), description: 'CUSTOMER ORDERS' },
  ECOMMERCE:          { folderId: getFolderId('ECOMMERCE',          '1oDU654p0PidXC0YG1usNQ_SbHSpMXSP1'), description: 'ECOMMERCE REPORTS' },
  SOCIAL_MEDIA:       { folderId: getFolderId('SOCIAL_MEDIA',       '1d5V5uF3maiEE1OXV3P6fSCndymS6O-A6'), description: 'SOCIAL MEDIA' },
  BLOG_CONTENT:       { folderId: getFolderId('BLOG_CONTENT',       '1VvQYVQ0lqbH5I1Ky8OdoUMWCGehsaU1k'), description: 'BLOG DRAFTS' },
  SEO_REPORT:         { folderId: getFolderId('SEO_REPORT',         '1Rha_37iazDjhbScoqwZygzt-iTzkcS7v'), description: 'SEO ANALYTICS' },
  MARKETING_ASSET:    { folderId: getFolderId('MARKETING_ASSET',    '14pJLRKyn2GZNk0ndCKJaUZIu_NfxHOm-'), description: 'VISUAL ASSETS' },
  BRANDING:           { folderId: getFolderId('BRANDING',           '1UY4QGXoNWT6BuiRqjtr60s6eq-nSZJFL'), description: 'BRAND IDENTITY' },
  IOT_UNIT_A:         { folderId: getFolderId('IOT_UNIT_A',         '1gA17-jWqLuZhfvA9z0UCvbZmR9lYTd5v'), description: 'IOT SENSORS UNIT A' },
  IOT_UNIT_B:         { folderId: getFolderId('IOT_UNIT_B',         '1wwbdE1I8LCTBrw5PB3MPKzXByTxCOIkF'), description: 'IOT SENSORS UNIT B' },
  IOT_UNIT_C:         { folderId: getFolderId('IOT_UNIT_C',         '14qmEEs9JCqjEiOzVweNGbVqqN9h2G5f-'), description: 'IOT SENSORS UNIT C' },
  IOT_UNIT_D:         { folderId: getFolderId('IOT_UNIT_D',         '1HimhfZIyuy-LckEN8a4mxSDujr1gc5Jf'), description: 'IOT SENSORS UNIT D' },
  IOT_GENERAL:        { folderId: getFolderId('IOT_GENERAL',        '1oOSe-n3Ry7CVC4yphpK1titN4DBSdYOp'), description: 'GENERAL IOT DATA' },
  WASTE_LOG:          { folderId: getFolderId('WASTE_LOG',          '1nAuEGI1qsYPL9hu5jsdK0hBUjl4ncmfe'), description: 'WASTE MANAGEMENT' },
  STERILIZATION:      { folderId: getFolderId('STERILIZATION',      '1sQbd5-MpqvfdSzc8skcOzUju69DZ5Z7P'), description: 'STERILIZATION LOGS' },
  PRODUCTION_BATCH:   { folderId: getFolderId('PRODUCTION_BATCH',   '1IF_Hwy-c7KKlieIKKH8MeBzMKEZLsizI'), description: 'BATCH LOGS' },
  RAW_MATERIAL:       { folderId: getFolderId('RAW_MATERIAL',       '1vbRlgKIjFM4r-xFsyDSH7GjWT1veRtuw'), description: 'RAW MATERIALS' },
  STOCK_STATUS:       { folderId: getFolderId('STOCK_STATUS',       '1ebg8WTrFZZJ2DcW0j-gjBkWvW8IIBfB7'), description: 'STOCK LEVELS' },
  PACKAGING:          { folderId: getFolderId('PACKAGING',          '1kL9-VHCpFmjgvqAxBpGgo-Wz4HLb-_KD'), description: 'PACKAGING' },
  PRODUCT_SPECS:      { folderId: getFolderId('PRODUCT_SPECS',      '1m8eRFIh4zpAOhpGoxCXOyTd0Jom4msrH'), description: 'SKU SPECS' },
  ACADEMIC_LIBRARY:   { folderId: getFolderId('ACADEMIC_LIBRARY',   '1cVs8rBoLpC0kcjT-zU2_sc6hfels_96h'), description: 'ACADEMIC PAPERS' },
  LAB_REPORT:         { folderId: getFolderId('LAB_REPORT',         '1qSBU7BqnAuckwbvTeMnb1o3JiaKxlQGr'), description: 'LAB RESULTS' },
  TEST_PROTOCOL:      { folderId: getFolderId('TEST_PROTOCOL',      '1bSYLZpegA3sOYLbVIqJHk2ETN-c4qPaY'), description: 'TEST PROTOCOLS' },
  STRAIN_LIBRARY:     { folderId: getFolderId('STRAIN_LIBRARY',     '1cTzcBnNCsF7KXoPHpayEXnh81-T9HtFc'), description: 'STRAIN LIBRARY' },
  CONTRACT:           { folderId: getFolderId('CONTRACT',           '1oMLZCFUf4ZGFyjj3WTcFGY-1BL9RGktc'), description: 'CONTRACTS' },
  HR_DOC:             { folderId: getFolderId('HR_DOC',             '1uTce6VhDno8HCsQlXL1jwF0qL34orZOp'), description: 'HR' },
  CERTIFICATES:       { folderId: getFolderId('CERTIFICATES',       '1woj6qCQVMVV_HUrxcPy7K64jywsK6fAr'), description: 'CERTIFICATES' },
  OFFICIAL_DOC:       { folderId: getFolderId('OFFICIAL_DOC',       '1wgx_XECDz8al3C7I1LJz2PDN153vqaqc'), description: 'GOVERNMENT DOCS' },
  SYSTEM_LOGS:        { folderId: getFolderId('SYSTEM_LOGS',        '1YKTEXHSTuNk9UpMu8vM48SiSYdeZ3dJF'), description: 'SYSTEM LOGS' },
  UNKNOWN:            { folderId: getFolderId('UNKNOWN',            '1MkL9L7b58_bXempCpHc7oszehwrOF-3M'), description: 'UNKNOWN files' }
};

module.exports = folderMap;
