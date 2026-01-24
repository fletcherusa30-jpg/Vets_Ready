import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Bar, BarChart } from "recharts"
import { RetirementPlanResult } from "../types"

export function RetirementGrowthChart({ result }: { result: RetirementPlanResult }) {
  const data = result.balances.map((b) => ({ year: b.year, nominal: b.nominalBalance, real: b.realBalance }))
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="nominal" stroke="#2563eb" name="Nominal" />
        <Line type="monotone" dataKey="real" stroke="#16a34a" name="Real" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function IncomeMixChart({ result }: { result: RetirementPlanResult }) {
  const data = result.incomes.map((i) => ({ name: i.source, monthly: i.monthly }))
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="monthly" fill="#22c55e" name="Monthly" />
      </BarChart>
    </ResponsiveContainer>
  )
}
