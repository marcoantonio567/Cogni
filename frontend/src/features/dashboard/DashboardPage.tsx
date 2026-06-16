import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { useEffect, useMemo, useState } from 'react'
import { Line } from 'react-chartjs-2'
import { api, type DashboardSummary } from '../../shared/api'
import { PageHeader } from '../../shared/components/PageHeader'
import { ProgressBar } from '../../shared/components/ProgressBar'
import { StatusMessage } from '../../shared/components/StatusMessage'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .dashboardSummary()
      .then(setSummary)
      .catch(() => setError('Não foi possível carregar as métricas pela API configurada.'))
  }, [])

  const chartData = useMemo(
    () => ({
      labels: summary?.weekly.map((point) => point.label) ?? [],
      datasets: [
        {
          label: 'Subtópicos concluídos',
          data: summary?.weekly.map((point) => point.concluidos) ?? [],
          borderColor: '#1d4ed8',
          backgroundColor: 'rgba(29, 78, 216, 0.14)',
          fill: true,
          tension: 0.35,
          pointRadius: 4,
        },
      ],
    }),
    [summary],
  )

  return (
    <main className="workspace">
      <PageHeader
        description="Acompanhe o volume de estudo, evolução semanal e conclusão geral em um só lugar."
        eyebrow="Dashboard"
        title="Visão geral"
      />

      {error ? <StatusMessage tone="error">{error}</StatusMessage> : null}

      {!summary ? (
        <StatusMessage>Carregando métricas...</StatusMessage>
      ) : (
        <>
          <section className="overview-band" aria-label="Progresso geral no dashboard">
            <div>
              <span>Progresso geral</span>
              <strong>{summary.progressoGeral}%</strong>
            </div>
            <ProgressBar label="Progresso geral informado pelo dashboard" value={summary.progressoGeral} />
          </section>

          <section className="metrics-grid" aria-label="Métricas de estudo">
            {summary.metrics.map((metric) => (
              <article className="metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.hint}</small>
              </article>
            ))}
          </section>

          <section className="chart-panel" aria-label="Gráfico semanal de estudos">
            <header>
              <h2>Conclusões na semana</h2>
              <span>Subtópicos finalizados por dia</span>
            </header>
            <div className="chart-frame">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: { intersect: false, mode: 'index' },
                  },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { precision: 0 } },
                  },
                }}
              />
            </div>
          </section>
        </>
      )}
    </main>
  )
}
