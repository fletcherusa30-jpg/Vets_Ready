import { VANavigatorStep, VABenefit } from "../types"

const VA_BENEFITS_STEPS: VANavigatorStep[] = [
  {
    id: "step1",
    step: 1,
    title: "VA Healthcare Enrollment",
    description: "Enroll in VA Healthcare to receive medical services",
    benefits: [
      {
        type: "healthcare",
        name: "VA Health Insurance",
        description: "Comprehensive healthcare coverage through VA Medical Centers",
        eligibility: "All honorably discharged service members",
        applicationUrl: "https://www.va.gov/health-care/how-to-apply/",
        processingTime: "2-4 weeks",
      },
    ],
    actions: ["Visit VA.gov", "Create VA.gov account", "Complete Form 10-10EZ", "Schedule appointment"],
  },
  {
    id: "step2",
    step: 2,
    title: "VA Disability Claims",
    description: "File disability claims for service-connected conditions",
    benefits: [
      {
        type: "disability",
        name: "Disability Compensation",
        description: "Monthly payment for service-connected disabilities",
        eligibility: "Conditions caused by or aggravated by military service",
        applicationUrl: "https://www.va.gov/disability/how-to-file-claim/",
        processingTime: "3-6 months",
      },
    ],
    actions: ["Gather medical evidence", "File VA Form 21-0966", "Attend C&P exam", "Await rating decision"],
  },
  {
    id: "step3",
    step: 3,
    title: "Education & Training",
    description: "Access education benefits (GI Bill, Voc Rehab)",
    benefits: [
      {
        type: "education",
        name: "Post-9/11 GI Bill",
        description: "Education benefit covering tuition and housing",
        eligibility: "30+ days of qualifying service after 9/11/2001",
        applicationUrl: "https://www.va.gov/education/",
        processingTime: "1-2 weeks",
      },
    ],
    actions: ["Select approved school", "Apply for education benefit", "Upload discharge papers", "Enroll in courses"],
  },
  {
    id: "step4",
    step: 4,
    title: "Housing Benefits",
    description: "Explore VA home loans and housing assistance programs",
    benefits: [
      {
        type: "housing",
        name: "VA Home Loan",
        description: "Home purchase loan with no down payment required",
        eligibility: "Minimum 24 months active service",
        applicationUrl: "https://www.va.gov/housing-assistance/",
        processingTime: "30-45 days",
      },
    ],
    actions: ["Check eligibility", "Obtain Certificate of Eligibility", "Find VA lender", "Apply for loan"],
  },
  {
    id: "step5",
    step: 5,
    title: "Employment Support",
    description: "Access job training, placement, and support services",
    benefits: [
      {
        type: "employment",
        name: "Veteran Job Programs",
        description: "Job training, placement assistance, and employer connections",
        eligibility: "All veterans",
        applicationUrl: "https://www.va.gov/employment/",
        processingTime: "Ongoing",
      },
    ],
    actions: ["Explore job training options", "Connect with veteran recruiters", "Build profile on job board", "Attend workshops"],
  },
]

export function getVANavigationSteps(): VANavigatorStep[] {
  return VA_BENEFITS_STEPS
}

export function getVABenefitsByType(type: string): VABenefit[] {
  return VA_BENEFITS_STEPS.flatMap((step) => step.benefits.filter((b) => b.type === type))
}
