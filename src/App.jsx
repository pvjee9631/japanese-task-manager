import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState('中')
  const [category, setCategory] = useState('日々')
  const [dueDate, setDueDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('10:00')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentView, setCurrentView] = useState('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  // LocalStorageからデータを読み込む
  useEffect(() => {
    const savedData = localStorage.getItem('japaneseTaskManager')
    if (savedData) {
      setTasks(JSON.parse(savedData))
    }
  }, [])

  // データを保存する
  useEffect(() => {
    localStorage.setItem('japaneseTaskManager', JSON.stringify(tasks))
  }, [tasks])

  // 所要時間を計算
  const calculateDuration = (start, end) => {
    const startMinutes = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1])
    const endMinutes = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1])
    const duration = endMinutes - startMinutes
    return duration > 0 ? duration : 0
  }

  // 新しいタスクを追加
  const addTask = () => {
    if (newTask.trim() === '') return

    const newTaskObject = {
      id: Date.now(),
      task: newTask,
      category: category,
      status: '未完了',
      priority: priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      progress: 0,
      startTime: startTime,
      endTime: endTime,
      duration: calculateDuration(startTime, endTime)
    }

    setTasks([...tasks, newTaskObject])
    setNewTask('')
    setDueDate('')
    setStartTime('09:00')
    setEndTime('10:00')
  }

  // タスクの状態を変更
  const changeTaskStatus = (id, newStatus) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, status: newStatus } : task
    ))
  }

  // タスクを削除
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  // 進捗率を更新
  const updateProgress = (id, newProgress) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, progress: newProgress } : task
    ))
  }

  // 日付ナビゲーション
  const navigateDate = (direction) => {
    const newDate = new Date(currentDate)
    if (currentView === 'month') {
      newDate.setMonth(newDate.getMonth() + direction)
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + (direction * 7))
    } else if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + direction)
    }
    setCurrentDate(newDate)
  }

  // フィルターされたタスクリスト
  const filteredTasks = tasks.filter(task =>
    task.task.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 進捗率を計算
  const progressRate = tasks.length > 0
    ? Math.round((tasks.filter(task => task.status === '完了').length / tasks.length) * 100)
    : 0

  // 月の日付を生成
  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    const days = []
    
    // 前月の日付
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false
      })
    }
    
    // 今月の日付
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      })
    }
    
    // 来月の日付
    const totalCells = 42
    const remainingDays = totalCells - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      })
    }
    
    return days
  }

  // 週の日付を生成
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }
    return weekDays
  }

  // 日付フォーマット
  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  // 日本語の曜日
  const getJapaneseDay = (date) => {
    const days = ['日', '月', '火', '水', '木', '金', '土']
    return days[date.getDay()]
  }

  // 日本語の曜日（フル）
  const getJapaneseDayFull = (date) => {
    const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日']
    return days[date.getDay()]
  }

  // ビューコンポーネント
  const renderView = () => {
    switch (currentView) {
      case 'month':
        return <MonthView 
          tasks={filteredTasks} 
          currentDate={currentDate} 
          onTaskUpdate={changeTaskStatus}
          onTaskDelete={deleteTask}
          formatDate={formatDate}
          getMonthDays={getMonthDays}
          getJapaneseDay={getJapaneseDay}
          navigateDate={navigateDate}
        />
      case 'week':
        return <WeekView 
          tasks={filteredTasks} 
          currentDate={currentDate}
          onTaskUpdate={changeTaskStatus}
          onTaskDelete={deleteTask}
          formatDate={formatDate}
          getWeekDays={getWeekDays}
          getJapaneseDayFull={getJapaneseDayFull}
          navigateDate={navigateDate}
        />
      case 'day':
        return <DayView 
          tasks={filteredTasks} 
          currentDate={currentDate}
          onTaskUpdate={changeTaskStatus}
          onTaskDelete={deleteTask}
          formatDate={formatDate}
          getJapaneseDay={getJapaneseDay}
          navigateDate={navigateDate}
        />
      default:
        return <ListView 
          tasks={filteredTasks}
          onTaskUpdate={changeTaskStatus}
          onTaskDelete={deleteTask}
          onProgressUpdate={updateProgress}
        />
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>📅 日本語カレンダータスク管理</h1>
        <p>カレンダーでタスクを視覚的に管理</p>
      </header>

      <div className="container">
        {/* ビュー選択 */}
        <div className="view-selector">
          <button 
            className={currentView === 'month' ? 'active' : ''}
            onClick={() => setCurrentView('month')}
          >
            🗓️ 月表示
          </button>
          <button 
            className={currentView === 'week' ? 'active' : ''}
            onClick={() => setCurrentView('week')}
          >
            📅 週表示
          </button>
          <button 
            className={currentView === 'day' ? 'active' : ''}
            onClick={() => setCurrentView('day')}
          >
            📆 日表示
          </button>
          <button 
            className={currentView === 'list' ? 'active' : ''}
            onClick={() => setCurrentView('list')}
          >
            📝 リスト表示
          </button>
        </div>

        {/* タスク追加フォーム */}
        <div className="task-form">
          <h3>➕ 新しいタスクを追加</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="タスクを入力..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
          </div>
          
          <div className="form-row">
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="日々">日々</option>
              <option value="週間">週間</option>
              <option value="月間">月間</option>
              <option value="年間">年間</option>
            </select>

            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="低">優先度: 低</option>
              <option value="中">優先度: 中</option>
              <option value="高">優先度: 高</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* 時間入力セクション */}
          <div className="form-row">
            <div className="time-input-group">
              <label>開始時間:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            
            <div className="time-input-group">
              <label>終了時間:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            
            <div className="duration-display">
              <label>所要時間:</label>
              <span>{calculateDuration(startTime, endTime)} 分</span>
            </div>
          </div>

          <button onClick={addTask} className="add-button">
            タスクを追加
          </button>
        </div>

        {/* 検索と統計 */}
        <div className="search-stats">
          <input
            type="text"
            placeholder="🔍 タスクを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <div className="stats">
            <span>合計: {tasks.length} タスク</span>
            <span>進捗: {progressRate}%</span>
          </div>
        </div>

        {/* メインビュー */}
        {renderView()}
      </div>
    </div>
  )
}

// 月表示コンポーネント
const MonthView = ({ tasks, currentDate, onTaskUpdate, onTaskDelete, formatDate, getMonthDays, getJapaneseDay, navigateDate }) => {
  const monthDays = getMonthDays()
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

  return (
    <div className="month-view">
      <div className="calendar-header">
        <button onClick={() => navigateDate(-1)}>←</button>
        <h3>{currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}</h3>
        <button onClick={() => navigateDate(1)}>→</button>
      </div>
      
      <div className="week-days-header">
        {['日', '月', '火', '水', '木', '金', '土'].map(day => (
          <div key={day} className="week-day-header">{day}</div>
        ))}
      </div>
      
      <div className="month-days">
        {monthDays.map((day, index) => {
          const dayTasks = tasks.filter(task => 
            task.dueDate === formatDate(day.date)
          )
          const isToday = formatDate(new Date()) === formatDate(day.date)
          
          return (
            <div 
              key={index} 
              className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''}`}
            >
              <div className="day-number">{day.date.getDate()}</div>
              <div className="day-tasks">
                {dayTasks.slice(0, 3).map(task => (
                  <div 
                    key={task.id} 
                    className={`calendar-task ${task.priority} ${task.status === '完了' ? 'completed' : ''}`}
                    title={`${task.task} (${task.startTime}-${task.endTime})`}
                  >
                    {task.task}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="more-tasks">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 週表示コンポーネント
const WeekView = ({ tasks, currentDate, onTaskUpdate, onTaskDelete, formatDate, getWeekDays, getJapaneseDayFull, navigateDate }) => {
  const weekDays = getWeekDays()

  return (
    <div className="week-view">
      <div className="calendar-header">
        <button onClick={() => navigateDate(-1)}>←</button>
        <h3>{currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月 第{Math.ceil(currentDate.getDate() / 7)}週</h3>
        <button onClick={() => navigateDate(1)}>→</button>
      </div>
      
      <div className="week-days-container">
        {weekDays.map((day, index) => {
          const dayTasks = tasks.filter(task => 
            task.dueDate === formatDate(day)
          )
          const isToday = formatDate(new Date()) === formatDate(day)
          
          return (
            <div key={index} className={`week-day ${isToday ? 'today' : ''}`}>
              <div className="day-header">
                <div className="day-name">{getJapaneseDayFull(day)}</div>
                <div className="day-date">{day.getMonth() + 1}/{day.getDate()}</div>
              </div>
              
              <div className="day-tasks">
                {dayTasks.map(task => (
                  <div key={task.id} className="week-task">
                    <input
                      type="checkbox"
                      checked={task.status === '完了'}
                      onChange={(e) => onTaskUpdate(task.id, e.target.checked ? '完了' : '未完了')}
                    />
                    <div className="task-info">
                      <span className={`task-text ${task.status === '完了' ? 'completed' : ''}`}>
                        {task.task}
                      </span>
                      <div className="task-time-small">
                        {task.startTime} - {task.endTime} ({task.duration}分)
                      </div>
                    </div>
                    <span className={`priority-dot ${task.priority}`}></span>
                    <button 
                      onClick={() => onTaskDelete(task.id)}
                      className="delete-small"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {dayTasks.length === 0 && (
                  <div className="no-tasks-day">タスクなし</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 日表示コンポーネント
const DayView = ({ tasks, currentDate, onTaskUpdate, onTaskDelete, formatDate, getJapaneseDay, navigateDate }) => {
  const dayTasks = tasks.filter(task => 
    task.dueDate === formatDate(currentDate)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime))

  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 7) // 7時から20時まで

  return (
    <div className="day-view">
      <div className="calendar-header">
        <button onClick={() => navigateDate(-1)}>←</button>
        <h3>
          {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月 {currentDate.getDate()}日 
          ({getJapaneseDay(currentDate)})
        </h3>
        <button onClick={() => navigateDate(1)}>→</button>
      </div>
      
      <div className="day-timeline">
        {timeSlots.map(hour => {
          const hourTasks = dayTasks.filter(task => {
            const taskStartHour = parseInt(task.startTime.split(':')[0])
            return taskStartHour === hour
          })
          
          return (
            <div key={hour} className="time-slot">
              <div className="time-label">{hour.toString().padStart(2, '0')}:00</div>
              <div className="time-content">
                {hourTasks.map(task => (
                  <div key={task.id} className="timeline-task">
                    <div className="task-time">
                      {task.startTime} - {task.endTime}
                    </div>
                    <div className="task-main">
                      <input
                        type="checkbox"
                        checked={task.status === '完了'}
                        onChange={(e) => onTaskUpdate(task.id, e.target.checked ? '完了' : '未完了')}
                      />
                      <span className="task-title">{task.task}</span>
                    </div>
                    <div className="task-meta">
                      <span className={`priority-badge ${task.priority}`}>{task.priority}</span>
                      <span className="duration-badge">{task.duration}分</span>
                      <span className="progress-badge">{task.progress}%</span>
                      <button 
                        onClick={() => onTaskDelete(task.id)}
                        className="delete-small"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {hourTasks.length === 0 && (
                  <div className="no-task-hour"></div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// リスト表示コンポーネント
const ListView = ({ tasks, onTaskUpdate, onTaskDelete, onProgressUpdate }) => {
  return (
    <div className="list-view">
      <h3>✅ タスク一覧</h3>
      
      {tasks.length === 0 ? (
        <p className="no-tasks">タスクがありません</p>
      ) : (
        <div className="tasks-container">
          {['日々', '週間', '月間', '年間'].map(cat => {
            const categoryTasks = tasks.filter(task => task.category === cat)
            
            return categoryTasks.length > 0 && (
              <div key={cat} className="category-section">
                <h4 className="category-title">
                  {cat === '日々' ? '📅 日々のタスク' :
                   cat === '週間' ? '📊 週間計画' :
                   cat === '月間' ? '🎯 月間目標' : '🌟 年間目標'}
                </h4>
                
                {categoryTasks.map(task => (
                  <div key={task.id} className={`task-item ${task.status === '完了' ? 'completed' : ''} priority-${task.priority}`}>
                    <div className="task-content">
                      <input
                        type="checkbox"
                        checked={task.status === '完了'}
                        onChange={(e) => onTaskUpdate(task.id, e.target.checked ? '完了' : '未完了')}
                      />
                      <div className="task-info-full">
                        <span className="task-text">{task.task}</span>
                        <div className="task-time-full">
                          {task.dueDate} {task.startTime} - {task.endTime} ({task.duration}分)
                        </div>
                      </div>
                      
                      <div className="task-meta">
                        <span className={`priority-badge priority-${task.priority}`}>
                          {task.priority}
                        </span>
                        <div className="progress-control">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={task.progress}
                            onChange={(e) => onProgressUpdate(task.id, parseInt(e.target.value))}
                            className="progress-slider"
                          />
                          <span className="progress-text">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onTaskDelete(task.id)}
                      className="delete-button"
                      title="削除"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default App