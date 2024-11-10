"use client"

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO, subWeeks } from 'date-fns'
import DashboardLayout from './DashboardLayout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { Button } from "@/components/ui/button"

type LogEntry = {
  _id: string
  serial: number
  date: string
  message: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OfflineSystemMonitor() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'INFO' | 'WARNING' | 'ERROR'>('ALL')

  const defaultEndDate = new Date('2024-07-14')
  const defaultStartDate = subWeeks(defaultEndDate, 2)

  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate)
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate)

  const fetchLogEntries = async () => {
    if (!startDate || !endDate) return

    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/v1/trading_log/search/?start_datetime=${format(startDate, 'yyyy-MM-dd')}&end_datetime=${format(endDate, 'yyyy-MM-dd')}`)
      if (!response.ok) {
        throw new Error('Failed to fetch log entries')
      }
      const data = await response.json()
      setLogEntries(data)
      setIsLoading(false)
    } catch (err) {
      setError('An error occurred while fetching log entries')
      console.error(err)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogEntries()
  }, [startDate, endDate])

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'yyyy-MM-dd HH:mm:ss')
  }

  const getMessageColor = (message: string) => {
    if (message.includes('ERROR')) return 'text-red-600'
    if (message.includes('WARNING')) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getMessageLevel = (message: string): 'INFO' | 'WARNING' | 'ERROR' => {
    if (message.includes('ERROR')) return 'ERROR'
    if (message.includes('WARNING')) return 'WARNING'
    return 'INFO'
  }

  const filteredLogs = logEntries.filter(entry =>
    filterLevel === 'ALL' || getMessageLevel(entry.message) === filterLevel
  )

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <DashboardLayout>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Trade System Monitor</CardTitle>
      </CardHeader>
      <CardContent className="h-[calc(100vh-200px)] flex flex-col">
        <div className="mb-4 flex justify-between items-center">
          <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value as 'ALL' | 'INFO' | 'WARNING' | 'ERROR')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Levels</SelectItem>
              <SelectItem value="INFO">Info</SelectItem>
              <SelectItem value="WARNING">Warning</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              placeholderText="Start Date"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              placeholderText="End Date"
            />
            <Button onClick={fetchLogEntries}>Refresh</Button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/4">Date</TableHead>
                  <TableHead className="w-1/12">Level</TableHead>
                  <TableHead className="w-8/12">Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((entry) => (
                  <TableRow key={entry._id}>
                    <TableCell className="font-medium w-1/4 whitespace-nowrap">{formatDate(entry.date)}</TableCell>
                    <TableCell className={`w-1/12 font-semibold ${getMessageColor(entry.message)}`}>
                      {getMessageLevel(entry.message)}
                    </TableCell>
                    <TableCell className={`w-8/12 ${getMessageColor(entry.message)}`}>{entry.message}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </DashboardLayout>
  )
}
