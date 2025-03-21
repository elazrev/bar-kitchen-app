import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChartBar, FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaClock } from 'react-icons/fa';
import { getShortages, getTaskReports } from '../../services/api';

const ReportsContainer = styled.div`
  padding: 2rem 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 1.8rem;
  margin: 0;
  margin-right: 0.75rem;
`;

const Icon = styled.div`
  font-size: 2rem;
  color: var(--primary-color);
`;

const Card = styled.div`
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
`;

const CardHeader = styled.div`
  border-bottom: 1px solid var(--light-gray);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;


const CardTitle = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-left: 0.75rem;
  }
`;

const DateRangeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
`;

const DateInput = styled.input`
  padding: 0.5rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  
  @media (max-width: 768px) {
    width: 100%;
    padding: 0.7rem;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: right;
  padding: 0.75rem;
  background-color: #f9f9f9;
  border-bottom: 1px solid var(--light-gray);
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid var(--light-gray);
`;

const SectionTitle = styled.h3`
  margin: 1.5rem 0 1rem 0;
  display: flex;
  align-items: center;
  
  svg {
    margin-left: 0.5rem;
    color: var(--primary-color);
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background-color: ${props => 
    props.status === 'completed' ? 'var(--success-color)' : 
    props.status === 'pending' ? 'var(--warning-color)' : 
    props.status === 'resolved' ? 'var(--success-color)' : 
    props.status === 'unresolved' ? 'var(--error-color)' : 
    'var(--primary-color)'
  };
`;

const DeletedItemText = styled.span`
  text-decoration: line-through;
  color: #999;
`;

const DeletedDate = styled.span`
  font-size: 0.8rem;
  margin-right: 0.5rem;
  color: #999;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const SummaryCard = styled.div`
  background-color: ${props => props.bgColor || '#f9f9f9'};
  border-radius: var(--border-radius);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-bottom: 1rem;
  }
`;

const SummaryIcon = styled.div`
  font-size: 2rem;
  color: ${props => props.color || 'var(--primary-color)'};
  margin-left: 1rem;
`;

const SummaryContent = styled.div`
  flex: 1;
`;

const SummaryTitle = styled.h4`
  font-size: 1.2rem;
  margin: 0 0 0.5rem 0;
`;

const SummaryValue = styled.div`
  font-size: 2rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const ReportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;


const TaskReportDetails = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: var(--border-radius);
  border-right: 4px solid var(--primary-color);
  
  @media (max-width: 768px) {
    padding: 0.8rem;
    font-size: 0.95rem;
  }
`;

const TaskItem = styled.div`
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--light-gray);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  margin-bottom: 1.5rem;
  border-radius: var(--border-radius);
`;



const Reports = () => {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });
  
  const [taskReports, setTaskReports] = useState([]);
  const [shortageData, setShortageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        setLoading(true);
        
        // נסה לקבל דוחות משימות מהשרת
        let reportsData = [];
        try {
          reportsData = await getTaskReports(startDate, endDate);
        } catch (err) {
          console.warn('לא נמצאו דוחות משימות', err);
          // אם אין דוחות, נשתמש במערך ריק
          reportsData = [];
        }
        
        setTaskReports(reportsData);
        
        // קבלת נתוני חוסרים
        const shortagesResult = await getShortages();
        
        // עיבוד הנתונים עבור הדוח
        const processedShortages = shortagesResult.map(shortage => ({
          id: shortage.id,
          itemName: shortage.name,
          reportedAt: new Date(shortage.createdAt),
          quantity: shortage.quantity,
          status: shortage.resolved ? 'resolved' : 'unresolved',
          recentlyDeleted: shortage.recentlyDeleted,
          deletedAt: shortage.deletedAt
        }));
        
        setShortageData(processedShortages);
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת נתוני דוחות:', err);
        setLoading(false);
      }
    };
    
    fetchReportsData();
  }, [startDate, endDate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('he-IL', options);
  };
  
  const formatDateTime = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    return new Date(dateString).toLocaleDateString('he-IL', options);
  };
  
  // מיון הדוחות לפי סוגים
  const openingReports = taskReports.filter(report => report.type === 'opening');
  const closingReports = taskReports.filter(report => report.type === 'closing');
  
  // חישוב סיכומים
  const totalOpeningTasks = openingReports.reduce((sum, report) => sum + (report.completedTasks || 0), 0);
  const totalClosingTasks = closingReports.reduce((sum, report) => sum + (report.completedTasks || 0), 0);
  const activeShortages = shortageData.filter(item => item.status === 'unresolved' && !item.recentlyDeleted).length;
  const resolvedShortages = shortageData.filter(item => item.status === 'resolved' || item.recentlyDeleted).length;

  // פונקציה לבחירת דוח לפרטים נוספים
  const toggleReportDetails = (report) => {
    if (selectedReport && selectedReport.id === report.id) {
      setSelectedReport(null);
    } else {
      setSelectedReport(report);
    }
  };

  return (
    <ReportsContainer>
      <Header>
        <Icon>
          <FaChartBar />
        </Icon>
        <Title>דוחות</Title>
      </Header>
      
      <Card>
        <CardHeader>
          <CardTitle>
            <FaCalendarAlt />
            טווח תאריכים
          </CardTitle>
          <DateRangeSelector>
            <div>
              <label htmlFor="startDate">מתאריך: </label>
              <DateInput
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endDate">עד תאריך: </label>
              <DateInput
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </DateRangeSelector>
        </CardHeader>
        
        {loading ? (
          <EmptyState>טוען נתונים...</EmptyState>
        ) : (
          <>
            <ReportGrid>
              <SummaryCard bgColor="#e3f2fd">
                <SummaryIcon color="#1976d2">
                  <FaCheckCircle />
                </SummaryIcon>
                <SummaryContent>
                  <SummaryTitle>השלמת משימות פתיחה</SummaryTitle>
                  <SummaryValue>{totalOpeningTasks}</SummaryValue>
                </SummaryContent>
              </SummaryCard>
              
              <SummaryCard bgColor="#e8f5e9">
                <SummaryIcon color="#388e3c">
                  <FaCheckCircle />
                </SummaryIcon>
                <SummaryContent>
                  <SummaryTitle>השלמת משימות סגירה</SummaryTitle>
                  <SummaryValue>{totalClosingTasks}</SummaryValue>
                </SummaryContent>
              </SummaryCard>
              
              <SummaryCard bgColor="#fff3e0">
                <SummaryIcon color="#f57c00">
                  <FaExclamationTriangle />
                </SummaryIcon>
                <SummaryContent>
                  <SummaryTitle>חוסרים פעילים</SummaryTitle>
                  <SummaryValue>{activeShortages}</SummaryValue>
                </SummaryContent>
              </SummaryCard>
              
              <SummaryCard bgColor="#ffebee">
                <SummaryIcon color="#d32f2f">
                  <FaExclamationTriangle />
                </SummaryIcon>
                <SummaryContent>
                  <SummaryTitle>חוסרים שטופלו</SummaryTitle>
                  <SummaryValue>{resolvedShortages}</SummaryValue>
                </SummaryContent>
              </SummaryCard>
            </ReportGrid>
            
            <SectionTitle>
              <FaCheckCircle />
              דוח ביצוע משימות פתיחה
            </SectionTitle>
            
            {openingReports.length > 0 ? (
              <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th>תאריך</Th>
                    <Th>מדווח</Th>
                    <Th>משימות שהושלמו</Th>
                    <Th>סה"כ משימות</Th>
                    <Th>אחוז השלמה</Th>
                    <Th>פרטים</Th>
                  </tr>
                </thead>
                <tbody>
                  {openingReports.map((report) => (
                    <>
                      <tr key={report.id} style={{cursor: 'pointer'}} onClick={() => toggleReportDetails(report)}>
                        <Td>{formatDateTime(report.date)}</Td>
                        <Td>{report.userName || 'לא ידוע'}</Td>
                        <Td>{report.completedTasks}</Td>
                        <Td>{report.totalTasks}</Td>
                        <Td>
                          <StatusBadge 
                            status={report.completedTasks === report.totalTasks ? 'completed' : 'pending'}
                          >
                            {report.completionRate || Math.round((report.completedTasks / report.totalTasks) * 100)}%
                          </StatusBadge>
                        </Td>
                        <Td>
                          <button className="btn btn-sm btn-secondary">
                            {selectedReport && selectedReport.id === report.id ? 'הסתר' : 'הצג'}
                          </button>
                        </Td>
                      </tr>
                      {selectedReport && selectedReport.id === report.id && (
                        <tr>
                          <Td colSpan="6">
                            <TaskReportDetails>
                              <h4>משימות שהושלמו:</h4>
                              {report.tasksList && report.tasksList.length > 0 ? (
                                report.tasksList.map((task, index) => (
                                  <TaskItem key={task.id || index}>
                                    <FaClock style={{ marginLeft: '0.5rem', color: 'var(--primary-color)' }} />
                                    {task.title}
                                  </TaskItem>
                                ))
                              ) : (
                                <p>אין פרטי משימות</p>
                              )}
                            </TaskReportDetails>
                          </Td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </Table>
              </TableContainer>
            ) : (
              <EmptyState>אין נתוני ביצוע משימות פתיחה בטווח התאריכים שנבחר.</EmptyState>
            )}
            
            <SectionTitle style={{ marginTop: '2rem' }}>
              <FaCheckCircle />
              דוח ביצוע משימות סגירה
            </SectionTitle>
            
            {closingReports.length > 0 ? (
              <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th>תאריך</Th>
                    <Th>מדווח</Th>
                    <Th>משימות שהושלמו</Th>
                    <Th>סה"כ משימות</Th>
                    <Th>אחוז השלמה</Th>
                    <Th>פרטים</Th>
                  </tr>
                </thead>
                <tbody>
                  {closingReports.map((report) => (
                    <>
                      <tr key={report.id} style={{cursor: 'pointer'}} onClick={() => toggleReportDetails(report)}>
                        <Td>{formatDateTime(report.date)}</Td>
                        <Td>{report.userName || 'לא ידוע'}</Td>
                        <Td>{report.completedTasks}</Td>
                        <Td>{report.totalTasks}</Td>
                        <Td>
                          <StatusBadge 
                            status={report.completedTasks === report.totalTasks ? 'completed' : 'pending'}
                          >
                            {report.completionRate || Math.round((report.completedTasks / report.totalTasks) * 100)}%
                          </StatusBadge>
                        </Td>
                        <Td>
                          <button className="btn btn-sm btn-secondary">
                            {selectedReport && selectedReport.id === report.id ? 'הסתר' : 'הצג'}
                          </button>
                        </Td>
                      </tr>
                      {selectedReport && selectedReport.id === report.id && (
                        <tr>
                          <Td colSpan="6">
                            <TaskReportDetails>
                              <h4>משימות שהושלמו:</h4>
                              {report.tasksList && report.tasksList.length > 0 ? (
                                report.tasksList.map((task, index) => (
                                  <TaskItem key={task.id || index}>
                                    <FaClock style={{ marginLeft: '0.5rem', color: 'var(--primary-color)' }} />
                                    {task.title}
                                  </TaskItem>
                                ))
                              ) : (
                                <p>אין פרטי משימות</p>
                              )}
                            </TaskReportDetails>
                          </Td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </Table>
              </TableContainer>
            ) : (
              <EmptyState>אין נתוני ביצוע משימות סגירה בטווח התאריכים שנבחר.</EmptyState>
            )}
          </>
        )}
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>דוח חוסרים</CardTitle>
        </CardHeader>
        
        {loading ? (
          <EmptyState>טוען נתונים...</EmptyState>
        ) : shortageData.length > 0 ? (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>פריט</Th>
                <Th>כמות חסרה</Th>
                <Th>תאריך דיווח</Th>
                <Th>סטטוס</Th>
              </tr>
            </thead>
            <tbody>
              {shortageData.map((item) => (
                <tr key={item.id}>
                  <Td>
                    {item.recentlyDeleted ? (
                      <>
                        <DeletedItemText>{item.itemName}</DeletedItemText>
                        <DeletedDate>
                          (טופל ב-{formatDate(item.deletedAt)})
                        </DeletedDate>
                      </>
                    ) : (
                      item.itemName
                    )}
                  </Td>
                  <Td>{item.quantity}</Td>
                  <Td>{formatDate(item.reportedAt)}</Td>
                  <Td>
                    <StatusBadge status={item.recentlyDeleted ? 'resolved' : item.status}>
                      {item.recentlyDeleted ? 'טופל' : 
                       item.status === 'resolved' ? 'טופל' : 'לא טופל'}
                    </StatusBadge>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
          </TableContainer>
        ) : (
          <EmptyState>אין נתוני חוסרים בטווח התאריכים שנבחר.</EmptyState>
        )}
      </Card>
    </ReportsContainer>
  );
};

export default Reports;