// src/features/admin/tips/TipArchive.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChartBar, FaSearch, FaPrint, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { tipShiftAPI, tipEmployeeAPI } from '../../../services/api';

const ArchiveContainer = styled.div`
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

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid var(--light-gray);
  border-radius: var(--border-radius);
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Button = styled.button`
  background-color: ${props => 
    props.secondary ? 'var(--secondary-color)' : 
    props.success ? 'var(--success-color)' :
    'var(--primary-color)'
  };
  color: white;
  border: none;
  border-radius: var(--border-radius);
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-left: 0.5rem;
  }
  
  &:hover {
    background-color: ${props => 
      props.secondary ? '#4267a3' : 
      props.success ? '#3d8b40' :
      '#1e3a6a'
    };
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  text-align: right;
  padding: 1rem;
  background-color: #f9f9f9;
  border-bottom: 2px solid var(--light-gray);
  font-weight: 600;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid var(--light-gray);
`;

const TFoot = styled.tfoot`
  background-color: #f9f9f9;
  font-weight: 600;
`;

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ReportTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const TipArchive = () => {
  const [reportType, setReportType] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employees, setEmployees] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await tipEmployeeAPI.getAllEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees:', err);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    
    try {
      let data;
      
      switch (reportType) {
        case 'daily':
          const dayStart = new Date(selectedDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(selectedDate);
          dayEnd.setHours(23, 59, 59, 999);
          
          data = await tipShiftAPI.getShiftsByDateRange(dayStart, dayEnd);
          setReportData({ type: 'daily', data });
          break;
          
        case 'employee':
          if (!selectedEmployee || !startDate || !endDate) {
            toast.error('יש לבחור עובד ותקופת זמן');
            return;
          }
          
          data = await tipShiftAPI.getEmployeeShifts(
            selectedEmployee,
            new Date(startDate),
            new Date(endDate)
          );
          
          const employeeName = employees.find(e => e.id === selectedEmployee)?.name;
          setReportData({ type: 'employee', data, employeeName });
          break;
          
        case 'monthly':
          data = await tipShiftAPI.getMonthlyReport(selectedYear, selectedMonth);
          setReportData({ type: 'monthly', data });
          break;
      }
      
      toast.success('הדוח נוצר בהצלחה');
    } catch (err) {
      toast.error('שגיאה ביצירת הדוח');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : date.toDate();
    return d.toLocaleDateString('he-IL');
  };

  const getMonthName = (month) => {
    const months = [
      'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
      'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return months[month - 1];
  };

  const getReportTitle = () => {
    if (!reportData) return '';
    
    switch (reportData.type) {
      case 'daily':
        return `דוח יומי - ${formatDate(new Date(selectedDate))}`;
      case 'employee':
        return `דוח עובד - ${reportData.employeeName} (${formatDate(new Date(startDate))} - ${formatDate(new Date(endDate))})`;
      case 'monthly':
        return `דוח חודשי - ${getMonthName(selectedMonth)} ${selectedYear}`;
      default:
        return '';
    }
  };

  const generateTableHTML = () => {
    if (!reportData) return '';
    
    let tableHTML = '';
    
    if (reportData.type === 'monthly' && reportData.data.employeeSummary) {
      tableHTML = `
        <table>
          <thead>
            <tr>
              <th>שם עובד</th>
              <th>מס' משמרות</th>
              <th>סה"כ שעות</th>
              <th>סה"כ טיפים</th>
              <th>טיפ ממוצע לשעה</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.data.employeeSummary.map(emp => `
              <tr>
                <td>${emp.name}</td>
                <td>${emp.shiftsCount}</td>
                <td>${emp.totalHours}</td>
                <td>₪${emp.totalTips}</td>
                <td>₪${(emp.totalTips / emp.totalHours).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">סה"כ טיפים:</td>
              <td>₪${reportData.data.totalTips}</td>
              <td></td>
            </tr>
            <tr>
              <td colspan="3">יתרה שלא חולקה:</td>
              <td>₪${reportData.data.leftoverTotal}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      `;
    } else if (reportData.data) {
      const tableHeader = `
        <tr>
          <th>תאריך</th>
          ${reportData.type === 'daily' ? '<th>שם</th>' : ''}
          <th>שעות</th>
          <th>טיפים</th>
          <th>טיפ לשעה</th>
        </tr>
      `;
      
      let tableRows = '';
      
      reportData.data.forEach(shift => {
        if (reportData.type === 'employee') {
          const employeeData = shift.employees.find(e => e.employeeId === selectedEmployee);
          if (employeeData) {
            tableRows += `
              <tr>
                <td>${formatDate(shift.date)}</td>
                <td>${employeeData.hours}</td>
                <td>₪${employeeData.tipAmount}</td>
                <td>₪${(employeeData.tipAmount / employeeData.hours).toFixed(2)}</td>
              </tr>
            `;
          }
        } else {
          shift.employees.forEach(emp => {
            tableRows += `
              <tr>
                <td>${formatDate(shift.date)}</td>
                <td>${emp.name}</td>
                <td>${emp.hours}</td>
                <td>₪${emp.tipAmount}</td>
                <td>₪${(emp.tipAmount / emp.hours).toFixed(2)}</td>
              </tr>
            `;
          });
        }
      });
      
      let tableFooter = '';
      
      if (reportData.type === 'employee' && reportData.data.length > 0) {
        const totalHours = reportData.data.reduce((sum, shift) => {
          const emp = shift.employees.find(e => e.employeeId === selectedEmployee);
          return sum + (emp ? parseFloat(emp.hours) : 0);
        }, 0);
        
        const totalTips = reportData.data.reduce((sum, shift) => {
          const emp = shift.employees.find(e => e.employeeId === selectedEmployee);
          return sum + (emp ? emp.tipAmount : 0);
        }, 0);
        
        const avgTipPerHour = totalHours > 0 ? (totalTips / totalHours).toFixed(2) : '0.00';
        
        tableFooter = `
          <tfoot>
            <tr>
              <td>סה"כ</td>
              <td>${totalHours.toFixed(1)}</td>
              <td>₪${totalTips}</td>
              <td>₪${avgTipPerHour}</td>
            </tr>
          </tfoot>
        `;
      }
      
      tableHTML = `
        <table>
          <thead>
            ${tableHeader}
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="5" style="text-align: center; padding: 20px;">אין נתונים לתצוגה</td></tr>'}
          </tbody>
          ${tableFooter}
        </table>
      `;
    }
    
    return tableHTML;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    const printContent = `
      <!DOCTYPE html>
      <html lang="he" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>דוח טיפים</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: Arial, Hebrew, sans-serif;
            direction: rtl;
            padding: 0;
            margin: 0;
          }
          
          .print-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          
          h1 {
            text-align: center;
            margin-bottom: 10px;
            font-size: 24px;
          }
          
          .report-info {
            text-align: center;
            margin-bottom: 30px;
          }
          
          .report-info p {
            margin: 5px 0;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: right;
          }
          
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          tfoot {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          
          .footer {
            position: fixed;
            bottom: 20px;
            left: 0;
            right: 0;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          
          @media print {
            body {
              padding: 0;
              margin: 0;
            }
            
            .print-container {
              padding: 20px;
              margin: 0 auto;
            }
            
            .footer {
              position: fixed;
              bottom: 10px;
            }
            
            @page {
              size: A4;
              margin: 1cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-container">
          <h1>דוח טיפים</h1>
          <div class="report-info">
            <p><strong>${getReportTitle()}</strong></p>
            <p>תאריך הדפסה: ${new Date().toLocaleDateString('he-IL')}</p>
          </div>
          ${generateTableHTML()}
        </div>
        <div class="footer">
          <p>כל הזכויות שמורות © elaz.rev ${new Date().getFullYear()}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // המתן מעט להטענת התוכן לפני ההדפסה
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <ArchiveContainer>
      <Header>
        <Icon>
          <FaChartBar />
        </Icon>
        <Title>ארכיון טיפים ודוחות</Title>
      </Header>
      
      <Card>
        <h2>יצירת דוח</h2>
        
        <FormGroup>
          <Label>סוג דוח</Label>
          <Select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="daily">דוח יומי</option>
            <option value="employee">דוח עובד</option>
            <option value="monthly">דוח חודשי</option>
          </Select>
        </FormGroup>
        
        {reportType === 'daily' && (
          <FormGroup>
            <Label>תאריך</Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </FormGroup>
        )}
        
        {reportType === 'employee' && (
          <FormRow columns="1fr 1fr 1fr">
            <FormGroup>
              <Label>בחר עובד</Label>
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">בחר עובד</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>מתאריך</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormGroup>
            <FormGroup>
              <Label>עד תאריך</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </FormGroup>
          </FormRow>
        )}
        
        {reportType === 'monthly' && (
          <FormRow columns="1fr 1fr">
            <FormGroup>
              <Label>שנה</Label>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              >
                {[...Array(5)].map((_, i) => {
                  const year = new Date().getFullYear() - i;
                  return (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  );
                })}
              </Select>
            </FormGroup>
            <FormGroup>
              <Label>חודש</Label>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMonthName(i + 1)}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormRow>
        )}
        
        <Button onClick={generateReport} disabled={loading}>
          <FaSearch />
          {loading ? 'מייצר דוח...' : 'הצג דוח'}
        </Button>
      </Card>
      
      {reportData && (
        <Card>
          <ReportHeader>
            <ReportTitle>{getReportTitle()}</ReportTitle>
            <Button secondary onClick={handlePrint}>
              <FaPrint />
              הדפס
            </Button>
          </ReportHeader>
          
          {reportData.type === 'monthly' && reportData.data.employeeSummary && (
            <Table>
              <thead>
                <tr>
                  <Th>שם עובד</Th>
                  <Th>מס' משמרות</Th>
                  <Th>סה"כ שעות</Th>
                  <Th>סה"כ טיפים</Th>
                  <Th>טיפ ממוצע לשעה</Th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.employeeSummary.map((emp, index) => (
                  <tr key={index}>
                    <Td>{emp.name}</Td>
                    <Td>{emp.shiftsCount}</Td>
                    <Td>{emp.totalHours}</Td>
                    <Td>₪{emp.totalTips}</Td>
                    <Td>₪{(emp.totalTips / emp.totalHours).toFixed(2)}</Td>
                  </tr>
                ))}
              </tbody>
              <TFoot>
                <tr>
                  <td colSpan="3">סה"כ טיפים:</td>
                  <td>₪{reportData.data.totalTips}</td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan="3">יתרה שלא חולקה:</td>
                  <td>₪{reportData.data.leftoverTotal}</td>
                  <td></td>
                </tr>
              </TFoot>
            </Table>
          )}
          
          {(reportData.type === 'daily' || reportData.type === 'employee') && reportData.data && (
            <Table>
              <thead>
                <tr>
                  <Th>תאריך</Th>
                  {reportData.type === 'daily' && <Th>שם</Th>}
                  <Th>שעות</Th>
                  <Th>טיפים</Th>
                  <Th>טיפ לשעה</Th>
                </tr>
              </thead>
              <tbody>
                {reportData.data.length === 0 ? (
                  <tr>
                    <td colSpan={reportData.type === 'daily' ? 5 : 4} style={{ textAlign: 'center', padding: '2rem' }}>
                      אין נתונים לתצוגה
                    </td>
                  </tr>
                ) : (
                  reportData.data.map((shift, shiftIndex) => {
                    if (reportData.type === 'employee') {
                      const employeeData = shift.employees.find(e => e.employeeId === selectedEmployee);
                      if (employeeData) {
                        return (
                          <tr key={shiftIndex}>
                            <Td>{formatDate(shift.date)}</Td>
                            <Td>{employeeData.hours}</Td>
                            <Td>₪{employeeData.tipAmount}</Td>
                            <Td>₪{(employeeData.tipAmount / employeeData.hours).toFixed(2)}</Td>
                          </tr>
                        );
                      }
                      return null;
                    } else {
                      return shift.employees.map((emp, empIndex) => (
                        <tr key={`${shiftIndex}-${empIndex}`}>
                          <Td>{formatDate(shift.date)}</Td>
                          <Td>{emp.name}</Td>
                          <Td>{emp.hours}</Td>
                          <Td>₪{emp.tipAmount}</Td>
                          <Td>₪{(emp.tipAmount / emp.hours).toFixed(2)}</Td>
                        </tr>
                      ));
                    }
                  })
                )}
              </tbody>
              {reportData.type === 'employee' && reportData.data.length > 0 && (
                <TFoot>
                  <tr>
                    <td>סה"כ</td>
                    <td>
                      {reportData.data.reduce((sum, shift) => {
                        const emp = shift.employees.find(e => e.employeeId === selectedEmployee);
                        return sum + (emp ? parseFloat(emp.hours) : 0);
                      }, 0).toFixed(1)}
                    </td>
                    <td>
                      ₪{reportData.data.reduce((sum, shift) => {
                        const emp = shift.employees.find(e => e.employeeId === selectedEmployee);
                        return sum + (emp ? emp.tipAmount : 0);
                      }, 0)}
                    </td>
                    <td>
                      ₪{(() => {
                        const totalHours = reportData.data.reduce((sum, shift) => {
                          const emp = shift.employees.find(e => e.employeeId === selectedEmployee);
                          return sum + (emp ? parseFloat(emp.hours) : 0);
                        }, 0);
                        const totalTips = reportData.data.reduce((sum, shift) => {
                          const emp = shift.employees.find(e => e.employeeId === selectedEmployee);
                          return sum + (emp ? emp.tipAmount : 0);
                        }, 0);
                        return (totalTips / totalHours).toFixed(2);
                      })()}
                    </td>
                  </tr>
                </TFoot>
              )}
            </Table>
          )}
        </Card>
      )}
    </ArchiveContainer>
  );
};

export default TipArchive;