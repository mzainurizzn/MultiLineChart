export type YtdPoint = {
  tahun: number
  ytd_oee: number | null
  ytd_cu: number | null
  // ✅ tambahan target dari bulan terakhir
  tgt_ytd_oee: number | null
  tgt_ytd_cu: number | null
}

export type YtdLatestItem = {
  plant: string
  data: YtdPoint[]
}

export type YtdLatestResponse = YtdLatestItem[]

export type YearlyChartRow = {
  year: number
  oee: number | null
  cu: number | null
  // ✅ untuk garis target per year (naik turun)
  tgt_oee: number | null
  tgt_cu: number | null
}
