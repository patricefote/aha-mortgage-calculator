export type LoanType = "VA" | "Conventional" | "FHA";

export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate: number;
  homeownersInsurance: number;
  hoa: number;
  loanType: LoanType;
  pmiRate?: number;
  fhaUpfrontMIPRate?: number;
  fhaAnnualMIPRate?: number;
}

export interface MortgageResults {
  loanAmount: number;
  principalAndInterest: number;
  propertyTaxes: number;
  homeownersInsurance: number;
  hoa: number;
  mortgageInsurance: number;
  totalMonthlyPayment: number;
}

function calculatePrincipalAndInterest(
  loanAmount: number,
  annualInterestRate: number,
  loanTermYears: number
): number {
  if (loanAmount <= 0) return 0;

  const monthlyRate = annualInterestRate / 100 / 12;
  const numberOfPayments = loanTermYears * 12;

  if (monthlyRate === 0) {
    return loanAmount / numberOfPayments;
  }

  return (
    (loanAmount *
      monthlyRate *
      Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );
}

export function calculateMortgage(
  inputs: MortgageInputs
): MortgageResults {
  const {
    homePrice,
    downPayment,
    interestRate,
    loanTermYears,
    propertyTaxRate,
    homeownersInsurance,
    hoa,
    loanType,
    pmiRate = 0.5,
    fhaAnnualMIPRate = 0.55,
  } = inputs;

  const loanAmount = Math.max(homePrice - downPayment, 0);

  const principalAndInterest = calculatePrincipalAndInterest(
    loanAmount,
    interestRate,
    loanTermYears
  );

  const propertyTaxes =
    (homePrice * (propertyTaxRate / 100)) / 12;

  const monthlyInsurance = homeownersInsurance / 12;

  let mortgageInsurance = 0;

  // VA loans do not have monthly PMI.
  if (loanType === "VA") {
    mortgageInsurance = 0;
  }

  // Conventional PMI is applied when applicable.
  if (loanType === "Conventional" && downPayment < homePrice * 0.2) {
    mortgageInsurance =
      (loanAmount * (pmiRate / 100)) / 12;
  }

  // FHA annual mortgage insurance.
  if (loanType === "FHA") {
    mortgageInsurance =
      (loanAmount * (fhaAnnualMIPRate / 100)) / 12;
  }

  const totalMonthlyPayment =
    principalAndInterest +
    propertyTaxes +
    monthlyInsurance +
    hoa +
    mortgageInsurance;

  return {
    loanAmount,
    principalAndInterest,
    propertyTaxes,
    homeownersInsurance: monthlyInsurance,
    hoa,
    mortgageInsurance,
    totalMonthlyPayment,
  };
}