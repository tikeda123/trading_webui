"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO } from 'date-fns'
import DashboardLayout from './DashboardLayout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// 既存のimport文の下に追加
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type LogEntry = {
  _id: string
  serial: number
  date: string
  message: string
  level: 'INFO' | 'WARNING' | 'ERROR'
}

export default function SystemMonitor() {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterLevel, setFilterLevel] = useState<LogEntry['level'] | 'ALL'>('ALL')
  const [autoScroll, setAutoScroll] = useState(true)
  const tableRef = useRef<HTMLDivElement>(null)

  const fetchLogEntries = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/trading_log/latest/nsteps/200`)
      if (!response.ok) {
        throw new Error('Failed to fetch log entries')
      }
      const data = await response.json()
      setLogEntries(data.reverse())
      setIsLoading(false)
    } catch (err) {
      setError('An error occurred while fetching log entries')
      console.error(err)
    }
  }, [])

  useEffect(() => {
    fetchLogEntries()
    const interval = setInterval(fetchLogEntries, 30000)
    return () => clearInterval(interval)
  }, [fetchLogEntries])

  useEffect(() => {
    if (autoScroll && tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight
    }
  }, [logEntries, autoScroll])

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'yyyy-MM-dd HH:mm:ss')
  }

  const getMessageColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'INFO':
        return 'text-green-600'
      case 'WARNING':
        return 'text-yellow-600'
      case 'ERROR':
        return 'text-red-600'
      default:
        return ''
    }
  }

  const filteredLogs = logEntries.filter(entry => filterLevel === 'ALL' || entry.level === filterLevel)

  if (isLoading) {
    return <div>Loading...</div>
  }

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
          <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value as LogEntry['level'] | 'ALL')}>
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
            <Switch
              id="auto-scroll"
              checked={autoScroll}
              onCheckedChange={setAutoScroll}
            />
            <Label htmlFor="auto-scroll">Auto-scroll</Label>
          </div>
        </div>
        <div ref={tableRef} className="flex-grow overflow-y-auto">
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
                  <TableCell className={`w-1/12 font-semibold ${getMessageColor(entry.level)}`}>{entry.level}</TableCell>
                  <TableCell className={`w-8/12 ${getMessageColor(entry.level)}`}>{entry.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </DashboardLayout>
  )
}
