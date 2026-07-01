import './App.css'

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const slDayList = ['06-22', '07-06', '09-07', '10-09', '11-30', '12-01']
const elDayList = ['09-28', '09-29', '09-30', '10-01', '11-16','11-17','11-18','11-19','11-20']
const wfhDayList = ['06-15', '06-16', '06-17', '06-18', '06-19', '11-09','11-10','11-11','11-12','11-13', '09-01','09-02','09-03','09-04', '08-31']
const nationalDayList = ['07-03', '08-15', '10-02', '12-25', '12-24', '11-26','11-27']

function formatDate(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function App() {
  const year = new Date().getFullYear()
  const slDays = new Set(slDayList.map((date) => `${year}-${date}`))
  const elDays = new Set(elDayList.map((date) => `${year}-${date}`))
  const wfhDays = new Set(wfhDayList.map((date) => `${year}-${date}`))
  const nationalDays = new Set(nationalDayList.map((date) => `${year}-${date}`))

  // Function to check if a day is a holiday (including weekends)
  const isHoliday = (dateStr: string) => {
    const date = new Date(dateStr)
    const weekday = date.getDay()
    const isWeekend = weekday === 0 || weekday === 6
    return isWeekend || slDays.has(dateStr) || elDays.has(dateStr) || wfhDays.has(dateStr) || nationalDays.has(dateStr)
  }

  // Find continuous holiday periods
  const findContinuousHolidays = () => {
    const periods: Array<{ start: Date; end: Date; days: number }> = []
    let currentStart: Date | null = null
    let currentCount = 0

    // Iterate through all days of the year
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dateStr = formatDate(year, month, day)

        if (isHoliday(dateStr)) {
          if (!currentStart) {
            currentStart = new Date(date)
          }
          currentCount++
        } else {
          if (currentStart && currentCount > 2) {
            periods.push({
              start: currentStart,
              end: new Date(year, month, day - 1),
              days: currentCount,
            })
          }
          currentStart = null
          currentCount = 0
        }
      }
    }

    // Check the last period if it extends to year end
    if (currentStart && currentCount > 2) {
      periods.push({
        start: currentStart,
        end: new Date(year, 11, 31),
        days: currentCount,
      })
    }

    return periods
  }

  const continuousPeriods = findContinuousHolidays()

  // Calculate statistics for June-December (months 5-11)
  const calculateStats = () => {
    let totalWeekends = 0
    let totalWFH = 0
    let totalSL = 0
    let totalEL = 0
    let totalNational = 0
    let totalDays = 0

    // Count from June (5) to December (11)
    for (let month = 7; month <= 11; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day++) {
        totalDays++
        const dateStr = formatDate(year, month, day)
        const weekday = new Date(year, month, day).getDay()
        const isWeekend = weekday === 0 || weekday === 6

        if (isWeekend) totalWeekends++
        if (wfhDays.has(dateStr)) totalWFH++
        if (slDays.has(dateStr)) totalSL++
        if (elDays.has(dateStr)) totalEL++
        if (nationalDays.has(dateStr)) totalNational++
      }
    }

    const totalLeaves = totalSL + totalEL + totalNational + totalWeekends
    const workingDays = totalDays - totalLeaves

    return { totalWeekends, totalWFH, totalSL, totalEL, totalNational, totalLeaves, totalDays, workingDays }
  }

  const stats = calculateStats()

  return (
    <main className="calendar-page">
      <header className="calendar-header">
        <div className="header-content">
          <h1>{year} Calendar</h1>
          {continuousPeriods.length > 0 && (
            <div className="continuous-holidays">
              <div className="holiday-title">📅 Continuous Holiday Periods (2+ days)</div>
              <div className="holiday-list">
                {continuousPeriods.map((period, idx) => (
                  <div key={idx} className="holiday-period">
                    {period.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
                    {period.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ({period.days} days)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="calendar-legend">
          <div className="legend-entry">
            <div className="legend-item weekend"></div>
            <span className="legend-label">Weekend</span>
          </div>
          <div className="legend-entry">
            <div className="legend-item sl"></div>
            <span className="legend-label">SL</span>
          </div>
          <div className="legend-entry">
            <div className="legend-item el"></div>
            <span className="legend-label">EL</span>
          </div>
          <div className="legend-entry">
            <div className="legend-item wfh"></div>
            <span className="legend-label">WFH</span>
          </div>
          <div className="legend-entry">
            <div className="legend-item national"></div>
            <span className="legend-label">National Holiday</span>
          </div>
        </div>
      </header>

      <div className="statistics-section">
        <div className="stat-card">
          <div className="stat-label">Working Days</div>
          <div className="stat-value">{stats.workingDays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Weekends</div>
          <div className="stat-value">{stats.totalWeekends}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">WFH</div>
          <div className="stat-value">{stats.totalWFH}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SL Days</div>
          <div className="stat-value">{stats.totalSL}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">EL Days</div>
          <div className="stat-value">{stats.totalEL}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">National Holidays</div>
          <div className="stat-value">{stats.totalNational}</div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-label">Total Leaves</div>
          <div className="stat-value">{stats.totalLeaves}</div>
        </div>
      </div>

      <div className="year-grid">
        {monthNames.slice(5).map((month, slicedIndex) => {
          const monthIndex = slicedIndex + 5
          const monthStart = new Date(year, monthIndex, 1).getDay()
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

          return (
            <section className="month-card" key={month}>
              <div className="month-title">{month}</div>
              <div className="day-labels">
                {dayNames.map((dayName) => (
                  <div key={dayName} className="day-label">
                    {dayName}
                  </div>
                ))}
              </div>
              <div className="date-grid">
                {Array.from({ length: monthStart }).map((_, index) => (
                  <div key={`blank-${monthIndex}-${index}`} className="date-cell empty" />
                ))}

                {Array.from({ length: daysInMonth }, (_, index) => {
                  const dayNumber = index + 1
                  const dateKey = formatDate(year, monthIndex, dayNumber)
                  const weekday = new Date(year, monthIndex, dayNumber).getDay()
                  const isWeekend = weekday === 0 || weekday === 6
                  const isSL = slDays.has(dateKey)
                  const isEL = elDays.has(dateKey)
                  const isWFH = wfhDays.has(dateKey)
                  const isNational = nationalDays.has(dateKey)
                  const classNames = [
                    'date-cell',
                    isWeekend ? 'weekend' : '',
                    isSL ? 'sl' : '',
                    isEL ? 'el' : '',
                    isWFH ? 'wfh' : '',
                    isNational ? 'national' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')

                  return (
                    <div key={dateKey} className={classNames}>
                      {dayNumber}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </main>
  )
}

export default App
