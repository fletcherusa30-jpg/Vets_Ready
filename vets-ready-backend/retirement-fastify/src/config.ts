export const config = {
  port: Number(process.env.RETIREMENT_API_PORT || 4100),
  host: process.env.RETIREMENT_API_HOST || "0.0.0.0",
  corsOrigins: (process.env.RETIREMENT_API_CORS || "*")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  defaultInflation: 0.025,
  defaultCola: 0.02,
  defaultHealthcareInflation: 0.04,
  defaultHousingInflation: 0.03,
}
