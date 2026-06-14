import companyJson from '@/data/content/company-info.json'
import type { CompanyInfoData } from '@/data/types'

const companyData = companyJson as CompanyInfoData

export function getCompanyInfo() {
  return companyData
}

export function getSiteInfo() {
  return companyData.site
}

export function getContactInfo() {
  return companyData.contact
}

export function getFooterContent() {
  return companyData.footer
}
