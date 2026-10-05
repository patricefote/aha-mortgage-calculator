"use client";

import { useEffect, useState } from "react";
import {
  calculateMortgage,
  LoanType,
  MortgageResults,
} from "../lib/mortgage";

const states = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

interface StateMarketData {
  year: number;
  state: string;
  stateName: string;
  loans: number;
  med_rate: number;
  med_costs: number;
  med_spread: number;
  med_amount: number;
  n_rate: number;
  n_costs: number;
  costs_p25: number;
  costs_p75: number;
  costs_share: number;
  pct_costs_reported: number;
  pct_points: number;
  pct_credits: number;
  pct_purchase: number;
  pct_refi: number;
  pct_conventional: number;
  pct_fha: number;
  pct_va: number;
}

interface MortgageInputState {
  homePrice: number;
  downPayment: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate: number;
  homeownersInsurance: number;
  hoa: number;
  loanType: LoanType;
  pmiRate: number;
  state: string;
}

const defaultInputs: MortgageInputState = {
  homePrice: 400000,
  downPayment: 20000,
  interestRate: 6.625,
  loanTermYears: 30,
  propertyTaxRate: 0.75,
  homeownersInsurance: 1800,
  hoa: 0,
  loanType: "Conventional",
  pmiRate: 0.5,
  state: "NM",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function Home() {
  const [inputs, setInputs] =
    useState<MortgageInputState>(defaultInputs);

  const [results, setResults] =
    useState<MortgageResults | null>(null);

  const [marketData, setMarketData] =
    useState<StateMarketData | null>(null);

  const [loadingMarketData, setLoadingMarketData] =
    useState(false);

  const [marketDataError, setMarketDataError] =
    useState("");

  useEffect(() => {
    async function loadStateMarketData() {
      setLoadingMarketData(true);
      setMarketDataError("");

      try {
        const response = await fetch(
          `/api/rates?state=${inputs.state}`
        );

        if (!response.ok) {
          throw new Error("Unable to load state market data.");
        }

        const data: StateMarketData = await response.json();

        setMarketData(data);

        setInputs((current) => ({
          ...current,
          interestRate:
            typeof data.med_rate === "number"
              ? data.med_rate
              : current.interestRate,
        }));
      } catch (error) {
        console.error(error);
        setMarketDataError(
          "State market data could not be loaded."
        );
        setMarketData(null);
      } finally {
        setLoadingMarketData(false);
      }
    }

    loadStateMarketData();
  }, [inputs.state]);

  function updateInput(
    field: keyof MortgageInputState,
    value: string | number
  ) {
    setInputs((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleCalculate() {
    const mortgageResults = calculateMortgage({
      homePrice: inputs.homePrice,
      downPayment: inputs.downPayment,
      interestRate: inputs.interestRate,
      loanTermYears: inputs.loanTermYears,
      propertyTaxRate: inputs.propertyTaxRate,
      homeownersInsurance: inputs.homeownersInsurance,
      hoa: inputs.hoa,
      loanType: inputs.loanType,
      pmiRate: inputs.pmiRate,
    });

    setResults(mortgageResults);
  }

  const selectedState =
    states.find((state) => state.code === inputs.state)?.name ||
    inputs.state;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#eef5ff] via-[#f7faff] to-[#e8f1ff] text-[#101828]">
      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">

          {/* STEP 01 */}
          <section className="rounded-3xl border border-blue-900/10 bg-white/95 p-6 shadow-[0_20px_60px_rgba(30,85,150,0.10)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1769e0]">
                  Step 01
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight text-[#0b1f3a]">
                  Tell us about the home.
                </h3>
              </div>

              <div className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1769e0]">
                {selectedState}
              </div>
            </div>

            <div className="space-y-6">

              {/* State */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24364b]">
                  State
                </label>

                <select
                  value={inputs.state}
                  onChange={(e) =>
                    updateInput("state", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#162b45] outline-none transition focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  {states.map((state) => (
                    <option
                      key={state.code}
                      value={state.code}
                    >
                      {state.name}
                    </option>
                  ))}
                </select>

                {loadingMarketData && (
                  <p className="mt-2 text-xs font-medium text-[#1769e0]">
                    Loading state market data...
                  </p>
                )}

                {marketData && !loadingMarketData && (
                  <p className="mt-2 text-xs text-slate-500">
                    {marketData.stateName} market reference:{" "}
                    <span className="font-bold text-[#1769e0]">
                      {marketData.med_rate.toFixed(3)}%
                    </span>{" "}
                    ({marketData.year} data)
                  </p>
                )}

                {marketDataError && (
                  <p className="mt-2 text-xs text-red-600">
                    {marketDataError}
                  </p>
                )}
              </div>

              {/* Home Price */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24364b]">
                  Home price
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-[#1769e0]">
                    $
                  </span>

                  <input
                    type="number"
                    value={inputs.homePrice}
                    onChange={(e) =>
                      updateInput(
                        "homePrice",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-4 text-sm text-[#162b45] outline-none transition focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Down Payment */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24364b]">
                  Down payment
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-[#1769e0]">
                    $
                  </span>

                  <input
                    type="number"
                    value={inputs.downPayment}
                    onChange={(e) =>
                      updateInput(
                        "downPayment",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-4 text-sm text-[#162b45] outline-none transition focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Loan Type */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24364b]">
                  Loan type
                </label>

                <select
                  value={inputs.loanType}
                  onChange={(e) =>
                    updateInput(
                      "loanType",
                      e.target.value as LoanType
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#162b45] outline-none transition focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="Conventional">
                    Conventional
                  </option>
                  <option value="FHA">FHA</option>
                  <option value="VA">VA</option>
                </select>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {inputs.loanType === "VA"
                    ? "VA loans do not include monthly PMI."
                    : inputs.loanType === "FHA"
                    ? "FHA loans include mortgage insurance in this estimate."
                    : "Conventional PMI is estimated when down payment is below 20%."}
                </p>
              </div>

              {/* Interest Rate + Term */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24364b]">
                    Interest rate
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      value={inputs.interestRate}
                      onChange={(e) =>
                        updateInput(
                          "interestRate",
                          Number(e.target.value)
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-9 text-sm text-[#162b45] outline-none transition focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-[#1769e0]">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24364b]">
                    Loan term
                  </label>

                  <select
                    value={inputs.loanTermYears}
                    onChange={(e) =>
                      updateInput(
                        "loanTermYears",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-[#162b45] outline-none transition focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  >
                    <option value={30}>30 years</option>
                    <option value={20}>20 years</option>
                    <option value={15}>15 years</option>
                    <option value={10}>10 years</option>
                  </select>
                </div>
              </div>

              {/* Taxes + Insurance */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24364b]">
                    Property tax rate
                  </label>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={inputs.propertyTaxRate}
                      onChange={(e) =>
                        updateInput(
                          "propertyTaxRate",
                          Number(e.target.value)
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-9 text-sm text-[#162b45] outline-none transition focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-medium text-[#1769e0]">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#24364b]">
                    Annual homeowners insurance
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-[#1769e0]">
                      $
                    </span>

                    <input
                      type="number"
                      value={inputs.homeownersInsurance}
                      onChange={(e) =>
                        updateInput(
                          "homeownersInsurance",
                          Number(e.target.value)
                        )
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-4 text-sm text-[#162b45] outline-none transition focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
              </div>

              {/* HOA */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#24364b]">
                  Monthly HOA
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium text-[#1769e0]">
                    $
                  </span>

                  <input
                    type="number"
                    value={inputs.hoa}
                    onChange={(e) =>
                      updateInput(
                        "hoa",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-9 pr-4 text-sm text-[#162b45] outline-none transition focus:border-[#1769e0] focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#0b4fa8] via-[#1769e0] to-[#2788f5] px-5 py-4 text-sm font-bold text-white shadow-[0_10px_30px_rgba(23,105,224,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(23,105,224,0.35)] active:translate-y-0"
              >
                <span className="relative z-10">
                  Calculate my payment
                </span>

                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>

              {/* Powered By */}
              <div className="-mt-2 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400">
                  Powered by{" "}
                  <span className="font-bold tracking-[0.12em] text-[#1769e0]">
                    Ad House Advertising
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* STEP 02 */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#071a35] via-[#0b2e5c] to-[#075ec7] p-6 text-white shadow-[0_25px_70px_rgba(8,53,110,0.28)] sm:p-8">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">
              <div className="mb-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
                  Step 02
                </p>

                <h3 className="mt-2 text-2xl font-bold tracking-tight">
                  Your estimated payment.
                </h3>
              </div>

              {!results ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] px-6 text-center backdrop-blur-sm">
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-blue-300/20 bg-blue-400/10 text-xl text-blue-200">
                    $
                  </div>

                  <h4 className="text-lg font-bold">
                    Your estimate is waiting.
                  </h4>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-blue-100/55">
                    Enter your home financing details and calculate
                    your estimated monthly payment.
                  </p>
                </div>
              ) : (
                <div>
                  {/* Payment Hero */}
                  <div className="relative overflow-hidden rounded-2xl bg-white px-6 py-7 text-[#0b1f3a] shadow-[0_15px_45px_rgba(0,0,0,0.12)]">
                    <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/70 blur-2xl" />

                    <div className="relative">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1769e0]">
                        Estimated monthly payment
                      </p>

                      <p className="mt-2 text-5xl font-bold tracking-[-0.05em] sm:text-6xl">
                        {formatCurrency(
                          results.totalMonthlyPayment
                        )}
                      </p>

                      <p className="mt-3 text-sm text-slate-500">
                        Based on a {inputs.loanTermYears}-year{" "}
                        {inputs.loanType} loan at{" "}
                        <span className="font-semibold text-[#1769e0]">
                          {inputs.interestRate.toFixed(3)}%
                        </span>
                        .
                      </p>
                    </div>
                  </div>

                  {/* Monthly Breakdown */}
                  <div className="mt-6">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-blue-200/60">
                      Monthly breakdown
                    </p>

                    <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                      <div className="flex items-center justify-between px-5 py-4">
                        <span className="text-sm text-blue-100/60">
                          Principal & interest
                        </span>
                        <span className="text-sm font-bold">
                          {formatCurrency(
                            results.principalAndInterest
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-5 py-4">
                        <span className="text-sm text-blue-100/60">
                          Property taxes
                        </span>
                        <span className="text-sm font-bold">
                          {formatCurrency(
                            results.propertyTaxes
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-5 py-4">
                        <span className="text-sm text-blue-100/60">
                          Homeowners insurance
                        </span>
                        <span className="text-sm font-bold">
                          {formatCurrency(
                            results.homeownersInsurance
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-5 py-4">
                        <span className="text-sm text-blue-100/60">
                          HOA
                        </span>
                        <span className="text-sm font-bold">
                          {formatCurrency(results.hoa)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between px-5 py-4">
                        <span className="text-sm text-blue-100/60">
                          Mortgage insurance
                        </span>
                        <span className="text-sm font-bold">
                          {formatCurrency(
                            results.mortgageInsurance
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Summary */}
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200/50">
                        Loan amount
                      </p>

                      <p className="mt-2 text-xl font-bold">
                        {formatCurrency(results.loanAmount)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-200/50">
                        Down payment
                      </p>

                      <p className="mt-2 text-xl font-bold">
                        {formatCurrency(inputs.downPayment)}
                      </p>
                    </div>
                  </div>

                  {/* Market Data */}
                  {marketData && (
                    <div className="mt-6 rounded-2xl border border-blue-300/15 bg-[#06182f]/45 p-5 backdrop-blur-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-200/55">
                            State market data
                          </p>

                          <p className="mt-1 text-sm font-semibold text-white/90">
                            {marketData.stateName}
                          </p>
                        </div>

                        <span className="rounded-full border border-blue-300/20 bg-blue-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-200/70">
                          {marketData.year} reference
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div>
                          <p className="text-[11px] text-blue-100/40">
                            Median rate
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {marketData.med_rate.toFixed(3)}%
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-blue-100/40">
                            Median loan
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {formatCurrency(
                              marketData.med_amount
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-blue-100/40">
                            Median costs
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {formatCurrency(
                              marketData.med_costs
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-blue-100/40">
                            Loans reported
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {marketData.loans.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-blue-100/40">
                            Purchase loans
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {formatPercent(
                              marketData.pct_purchase
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-blue-100/40">
                            Refinance
                          </p>
                          <p className="mt-1 text-sm font-bold">
                            {formatPercent(
                              marketData.pct_refi
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 border-t border-white/10 pt-5">
                        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-200/40">
                          Loan mix
                        </p>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-blue-100/45">
                              Conventional
                            </p>
                            <p className="mt-1 text-sm font-bold">
                              {formatPercent(
                                marketData.pct_conventional
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-blue-100/45">
                              FHA
                            </p>
                            <p className="mt-1 text-sm font-bold">
                              {formatPercent(
                                marketData.pct_fha
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-blue-100/45">
                              VA
                            </p>
                            <p className="mt-1 text-sm font-bold">
                              {formatPercent(
                                marketData.pct_va
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="mt-5 text-xs leading-5 text-blue-100/35">
                    Market data is provided as a reference and may
                    reflect historical lending activity. Actual
                    mortgage rates, costs, taxes, insurance, and
                    eligibility vary by borrower, property, lender,
                    and market conditions.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}