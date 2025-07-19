import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Modal from './ui/Modal';

interface Installment {
  installmentNumber: number;
  paymentDate: string;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
  notes?: string;
}

interface PDFPrinterProps {
  schedule: Installment[];
  loanParams: {
    amount: number;
    term: number;
    interestRate: number;
    rateType: string;
    startDate: string;
    firstPaymentDate: string;
    balloonPayment?: number;
  } | null;
}

const PDFPrinter: React.FC<PDFPrinterProps> = ({ schedule, loanParams }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const generatePDF = async () => {
    if (!schedule.length || !loanParams) return;

    // Crear un elemento temporal para renderizar el contenido
    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '800px';
    printContainer.style.backgroundColor = 'white';
    printContainer.style.padding = '40px';
    printContainer.style.fontFamily = 'Arial, sans-serif';
    printContainer.style.color = '#333';
    printContainer.style.lineHeight = '1.6';



    // Generar el contenido HTML
    printContainer.innerHTML = `
          <div style="margin-bottom: 30px;">
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 20px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="flex: 1;">
              <img src="/images/logo-black.png" alt="BeSharpX" style="height: 50px; width: auto;">
            </div>
            
            <div style="flex: 1.5; text-align: left; padding-left: 20px;">
              <div style="font-size: 20px; font-weight: bold; white-space: nowrap;">
                <span style="color: #d4af37;">Simulación creada por</span> <span style="color: #000000;">BeSharpX</span>
              </div>
            </div>
            
            <div style="flex: 1; text-align: right;">
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 4px;">
                Generado el
              </div>
              <div style="font-size: 16px; font-weight: 600; color: #374151;">
                ${new Date().toLocaleDateString('es-CL', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>



      <div style="margin-bottom: 30px; padding: 20px; background: #f5f5dc; border-radius: 12px; border: 2px solid #d2b48c;">
        <div style="display: flex; justify-content: space-between; gap: 15px;">
          <div style="flex: 1; background: #8b7355; border-radius: 8px; padding: 8px; text-align: center; border: 2px solid #9370db;">
            <div style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 3px;">
              $${loanParams.amount.toLocaleString('es-CL')}
            </div>
            <div style="font-size: 11px; color: white;">
              Monto
            </div>
          </div>
          
          <div style="flex: 1; background: #8b7355; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 3px;">
              ${loanParams.interestRate}%
            </div>
            <div style="font-size: 11px; color: white;">
              Tasa mensual
            </div>
          </div>
          
          <div style="flex: 1; background: #8b7355; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 3px;">
              $${schedule[0]?.totalPayment.toLocaleString('es-CL') || '0'}
            </div>
            <div style="font-size: 11px; color: white;">
              Cuota mensual
            </div>
          </div>
          
          <div style="flex: 1; background: #8b7355; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 20px; font-weight: bold; color: white; margin-bottom: 3px;">
              ${loanParams.term}
            </div>
            <div style="font-size: 11px; color: white;">
              Meses
            </div>
          </div>
        </div>
      </div>



      <div style="margin-bottom: 30px;">
        <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">Cronograma</h3>
        <div style="background: white; border-radius: 12px; padding: 20px; border: 2px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          ${(() => {
            // Crear calendario por años
            const years: any = {};
            const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
            
            // Agrupar pagos por año y mes
            schedule.forEach(installment => {
              const date = new Date(installment.paymentDate);
              const year = date.getFullYear();
              const month = date.getMonth();
              
              if (!years[year]) {
                years[year] = Array(12).fill(null);
              }
              years[year][month] = date.getDate();
            });
            
            // Generar HTML del calendario con cards
            let calendarHTML = '';
            
            calendarHTML += `
              <div style="display: grid; grid-template-columns: 60px repeat(12, 1fr); gap: 8px; margin-bottom: 15px;">
                <div style="font-size: 12px; font-weight: bold; color: #6b7280; text-align: center; padding: 8px;">Año</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">☀️</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">Feb</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">🎓</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">Abr</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">May</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">Jun</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">Jul</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">Ago</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">
                  <img src="/images/bandera-chile.png" style="width: 20px; height: 15px; object-fit: contain; transform: translateY(6px);">
                </div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">Oct</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">Nov</div>
                <div style="font-size: 16px; font-weight: bold; text-align: center; padding: 8px; display: flex; align-items: center; justify-content: center;">🎅</div>
              </div>
            `;
            
            // Agregar filas por año
            Object.keys(years).sort().forEach(year => {
              calendarHTML += `
                <div style="display: grid; grid-template-columns: 60px repeat(12, 1fr); gap: 8px; margin-bottom: 15px;">
                  <div style="font-size: 14px; font-weight: bold; color: #1f2937; text-align: center; padding: 8px; background: #f8fafc; border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                    ${year}
                  </div>
                  ${years[year].map((day: any) => {
                    if (day) {
                      return `
                        <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 12px 8px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); display: flex; align-items: center; justify-content: center; min-height: 40px;">
                          <div style="font-size: 14px; font-weight: bold; line-height: 1;">${day}</div>
                        </div>
                      `;
                    } else {
                      return `
                        <div style="background: #f3f4f6; color: #9ca3af; padding: 12px 8px; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center; min-height: 40px;">
                          <div style="font-size: 14px; line-height: 1;">-</div>
                        </div>
                      `;
                    }
                  }).join('')}
                </div>
              `;
            });
            
            return calendarHTML;
          })()}
        </div>
      </div>



      <div style="margin-top: 20px; padding: 20px; background-color: #f3f4f6; border-left: 4px solid #3b82f6; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="font-size: 14px; color: #374151; line-height: 1.6;">
          <strong>⚠️ Información Importante:</strong> Endeudarse es un compromiso financiero que debe realizarse con responsabilidad. Este simulador es una herramienta informativa para ayudarte a tomar decisiones conscientes sobre tu capacidad de pago. Te recomendamos evaluar cuidadosamente tu situación financiera antes de asumir cualquier compromiso crediticio.
        </div>
      </div>
    `;

    // Agregar al DOM temporalmente
    document.body.appendChild(printContainer);

    try {
      // Convertir a canvas
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: printContainer.scrollHeight
      });

      // Crear PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Primera página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Páginas adicionales si es necesario
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Abrir en nueva ventana
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const newWindow = window.open(pdfUrl, '_blank');
      if (newWindow) {
        newWindow.focus();
      }

      // Limpiar URL después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(pdfUrl);
      }, 1000);

    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      // Limpiar elemento temporal
      document.body.removeChild(printContainer);
    }
  };

  const handlePrintClick = () => {
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    generatePDF();
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        onClick={handlePrintClick}
        className={`p-3 rounded-lg transition-all duration-200 ml-8 ${
          isModalOpen 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-white text-blue-600 hover:bg-blue-50 border border-blue-200'
        }`}
        title="Imprimir cronograma"
        disabled={!schedule.length || !loanParams}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Generar PDF del Cronograma"
        confirmText="Generar PDF"
        cancelText="Cancelar"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            ¿Deseas generar un PDF con el cronograma de amortización?
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              El documento incluirá recomendaciones, notas importantes y un diagrama con los pagos teóricos futuros.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> El PDF se abrirá en una nueva ventana del navegador.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PDFPrinter; 