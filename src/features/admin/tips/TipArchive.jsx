// src/features/admin/tips/TipArchive.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaChartBar, FaSearch, FaPrint, FaEdit, FaSave, FaTimes, FaUserPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { tipShiftAPI, tipEmployeeAPI } from '../../../services/api';

const ArchiveContainer = styled.div`
  padding: 2rem 0;
  
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
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
    props.danger ? 'var(--error-color)' :
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
      props.danger ? '#d32f2f' :
      '#1e3a6a'
    };
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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

const EditModeContainer = styled.div`
  margin-top: 2rem;
`;

const EmployeeForm = styled.form`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SmallButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: ${props => props.danger ? 'var(--error-color)' : 'var(--primary-color)'};
  
  &:hover {
    opacity: 0.7;
  }
`;

// פונקציה להצגת מספרים עם שתי ספרות אחרי הנקודה
function formatNumber(num) {
  return Number(num || 0).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedEmployees, setEditedEmployees] = useState([]);
  const [cashTips, setCashTips] = useState('');
  const [creditTips, setCreditTips] = useState('');
  const [existingShift, setExistingShift] = useState(null);

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
    setIsEditMode(false);
    setExistingShift(null);
    
    try {
      let data;
      
      switch (reportType) {
        case 'daily':
          const dayStart = new Date(selectedDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(selectedDate);
          dayEnd.setHours(23, 59, 59, 999);
          
          data = await tipShiftAPI.getShiftsByDateRange(dayStart, dayEnd);
          
          // בדיקת בטיחות למבנה הנתונים
          if (data && Array.isArray(data)) {
            data = data.map(shift => ({
              ...shift,
              employees: Array.isArray(shift.employees) ? shift.employees.map(emp => ({
                ...emp,
                hours: parseFloat(emp.hours) || 0,
                tipAmount: parseFloat(emp.tipAmount) || 0,
                dailyDeduction: parseFloat(emp.dailyDeduction) || 0,
                finalTipAmount: parseFloat(emp.finalTipAmount) || 0,
                hourlyRate: parseFloat(emp.hourlyRate) || 0
              })) : [],
              totalTips: parseFloat(shift.totalTips) || 0,
              leftover: parseFloat(shift.leftover) || 0
            }));
          } else {
            data = [];
          }
          
          setReportData({ type: 'daily', data });
          
          // אם יש כבר דוח ליום זה, נשמור את המזהה שלו
          if (data.length > 0) {
            setExistingShift(data[0]);
          }
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
          
          // בדיקת בטיחות למבנה הנתונים
          if (data && Array.isArray(data)) {
            data = data.map(shift => ({
              ...shift,
              employees: Array.isArray(shift.employees) ? shift.employees.map(emp => ({
                ...emp,
                hours: parseFloat(emp.hours) || 0,
                tipAmount: parseFloat(emp.tipAmount) || 0,
                dailyDeduction: parseFloat(emp.dailyDeduction) || 0,
                finalTipAmount: parseFloat(emp.finalTipAmount) || 0,
                hourlyRate: parseFloat(emp.hourlyRate) || 0
              })) : []
            }));
          } else {
            data = [];
          }
          
          const employeeName = employees.find(e => e.id === selectedEmployee)?.name;
          setReportData({ type: 'employee', data, employeeName });
          break;
          
        case 'monthly':
          data = await tipShiftAPI.getMonthlyReport(selectedYear, selectedMonth);
          
          // בדיקת בטיחות למבנה הנתונים
          if (data && data.employeeSummary && Array.isArray(data.employeeSummary)) {
            data.employeeSummary = data.employeeSummary.map(emp => ({
              ...emp,
              totalHours: parseFloat(emp.totalHours) || 0,
              totalTips: parseFloat(emp.totalTips) || 0,
              totalDeductions: parseFloat(emp.totalDeductions) || 0,
              finalTips: parseFloat(emp.finalTips) || 0
            }));
            data.totalTips = parseFloat(data.totalTips) || 0;
            data.totalDeductions = parseFloat(data.totalDeductions) || 0;
            data.totalFinalTips = parseFloat(data.totalFinalTips) || 0;
            data.leftoverTotal = parseFloat(data.leftoverTotal) || 0;
          }
          
          setReportData({ type: 'monthly', data });
          break;
      }
      
      toast.success('הדוח נוצר בהצלחה');
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('שגיאה ביצירת הדוח');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (reportData && reportData.type === 'daily' && reportData.data.length > 0) {
      const shift = reportData.data[0];
      setEditedEmployees(shift.employees.map(emp => ({
        ...emp,
        hours: emp.hours.toString(),
        tipAmount: emp.tipAmount || 0,
        hourlyDeduction: emp.hourlyDeduction || 20,
        dailyDeduction: emp.dailyDeduction || (emp.hours * 20),
        finalTipAmount: emp.finalTipAmount || emp.tipAmount,
        hourlyRate: emp.hourlyRate || 0
      })));
      
      // תמיכה במבנה החדש והישן
      if (shift.cashTips !== undefined && shift.creditTips !== undefined) {
        setCashTips(shift.cashTips.toString());
        setCreditTips(shift.creditTips.toString());
      } else {
        // תמיכה במבנה הישן
        setCashTips(shift.totalTips.toString());
        setCreditTips('0');
      }
      
      setIsEditMode(true);
    }
  };

  const handleAddEmployee = () => {
    setEditedEmployees([
      ...editedEmployees,
      {
        employeeId: '',
        name: '',
        hours: '',
        tipAmount: 0,
        hourlyDeduction: 20,
        dailyDeduction: 0,
        finalTipAmount: 0,
        hourlyRate: 0
      }
    ]);
  };

  const handleEmployeeChange = (index, field, value) => {
    const newEmployees = [...editedEmployees];
    
    if (field === 'employeeId') {
      const selectedEmp = employees.find(e => e.id === value);
      if (selectedEmp) {
        newEmployees[index] = {
          ...newEmployees[index],
          employeeId: value,
          name: selectedEmp.name,
          hourlyDeduction: selectedEmp.hourlyDeduction || 20
        };
      }
    } else {
      newEmployees[index] = {
        ...newEmployees[index],
        [field]: value
      };
    }
    
    setEditedEmployees(newEmployees);
  };

  const handleRemoveEmployee = (index) => {
    const newEmployees = editedEmployees.filter((_, i) => i !== index);
    setEditedEmployees(newEmployees);
  };

  const calculateTipsForEdit = () => {
    const parsedCashTips = parseFloat(cashTips);
    const parsedCreditTips = parseFloat(creditTips);
    
    if (isNaN(parsedCashTips) || isNaN(parsedCreditTips)) return;

    // חישוב סך ההפרשות של כל העובדים
    const totalDeductions = editedEmployees.reduce((sum, emp) => {
      const hours = parseFloat(emp.hours || 0);
      const employee = employees.find(e => e.id === emp.employeeId);
      const hourlyDeduction = employee?.hourlyDeduction || 20;
      return sum + (hours * hourlyDeduction);
    }, 0);
    
    // חישוב כסף מהקופה
    const cashFromRegister = Math.max(0, parsedCreditTips - totalDeductions);
    
    // חישוב סך הטיפים לחלוקה
    const totalTipsForDistribution = parsedCashTips + cashFromRegister;

    const totalHours = editedEmployees.reduce((sum, emp) => 
      sum + (parseFloat(emp.hours) || 0), 0);
    
    if (totalHours === 0) return;

    const updatedEmployees = editedEmployees.map(emp => {
      const hours = parseFloat(emp.hours) || 0;
      const ratio = hours / totalHours;
      const exactAmount = totalTipsForDistribution * ratio;
      
      // חישוב הפרשות
      const employee = employees.find(e => e.id === emp.employeeId);
      const hourlyDeduction = employee?.hourlyDeduction || 20;
      const dailyDeduction = hours * hourlyDeduction;
      
      // החסרת הפרשות מהסכום המדויק ואז עיגול
      const exactAmountAfterDeduction = Math.max(0, exactAmount - dailyDeduction);
      const finalTipAmount = Math.floor(exactAmountAfterDeduction);
      const hourlyRate = hours > 0 ? (finalTipAmount / hours) : 0;
      
      return {
        ...emp,
        tipAmount: Math.floor(exactAmount), // סכום לפני הפרשות (לצורך הצגה)
        ratio,
        hourlyDeduction,
        dailyDeduction,
        finalTipAmount,
        hourlyRate
      };
    });

    setEditedEmployees(updatedEmployees);
  };

  const handleSaveEdit = async () => {
    try {
      setLoading(true);

      const parsedCashTips = parseFloat(cashTips);
      const parsedCreditTips = parseFloat(creditTips);
      
      // חישוב סך ההפרשות של כל העובדים
      const totalDeductions = editedEmployees.reduce((sum, emp) => {
        const hours = parseFloat(emp.hours || 0);
        const employee = employees.find(e => e.id === emp.employeeId);
        const hourlyDeduction = employee?.hourlyDeduction || 20;
        return sum + (hours * hourlyDeduction);
      }, 0);
      
      // חישוב כסף מהקופה
      const cashFromRegister = Math.max(0, parsedCreditTips - totalDeductions);
      
      // חישוב סך הטיפים לחלוקה
      const totalTipsForDistribution = parsedCashTips + cashFromRegister;
      
      // חישוב היתרה - רק השקלים הבודדים שיצאו מהחישוב בגלל העיגול
      const totalExactAmountAfterDeduction = editedEmployees.reduce((sum, emp) => {
        const hours = parseFloat(emp.hours || 0);
        const totalHours = editedEmployees.reduce((sum, emp) => sum + parseFloat(emp.hours || 0), 0);
        const ratio = hours / totalHours;
        const exactAmount = totalTipsForDistribution * ratio;
        const dailyDeduction = hours * (emp.hourlyDeduction || 20);
        const exactAmountAfterDeduction = Math.max(0, exactAmount - dailyDeduction);
        return sum + exactAmountAfterDeduction;
      }, 0);
      
      const distributedTips = editedEmployees.reduce((sum, emp) => sum + emp.finalTipAmount, 0);
      const leftover = totalExactAmountAfterDeduction - distributedTips;

      const shiftData = {
        date: new Date(selectedDate),
        cashTips: parsedCashTips,
        creditTips: parsedCreditTips,
        totalDeductions,
        cashFromRegister,
        totalTipsForDistribution,
        employees: editedEmployees.map(emp => ({
          ...emp,
          hours: parseFloat(emp.hours),
          tipAmount: emp.tipAmount,
          hourlyDeduction: emp.hourlyDeduction,
          dailyDeduction: emp.dailyDeduction,
          finalTipAmount: emp.finalTipAmount,
          hourlyRate: emp.hourlyRate
        })),
        leftover,
        createdBy: existingShift?.createdBy || 'admin', // צריך להחליף עם המשתמש הנוכחי
      };

      if (existingShift) {
        await tipShiftAPI.updateShift(existingShift.id, shiftData);
        toast.success('הדוח עודכן בהצלחה');
      } else {
        await tipShiftAPI.saveShift(shiftData);
        toast.success('הדוח נשמר בהצלחה');
      }

      setIsEditMode(false);
      generateReport(); // רענון הדוח
    } catch (err) {
      toast.error('שגיאה בשמירת הדוח');
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
              <th>סה"כ טיפים לפני הפרשה</th>
              <th>סה"כ הפרשות</th>
              <th>סה"כ טיפים סופי</th>
              <th>שכר שעתי ממוצע</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.data.employeeSummary.map(emp => {
              const totalDeductions = emp.totalDeductions || (emp.totalHours * 20);
              const finalTips = emp.finalTips || Math.max(0, emp.totalTips - totalDeductions);
              const avgHourlyRate = emp.totalHours > 0 ? (finalTips / emp.totalHours).toFixed(2) : '0.00';
              
              return `
                <tr>
                  <td>${emp.name}</td>
                  <td>${emp.shiftsCount}</td>
                  <td>${formatNumber(emp.totalHours)}</td>
                  <td style={{ color: '#2563eb', fontWeight: '600' }}>₪${formatNumber(emp.totalTips)}</td>
                  <td>-₪${formatNumber(totalDeductions)}</td>
                  <td>₪${formatNumber(finalTips)}</td>
                  <td>₪${avgHourlyRate}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">סה"כ טיפים:</td>
              <td style={{ fontWeight: '600' }}>₪${formatNumber(reportData.data.totalTips)}</td>
              <td style={{ fontWeight: '600' }}>-₪${formatNumber(reportData.data.totalDeductions)}</td>
              <td style={{ fontWeight: '600' }}>₪${formatNumber(reportData.data.totalFinalTips)}</td>
              <td></td>
            </tr>
            <tr>
              <td colspan="3">יתרה שלא חולקה:</td>
              <td>₪${formatNumber(reportData.data.leftoverTotal)}</td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      `;
    } else if (reportData.data) {
      const tableHeader = `
        <tr>
          <th>תאריך</th>
          <th>שם</th>
          <th>שעות</th>
          <th>סכום סופי לתשלום</th>
          <th>שכר שעתי ממוצע</th>
        </tr>
      `;
      
      let tableRows = '';
      
      reportData.data.forEach(shift => {
        if (reportData.type === 'employee') {
          const employeeData = shift.employees.find(e => e.employeeId === selectedEmployee);
          if (employeeData) {
            const finalAmount = employeeData.finalTipAmount || employeeData.tipAmount;
            const hourlyRate = employeeData.hourlyRate || (finalAmount / employeeData.hours).toFixed(2);
            tableRows += `
              <tr>
                <td>${formatDate(shift.date)}</td>
                <td>${employeeData.name}</td>
                <td>${formatNumber(employeeData.hours)}</td>
                <td style={{ color: '#7c3aed', fontWeight: '700' }}>₪${formatNumber(finalAmount)}</td>
                <td style={{ color: '#059669', fontWeight: '600' }}>₪${formatNumber(hourlyRate)}</td>
              </tr>
            `;
          }
        } else {
          shift.employees.forEach(emp => {
            const finalAmount = emp.finalTipAmount || emp.tipAmount;
            const dailyDeduction = emp.dailyDeduction || (emp.hours * 20);
            const hourlyRate = emp.hourlyRate || (finalAmount / emp.hours).toFixed(2);
            tableRows += `
              <tr>
                <td>${formatDate(shift.date)}</td>
                <td>${emp.name}</td>
                <td>${formatNumber(emp.hours)}</td>
                <td style={{ color: '#7c3aed', fontWeight: '700' }}>₪${formatNumber(finalAmount)}</td>
                <td style={{ color: '#059669', fontWeight: '600' }}>₪${formatNumber(hourlyRate)}</td>
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
        
        const totalFinalTips = reportData.data.reduce((sum, shift) => {
          const emp = shift.employees.find(e => e.employeeId === selectedEmployee);
          const finalAmount = emp ? (emp.finalTipAmount || emp.tipAmount) : 0;
          return sum + finalAmount;
        }, 0);
        
        const avgTipPerHour = totalHours > 0 ? (totalFinalTips / totalHours).toFixed(2) : '0.00';
        
        tableFooter = `
          <tfoot>
            <tr>
              <td>סה"כ</td>
              <td>${formatNumber(totalHours)}</td>
              <td>₪${formatNumber(totalFinalTips)}</td>
              <td>₪${formatNumber(avgTipPerHour)}</td>
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
            ${tableRows || '<tr><td colspan="7" style="text-align: center; padding: 20px;">אין נתונים לתצוגה</td></tr>'}
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
          <p>כל הזכויות שמורות © ${new Date().getFullYear()}</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    
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
      
      {reportData && reportData.data && (
        <Card>
          <ReportHeader>
            <ReportTitle>{getReportTitle()}</ReportTitle>
            <ButtonGroup>
              {reportData.type === 'daily' && !isEditMode && (
                <Button secondary onClick={handleEditClick}>
                  <FaEdit />
                  ערוך
                </Button>
              )}
              <Button secondary onClick={handlePrint}>
                <FaPrint />
                הדפס
              </Button>
            </ButtonGroup>
          </ReportHeader>
          
          {isEditMode ? (
            <EditModeContainer>
              <FormRow columns="1fr 1fr">
                <FormGroup>
                  <Label>טיפים במזומן</Label>
                  <Input
                    type="number"
                    value={cashTips}
                    onChange={(e) => setCashTips(e.target.value)}
                    onBlur={calculateTipsForEdit}
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>טיפים באשראי</Label>
                  <Input
                    type="number"
                    value={creditTips}
                    onChange={(e) => setCreditTips(e.target.value)}
                    onBlur={calculateTipsForEdit}
                  />
                </FormGroup>
              </FormRow>
              
              <h3>עובדים במשמרת</h3>
              
              {editedEmployees.map((emp, index) => (
                <EmployeeForm key={index}>
                  <FormGroup>
                    <Label>בחר עובד</Label>
                    <Select
                      value={emp.employeeId}
                      onChange={(e) => handleEmployeeChange(index, 'employeeId', e.target.value)}
                    >
                      <option value="">בחר עובד</option>
                      {employees.filter(e => e.isActive).map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>שעות</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={emp.hours}
                      onChange={(e) => handleEmployeeChange(index, 'hours', e.target.value)}
                      onBlur={calculateTipsForEdit}
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>טיפים לפני הפרשה</Label>
                    <Input
                      type="number"
                      value={emp.tipAmount}
                      readOnly
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>הפרשה יומית</Label>
                    <Input
                      type="number"
                      value={emp.dailyDeduction || (parseFloat(emp.hours) * 20)}
                      readOnly
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>סכום סופי לתשלום</Label>
                    <Input
                      type="number"
                      value={emp.finalTipAmount || emp.tipAmount}
                      readOnly
                      style={{ color: '#7c3aed', fontWeight: '700' }}
                    />
                  </FormGroup>
                  
                  <SmallButton type="button" onClick={() => handleRemoveEmployee(index)} danger>
                    <FaTrash />
                  </SmallButton>
                </EmployeeForm>
              ))}
              
              <Button type="button" secondary onClick={handleAddEmployee}>
                <FaUserPlus />
                הוסף עובד
              </Button>
              
              <ButtonGroup style={{ marginTop: '1rem' }}>
                <Button success onClick={handleSaveEdit} disabled={loading}>
                  <FaSave />
                  שמור שינויים
                </Button>
                <Button danger onClick={() => setIsEditMode(false)}>
                  <FaTimes />
                  בטל
                </Button>
              </ButtonGroup>
            </EditModeContainer>
          ) : (
            <>
              {reportData.type === 'monthly' && reportData.data && reportData.data.employeeSummary && Array.isArray(reportData.data.employeeSummary) && (
                <Table>
                  <thead>
                    <tr>
                      <Th>שם עובד</Th>
                      <Th>מס' משמרות</Th>
                      <Th>סה"כ שעות</Th>
                      <Th>סה"כ טיפים לפני הפרשה</Th>
                      <Th>סה"כ הפרשות</Th>
                      <Th>סה"כ טיפים סופי</Th>
                      <Th>שכר שעתי ממוצע</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.data.employeeSummary || []).map((emp, index) => {
                      const totalDeductions = emp.totalDeductions || (emp.totalHours * 20);
                      const finalTips = emp.finalTips || Math.max(0, emp.totalTips - totalDeductions);
                      const avgHourlyRate = emp.totalHours > 0 ? (finalTips / emp.totalHours).toFixed(2) : '0.00';
                      
                      return (
                        <tr key={index}>
                          <Td>{emp.name}</Td>
                          <Td>{emp.shiftsCount}</Td>
                          <Td>{formatNumber(emp.totalHours)}</Td>
                          <Td style={{ color: '#2563eb', fontWeight: '600' }}>₪{formatNumber(emp.totalTips)}</Td>
                          <Td style={{ color: '#dc2626', fontWeight: '600' }}>-₪{formatNumber(totalDeductions)}</Td>
                          <Td style={{ color: '#7c3aed', fontWeight: '700' }}>₪{formatNumber(finalTips)}</Td>
                          <Td style={{ color: '#059669', fontWeight: '600' }}>₪{formatNumber(avgHourlyRate)}</Td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <TFoot>
                    <tr>
                      <td colSpan="3">סה"כ טיפים:</td>
                      <td style={{ fontWeight: '600' }}>₪{formatNumber(reportData.data.totalTips)}</td>
                      <td style={{ fontWeight: '600' }}>-₪{formatNumber(reportData.data.totalDeductions)}</td>
                      <td style={{ fontWeight: '600' }}>₪{formatNumber(reportData.data.totalFinalTips)}</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td colSpan="3">יתרה שלא חולקה:</td>
                      <td>₪{formatNumber(reportData.data.leftoverTotal)}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </TFoot>
                </Table>
              )}
              
              {(reportData.type === 'daily' || reportData.type === 'employee') && reportData.data && Array.isArray(reportData.data) && (
                <Table>
                  <thead>
                    <tr>
                      <Th>תאריך</Th>
                      <Th>שם</Th>
                      <Th>שעות</Th>
                      <Th>סכום סופי לתשלום</Th>
                      <Th>שכר שעתי ממוצע</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {!reportData.data || reportData.data.length === 0 ? (
                      <tr>
                        <td colSpan={reportData.type === 'daily' ? 7 : 4} style={{ textAlign: 'center', padding: '2rem' }}>
                          אין נתונים לתצוגה
                        </td>
                      </tr>
                    ) : (
                      (reportData.data || []).map((shift, shiftIndex) => {
                        if (reportData.type === 'employee') {
                          const employeeData = (shift.employees || []).find(e => e.employeeId === selectedEmployee);
                          if (employeeData) {
                            const finalAmount = employeeData.finalTipAmount || employeeData.tipAmount;
                            const hourlyRate = employeeData.hourlyRate || (finalAmount / employeeData.hours).toFixed(2);
                            return (
                              <tr key={shiftIndex}>
                                <Td>{formatDate(shift.date)}</Td>
                                <Td>{employeeData.name}</Td>
                                <Td>{formatNumber(employeeData.hours)}</Td>
                                <Td style={{ color: '#7c3aed', fontWeight: '700' }}>₪{formatNumber(finalAmount)}</Td>
                                <Td style={{ color: '#059669', fontWeight: '600' }}>₪{formatNumber(hourlyRate)}</Td>
                              </tr>
                            );
                          }
                          return null;
                        } else {
                          return (shift.employees || []).map((emp, empIndex) => {
                            const finalAmount = emp.finalTipAmount || emp.tipAmount;
                            const dailyDeduction = emp.dailyDeduction || (emp.hours * 20);
                            const hourlyRate = emp.hourlyRate || (finalAmount / emp.hours).toFixed(2);
                            return (
                              <tr key={`${shiftIndex}-${empIndex}`}>
                                <Td>{formatDate(shift.date)}</Td>
                                <Td>{emp.name}</Td>
                                <Td>{formatNumber(emp.hours)}</Td>
                                <Td style={{ color: '#7c3aed', fontWeight: '700' }}>₪{formatNumber(finalAmount)}</Td>
                                <Td style={{ color: '#059669', fontWeight: '600' }}>₪{formatNumber(hourlyRate)}</Td>
                              </tr>
                            );
                          });
                        }
                      })
                    )}
                  </tbody>
                  {reportData.type === 'daily' && reportData.data && reportData.data.length > 0 && (
                    <TFoot>
                      <tr>
                        <td colSpan="2">סה"כ טיפים:</td>
                        <td></td>
                        <td style={{ fontWeight: '600' }}>₪{formatNumber(reportData.data[0].totalTips)}</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td colSpan="2">סה"כ הפרשות:</td>
                        <td></td>
                        <td style={{ fontWeight: '600', color: '#dc2626' }}>-₪{formatNumber((reportData.data[0].employees || []).reduce((sum, emp) => sum + (emp.dailyDeduction || ((emp.hours || 0) * 20)), 0))}</td>
                      </tr>
                      <tr>
                        <td colSpan="2">סה"כ טיפים שחולקו:</td>
                        <td></td>
                        <td style={{ fontWeight: '600', color: '#7c3aed' }}>₪{formatNumber((reportData.data[0].employees || []).reduce((sum, emp) => sum + (emp.finalTipAmount || emp.tipAmount || 0), 0))}</td>
                      </tr>
                      <tr>
                        <td colSpan="2">יתרה שלא חולקה:</td>
                        <td></td>
                        <td style={{ fontWeight: '600' }}>₪{formatNumber(reportData.data[0].leftover)}</td>
                      </tr>
                    </TFoot>
                  )}
                  {reportData.type === 'employee' && reportData.data && reportData.data.length > 0 && (
                    <TFoot>
                      <tr>
                        <td>סה"כ</td>
                        <td>
                          {(reportData.data || []).reduce((sum, shift) => {
                            const emp = (shift.employees || []).find(e => e.employeeId === selectedEmployee);
                            return sum + (emp ? parseFloat(emp.hours) : 0);
                          }, 0).toFixed(1)}
                        </td>
                        <td>
                          ₪{(() => {
                            const totalFinalTips = (reportData.data || []).reduce((sum, shift) => {
                              const emp = (shift.employees || []).find(e => e.employeeId === selectedEmployee);
                              const finalAmount = emp ? (emp.finalTipAmount || emp.tipAmount) : 0;
                              return sum + finalAmount;
                            }, 0);
                            return formatNumber(totalFinalTips);
                          })()}
                        </td>
                        <td>
                          ₪{(() => {
                            const totalHours = (reportData.data || []).reduce((sum, shift) => {
                              const emp = (shift.employees || []).find(e => e.employeeId === selectedEmployee);
                              return sum + (emp ? parseFloat(emp.hours) : 0);
                            }, 0);
                            const totalFinalTips = (reportData.data || []).reduce((sum, shift) => {
                              const emp = (shift.employees || []).find(e => e.employeeId === selectedEmployee);
                              const finalAmount = emp ? (emp.finalTipAmount || emp.tipAmount) : 0;
                              return sum + finalAmount;
                            }, 0);
                            return formatNumber(totalHours > 0 ? (totalFinalTips / totalHours) : 0);
                          })()}
                        </td>
                      </tr>
                    </TFoot>
                  )}
                </Table>
              )}
            </>
          )}
        </Card>
      )}
    </ArchiveContainer>
  );
};

export default TipArchive;