'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createChart, ColorType, IChartApi, ISeriesApi, HistogramData, Time } from 'lightweight-charts'
import DashboardLayout from './DashboardLayout'

const periodOptions = ['7d', '30d', '90d', '180d', 'all']
const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface TransactionData {
  pl: number
  entrytime: string
  pred: number
  tradetype: string
  direction: string
  losscut: boolean
}

interface SelectedDataPoint {
  pred: number
  tradetype: string
  direction: string
  losscut: boolean
}

export function TransactionLogHistogram() {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [totalPositivePL, setTotalPositivePL] = useState(0)
  const [totalNegativePL, setTotalNegativePL] = useState(0)
  const [chartData, setChartData] = useState<TransactionData[]>([])
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Histogram"> | null>(null)
  const [selectedDataPoint, setSelectedDataPoint] = useState<SelectedDataPoint | null>(null)

  useEffect(() => {
    fetchData()
  }, [selectedPeriod])

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: '#ffffff' },
          textColor: '#333',
        },
        grid: {
          vertLines: { color: '#f0f0f0' },
          horzLines: { color: '#f0f0f0' },
        },
        rightPriceScale: {
          borderColor: '#dfdfdf',
          visible: true,
        },
        timeScale: {
          borderColor: '#dfdfdf',
          timeVisible: true,
          secondsVisible: false,
        },
      })

      const histogramSeries = chart.addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
      })

      chartRef.current = chart
      seriesRef.current = histogramSeries

      chart.subscribeCrosshairMove((param) => {
        if (param.time) {
          const pointData = chartData.find(item =>
            Date.parse(item.entrytime+'Z') / 1000 === (param.time as number)
          )
          if (pointData) {
            setSelectedDataPoint({
              pred: pointData.pred,
              tradetype: pointData.tradetype,
              direction: pointData.direction,
              losscut: pointData.losscut
            })
          } else {
            setSelectedDataPoint(null)
          }
        } else {
          setSelectedDataPoint(null)
        }
      })

      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current!.clientWidth })
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
        chart.remove()
      }
    }
  }, [chartData]) // chartDataを依存配列に追加

  useEffect(() => {
    if (chartData.length > 0 && seriesRef.current && chartRef.current) {
      const data = chartData.map(item => ({
        time: Date.parse(item.entrytime+'Z') / 1000 as unknown as Time,
        value: item.pl,
        color: item.pl >= 0 ? 'rgba(0, 150, 136, 0.8)' : 'rgba(255, 82, 82, 0.8)',
      }))

      seriesRef.current.setData(data)
      chartRef.current.timeScale().fitContent()
    }
  }, [chartData])



  const fetchData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/transaction_data/latest/period/${selectedPeriod}?symbol=BTCUSDT&interval=60`)

      const data: TransactionData[] = await response.json()
      setChartData(data)

      // Calculate total positive and negative PL
      const { positivePL, negativePL } = data.reduce((acc, item) => {
        if (item.pl >= 0) {
          acc.positivePL += item.pl
        } else {
          acc.negativePL += Math.abs(item.pl)
        }
        return acc
      }, { positivePL: 0, negativePL: 0 })

      setTotalPositivePL(positivePL)
      setTotalNegativePL(negativePL)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const totalPL = totalPositivePL - totalNegativePL
  const maxPL = Math.max(totalPositivePL, totalNegativePL)
  const positiveWidth = (totalPositivePL / maxPL) * 50
  const negativeWidth = (totalNegativePL / maxPL) * 50

  return (
    <DashboardLayout>
      <div className="p-4 bg-white rounded-lg shadow-md relative">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Transaction Log PL Histogram</h1>

        {selectedDataPoint && (
          <div className="absolute top-4 left-4 bg-white p-2 rounded shadow z-10 text-sm">
            <h2 className="text-lg font-semibold mb-2">Selected Data Point</h2>
            <p><strong>Pred:</strong> {selectedDataPoint.pred.toFixed(2)}</p>
            <p><strong>Trade Type:</strong> {selectedDataPoint.tradetype}</p>
            <p><strong>Direction:</strong> {selectedDataPoint.direction}</p>
            <p><strong>Loss Cut:</strong> {selectedDataPoint.losscut ? 'Yes' : 'No'}</p>
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {periodOptions.map(option => (
            <button
              key={option}
              onClick={() => setSelectedPeriod(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPeriod === option
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="font-semibold text-green-600">
              {totalPositivePL.toFixed(2)}
            </span>
            <span className="font-semibold text-red-600">
              {totalNegativePL.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 flex items-center">
            <div
              className="bg-green-600 h-2.5 rounded-l-full"
              style={{ width: `${positiveWidth}%` }}
            ></div>
            <div className="w-0 h-full border-r border-gray-400"></div>
            <div
              className="bg-red-600 h-2.5 rounded-r-full"
              style={{ width: `${negativeWidth}%` }}
            ></div>
          </div>
          <div className="text-center mt-2">
            <span className="font-semibold">
              Total PL: {totalPL.toFixed(2)}
            </span>
          </div>
        </div>
        <div ref={chartContainerRef} className="w-full h-[400px]" />
        <p className="text-sm text-gray-600 mt-2">
          Green bars represent positive PL, red bars represent negative PL.
        </p>
      </div>
    </DashboardLayout>
  )
}
