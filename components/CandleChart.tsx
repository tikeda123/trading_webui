"use client"

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createChart, CrosshairMode, IChartApi, ColorType } from 'lightweight-charts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import DashboardLayout from './DashboardLayout'

// Constants
const CHART_COLORS = {
  background: '#ffffff',
  textColor: 'rgba(33, 56, 77, 1)',
  gridColor: 'rgba(197, 203, 206, 0.5)',
  borderColor: 'rgba(197, 203, 206, 1)',
  upColor: '#26a69a',
  downColor: '#ef5350',
  macdColor: 'blue',
  signalColor: 'red',
}

const TIME_FRAMES = ['1日', '5日', '1ヶ月', '3ヶ月', '6ヶ月', '年初来', '1年', '5年', 'すべて']
const INTERVALS = [
  { value: '5', label: '5分' },
  { value: '15', label: '15分' },
  { value: '30', label: '30分' },
  { value: '60', label: '1時間' },
  { value: '120', label: '2時間' },
  { value: '240', label: '4時間' },
  { value: '720', label: '12時間' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Custom hooks
const useChartData = (symbol: string, startDate: string, endDate: string, interval: string) => {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/market_data_tech/search/?start_datetime=${startDate}&end_datetime=${endDate}&symbol=${symbol}&interval=${interval}`)
        const data = await response.json()

        const formattedData = data.map((item: any) => {
          const time = Date.parse(item.start_at + 'Z') / 1000
          return {
            time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            upper2: item.upper2,
            middle: item.middle,
            lower2: item.lower2,
            macd: item.macd,
            macdsignal: item.macdsignal,
            macdhist: item.macdhist,
          }
        })

        // 改修: データを時間でソート
        const sortedData = formattedData.sort((a: any, b: any) => a.time - b.time)

        // 改修: データの整合性チェック
        const checkDataIntegrity = (data: any[]) => {
          for (let i = 1; i < data.length; i++) {
            if (data[i].time < data[i-1].time) {
              console.warn(`Data integrity issue: time at index ${i} is less than previous time`)
            }
          }
        }

        checkDataIntegrity(sortedData)

        setChartData(sortedData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [symbol, startDate, endDate, interval])

  return chartData
}
const useAiData = () => {
    const [aiData, setAiData] = useState<{
      pandl: number | null
      entry_type: string | null
      entry_price: number | null
    } | null>(null)
    const [isLoadingAiData, setIsLoadingAiData] = useState(false)

    const fetchAiData = useCallback(async (spotTime: string, symbol: string, interval: string) => {
      setIsLoadingAiData(true)
      try {
        console.log(`Fetching AI data with parameters: spotTime=${spotTime}, symbol=${symbol}, interval=${interval}`)
        const url = `${API_URL}/api/v1/rolling_ai_data/around-spot-time/?spot_time=${encodeURIComponent(spotTime)}&nstep=0&symbol=${symbol}&interval=${interval}`
        const response = await fetch(url)
        if (!response.ok) {
          const errorText = await response.text()
          console.error(`API request failed with status ${response.status}: ${errorText}`)
          throw new Error(`API request failed with status ${response.status}: ${errorText}`)
        }
        const data = await response.json()
        if (data.length > 0) {
          const aiDataPoint = data[0]
          setAiData({
            pandl: aiDataPoint.pandl,
            entry_type: aiDataPoint.entry_type,
            entry_price: aiDataPoint.entry_price,
          })
        } else {
          setAiData(null)
        }
      } catch (error) {
        console.error('Error fetching AI data:', error)
        setAiData(null)
      } finally {
        setIsLoadingAiData(false)
      }
    }, [])

    return { aiData, isLoadingAiData, fetchAiData }
  }
// Components
const ChartHeader: React.FC<{
  symbol: string
  setSymbol: (value: string) => void
  startDate: string
  setStartDate: (value: string) => void
  endDate: string
  setEndDate: (value: string) => void
  interval: string
  setInterval: (value: string) => void
}> = ({ symbol, setSymbol, startDate, setStartDate, endDate, setEndDate, interval, setInterval }) => (
  <header className="flex items-center justify-between p-2 border-b">
    <div className="flex items-center space-x-2">
      <Input
        className="w-40"
        placeholder="BTCUSDT"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
      />
      <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <Input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <Select value={interval} onValueChange={setInterval}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select interval" />
        </SelectTrigger>
        <SelectContent>
          {INTERVALS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </header>
)

const HoveredDataDisplay: React.FC<{
  hoveredData: any
  aiData: any
  isLoadingAiData: boolean
}> = ({ hoveredData, aiData, isLoadingAiData }) => (
  <div className="absolute top-4 left-4 bg-white p-2 rounded shadow z-10 text-sm">
    <p>
      O: {hoveredData.open.toFixed(2)} |
      C: {hoveredData.close.toFixed(2)} |
      L: {hoveredData.low.toFixed(2)} |
      H: {hoveredData.high.toFixed(2)}
    </p>
    <p>
      Upper BB: {hoveredData.upper2.toFixed(2)} |
      Middle BB: {hoveredData.middle.toFixed(2)} |
      Lower BB: {hoveredData.lower2.toFixed(2)}
    </p>
    <p>
      MACD: {hoveredData.macd.toFixed(2)} |
      Signal: {hoveredData.macdsignal.toFixed(2)} |
      Histogram: {hoveredData.macdhist.toFixed(2)}
    </p>
    <p>Time: {hoveredData.time}</p>
    {isLoadingAiData ? (
      <p>Loading AI data...</p>
    ) : aiData ? (
      <>
        <p>P&L: <span className={`${aiData.pandl && aiData.pandl > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {aiData.pandl !== null && aiData.pandl !== undefined ? aiData.pandl.toFixed(2) : 'N/A'}
        </span></p>
        <p>Entry Type: <span className="text-green-600">{aiData.entry_type ?? 'N/A'}</span></p>
        <p>Entry Price: <span className="text-green-600">{aiData.entry_price !== null && aiData.entry_price !== undefined ? aiData.entry_price.toFixed(2) : 'N/A'}</span></p>
      </>
    ) : (
      <p>AI data not available</p>
    )}
  </div>
)

function ChartFooter({ setTimeFrame }: { setTimeFrame: (value: string) => void }) {
  const [currentTime, setCurrentTime] = useState<string | null>(null)

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toUTCString())
    }
    updateTime()
    const intervalId = setInterval(updateTime, 1000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <footer className="border-t p-2 flex justify-between items-center">
      <div className="flex space-x-2">
        {TIME_FRAMES.map(tf => (
          <Button key={tf} variant="ghost" size="sm" onClick={() => setTimeFrame(tf)}>{tf}</Button>
        ))}
      </div>
      <div>
        <span>{currentTime}</span>
      </div>
    </footer>
  )
}

// Main component
const CandleAndMacdChart: React.FC = () => {
  const candleChartRef = useRef<HTMLDivElement | null>(null)
  const macdChartRef = useRef<HTMLDivElement | null>(null)
  const [timeFrame, setTimeFrame] = useState('1時間')
  const [symbol, setSymbol] = useState('BTCUSDT')
  const [startDate, setStartDate] = useState('2024-06-01')
  const [endDate, setEndDate] = useState('2024-06-15')
  const [interval, setInterval] = useState('60')
  const [hoveredData, setHoveredData] = useState<any>(null)

  const chartData = useChartData(symbol, startDate, endDate, interval)
  const { aiData, isLoadingAiData, fetchAiData } = useAiData()

  useEffect(() => {
    if (!chartData.length || !candleChartRef.current || !macdChartRef.current) return

    const candleChart: IChartApi = createChart(candleChartRef.current, {
      width: candleChartRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: 'solid' as ColorType, color: CHART_COLORS.background },
        textColor: CHART_COLORS.textColor,
      },
      grid: {
        vertLines: { color: CHART_COLORS.gridColor },
        horzLines: { color: CHART_COLORS.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: CHART_COLORS.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const macdChart: IChartApi = createChart(macdChartRef.current, {
      width: macdChartRef.current.clientWidth,
      height: 200,
      layout: {
        background: { type: 'solid' as ColorType, color: CHART_COLORS.background },
        textColor: CHART_COLORS.textColor,
      },
      grid: {
        vertLines: { color: CHART_COLORS.gridColor },
        horzLines: { color: CHART_COLORS.gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      timeScale: {
        borderColor: CHART_COLORS.borderColor,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const candleSeries = candleChart.addCandlestickSeries({
      upColor: CHART_COLORS.upColor,
      downColor: CHART_COLORS.downColor,
      borderDownColor: CHART_COLORS.downColor,
      borderUpColor: CHART_COLORS.upColor,
      wickDownColor: CHART_COLORS.downColor,
      wickUpColor: CHART_COLORS.upColor,
    })

    candleSeries.setData(chartData)

    const upper2Series = candleChart.addLineSeries({ color: 'rgba(0, 0, 255, 1)', lineWidth: 1 })
    upper2Series.setData(chartData.map(d => ({ time: d.time, value: d.upper2 })))

    const middleSeries = candleChart.addLineSeries({ color: 'rgba(0, 0, 255, 1)', lineWidth: 1 })
    middleSeries.setData(chartData.map(d => ({ time: d.time, value: d.middle })))

    const lower2Series = candleChart.addLineSeries({ color: 'rgba(0, 0, 255, 1)', lineWidth: 1 })
    lower2Series.setData(chartData.map(d => ({ time: d.time, value: d.lower2 })))

    const macdLineSeries = macdChart.addLineSeries({ color: CHART_COLORS.macdColor, lineWidth: 2 })
    macdLineSeries.setData(chartData.map(d => ({ time: d.time, value: d.macd })))

    const signalLineSeries = macdChart.addLineSeries({ color: CHART_COLORS.signalColor, lineWidth: 2 })
    signalLineSeries.setData(chartData.map(d => ({ time: d.time, value: d.macdsignal })))

    const histogramSeries = macdChart.addHistogramSeries({
      color: CHART_COLORS.upColor,
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    })
    histogramSeries.setData(chartData.map(d => ({
      time: d.time,
      value: d.macdhist,
      color: d.macdhist >= 0 ? CHART_COLORS.upColor : CHART_COLORS.downColor
    })))

    const handleCrosshairMove = (param: any) => {
      if (param.time) {
        const dataPoint = chartData.find(d => d.time === (param.time as number))
        if (dataPoint) {
          const date = new Date(dataPoint.time * 1000)
          const spotTime = date.toISOString().slice(0, 19).replace('T', ' ')
          fetchAiData(spotTime, symbol, interval)
          setHoveredData({
            ...dataPoint,
            time: spotTime
          })
        }
      } else {
        setHoveredData(null)
      }
    }

    candleChart.subscribeCrosshairMove(handleCrosshairMove)
    macdChart.subscribeCrosshairMove(handleCrosshairMove)

    candleChart.timeScale().subscribeVisibleTimeRangeChange(() => {
      const candleTimeScale = candleChart.timeScale()
      const macdTimeScale = macdChart.timeScale()
      macdTimeScale.applyOptions({
        rightOffset: candleTimeScale.options().rightOffset,
      })
      const visibleRange = candleTimeScale.getVisibleRange()
      if (visibleRange) {
        macdTimeScale.setVisibleRange(visibleRange)
      }
    })

    macdChart.timeScale().subscribeVisibleTimeRangeChange(() => {
      const candleTimeScale = candleChart.timeScale()
      const macdTimeScale = macdChart.timeScale()
      candleTimeScale.applyOptions({
        rightOffset: macdTimeScale.options().rightOffset,
      })
      const visibleRange = macdTimeScale.getVisibleRange()
      if (visibleRange) {
        candleTimeScale.setVisibleRange(visibleRange)
      }
    })

    const handleResize = () => {
      candleChart.applyOptions({ width: candleChartRef.current?.clientWidth || 0 })
      macdChart.applyOptions({ width: macdChartRef.current?.clientWidth || 0 })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      candleChart.remove()
      macdChart.remove()
    }
  }, [chartData, symbol, interval, fetchAiData])

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <ChartHeader
          symbol={symbol}
          setSymbol={setSymbol}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          interval={interval}
          setInterval={setInterval}
        />

        <main className="flex-1 relative">
          <div ref={candleChartRef} className="w-full h-2/3" />
          <div ref={macdChartRef} className="w-full h-1/3" />
          {hoveredData && (
            <HoveredDataDisplay
              hoveredData={hoveredData}
              aiData={aiData}
              isLoadingAiData={isLoadingAiData}
            />
          )}
        </main>

        <ChartFooter setTimeFrame={setTimeFrame} />
      </div>
    </DashboardLayout>
  )
}

export default CandleAndMacdChart
